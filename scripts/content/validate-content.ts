import fs from "node:fs";
import path from "node:path";
import { listContentFiles, readContentFile } from "../../src/lib/content/files";
import { pageFrontmatterSchema, SCHEMA_BY_CATEGORY } from "../../src/lib/content/schemas";
import { validateParsedContent } from "../../src/lib/content/parse";
import { extractBlocks, type SourceBlock } from "../../src/lib/content/source-blocks";
import {
  sourceManifestSchema,
  blockDecisionsSchema,
  readValidatedJson,
  resolveSourcePath,
  validateManifestChecksums,
  validateBlockDecisions,
} from "../../src/lib/content/source-validation";

const CONTENT_ROOT = path.resolve(process.cwd(), "content");
const RESEARCH_ROOT = path.resolve(process.cwd(), "research");
const MANIFEST_PATH = path.join(RESEARCH_ROOT, "source-manifest.json");
const DECISIONS_PATH = path.join(RESEARCH_ROOT, "block-decisions.json");

interface ValidationError {
  /** Fully-formatted, print-ready message (file path included exactly once). */
  message: string;
}

function main() {
  const errors: ValidationError[] = [];
  const categories = ["plan", "bases", "routes", "things-to-do", "practical"];

  let fileCount = 0;

  for (const category of categories) {
    const dir = path.join(CONTENT_ROOT, category);
    const files = listContentFiles(dir);

    for (const filePath of files) {
      fileCount++;
      const { frontmatter, body } = readContentFile(filePath);
      const relPath = path.relative(process.cwd(), filePath);

      // Validate frontmatter against the category-specific schema
      const schema = SCHEMA_BY_CATEGORY[category] ?? pageFrontmatterSchema;

      const parsed = schema.safeParse(frontmatter);
      if (!parsed.success) {
        for (const issue of parsed.error.issues) {
          errors.push({
            message: `${relPath}: Frontmatter: ${issue.path.join(".")} - ${issue.message}`,
          });
        }
      }

      // Validate content. `validateParsedContent` already prefixes each
      // message with the file path, so it isn't repeated here.
      const contentErrors = validateParsedContent(body, relPath);
      for (const err of contentErrors) {
        errors.push({ message: err.message });
      }
    }
  }

  // Validate the research corpus: raw source checksums must match the
  // manifest, and every extracted block must have an explicit decision.
  let blockCount = 0;
  if (fs.existsSync(MANIFEST_PATH)) {
    const manifestResult = readValidatedJson(
      MANIFEST_PATH,
      "research/source-manifest.json",
      sourceManifestSchema
    );
    errors.push(...manifestResult.errors);

    const decisionsResult = fs.existsSync(DECISIONS_PATH)
      ? readValidatedJson(
          DECISIONS_PATH,
          "research/block-decisions.json",
          blockDecisionsSchema
        )
      : { data: {}, errors: [] };
    errors.push(...decisionsResult.errors);

    if (manifestResult.data) {
      const manifest = manifestResult.data;
      const checksumErrors = validateManifestChecksums(manifest, process.cwd());
      errors.push(...checksumErrors);

      const allBlocks: SourceBlock[] = [];
      for (const entry of manifest) {
        const absPath = resolveSourcePath(entry.path, process.cwd());
        if (!absPath || !fs.existsSync(absPath)) continue;
        const markdown = fs.readFileSync(absPath, "utf-8");
        allBlocks.push(
          ...extractBlocks(markdown, entry.slug, entry.stopHeadings)
        );
      }
      blockCount = allBlocks.length;
      if (decisionsResult.data) {
        errors.push(
          ...validateBlockDecisions(allBlocks, decisionsResult.data)
        );
      }
    }
  }

  if (errors.length > 0) {
    console.error("\n❌ Content validation failed:\n");
    for (const err of errors) {
      console.error(`  ${err.message}`);
    }
    console.error(`\n${errors.length} error(s) found.\n`);
    process.exit(1);
  }

  console.log(
    `\n✅ Content validation passed (${fileCount} file(s), ${blockCount} research block(s) checked).\n`
  );
  process.exit(0);
}

main();
