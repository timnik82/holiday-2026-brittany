import path from "node:path";
import { listContentFiles, readContentFile } from "../../src/lib/content/files";
import { pageFrontmatterSchema, practicalFrontmatterSchema } from "../../src/lib/content/schemas";
import { validateParsedContent } from "../../src/lib/content/parse";
import type { z } from "zod";

const CONTENT_ROOT = path.resolve(process.cwd(), "content");

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

      // Validate frontmatter
      let schema: z.ZodType;
      if (category === "practical" || category === "plan") {
        schema = practicalFrontmatterSchema;
      } else {
        schema = pageFrontmatterSchema;
      }

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
