import path from "node:path";
import { listContentFiles, readContentFile } from "../../src/lib/content/files";
import {
  pageFrontmatterSchema,
  baseFrontmatterSchema,
  routeFrontmatterSchema,
  thingsToDoFrontmatterSchema,
  practicalFrontmatterSchema,
} from "../../src/lib/content/schemas";
import { validateParsedContent } from "../../src/lib/content/parse";
import type { z } from "zod";

const CONTENT_ROOT = path.resolve(process.cwd(), "content");

/**
 * Per-category frontmatter schema. Each content type validates its specific
 * extended fields (region for bases, mode for routes, etc.) instead of falling
 * back to the generic page schema.
 */
const SCHEMA_BY_CATEGORY: Record<string, z.ZodType> = {
  plan: practicalFrontmatterSchema,
  bases: baseFrontmatterSchema,
  routes: routeFrontmatterSchema,
  "things-to-do": thingsToDoFrontmatterSchema,
  practical: practicalFrontmatterSchema,
};

interface ValidationError {
  file: string;
  reason: string;
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
            file: relPath,
            reason: `Frontmatter: ${issue.path.join(".")} - ${issue.message}`,
          });
        }
      }

      // Validate content
      const contentErrors = validateParsedContent(body, relPath);
      for (const err of contentErrors) {
        errors.push({ file: relPath, reason: err.message });
      }
    }
  }

  if (errors.length > 0) {
    console.error("\n❌ Content validation failed:\n");
    for (const err of errors) {
      console.error(`  ${err.file}: ${err.reason}`);
    }
    console.error(`\n${errors.length} error(s) found.\n`);
    process.exit(1);
  }

  console.log(`\n✅ Content validation passed (${fileCount} file(s) checked).\n`);
  process.exit(0);
}

main();
