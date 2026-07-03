import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
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
import { evidenceRegistrySchema } from "../../src/lib/content/evidence";
import { coverageSchema, validateCoverage } from "../../src/lib/content/coverage";
import { baseRankingsSchema } from "../../src/lib/ranking/schema";
import { RANKING_DIMENSIONS } from "../../src/lib/ranking/weights";
import { bathingLocationsSchema } from "../../src/lib/ranking/bathing-schema";
import { BATHING_DIMENSIONS } from "../../src/lib/ranking/bathing-dimensions";

const CONTENT_ROOT = path.resolve(process.cwd(), "content");
const RESEARCH_ROOT = path.resolve(process.cwd(), "research");
const MANIFEST_PATH = path.join(RESEARCH_ROOT, "source-manifest.json");
const DECISIONS_PATH = path.join(RESEARCH_ROOT, "block-decisions.json");
const EVIDENCE_DIR = path.join(RESEARCH_ROOT, "evidence");
const COVERAGE_PATH = path.join(RESEARCH_ROOT, "coverage.json");
const RANKINGS_PATH = path.resolve(process.cwd(), "content", "rankings", "bases.json");
const SWIMMING_PATH = path.resolve(process.cwd(), "content", "swimming", "locations.json");

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

        // Validate evidence registry and coverage completeness.
        const evidenceFiles = fs.existsSync(EVIDENCE_DIR)
          ? fs.readdirSync(EVIDENCE_DIR).filter((name) => name.endsWith(".json")).sort()
          : [];
        const evidenceRecords: z.infer<typeof evidenceRegistrySchema> = [];
        let evidenceFilesValid = true;
        for (const fileName of evidenceFiles) {
          const displayPath = `research/evidence/${fileName}`;
          const evidenceResult = readValidatedJson(
            path.join(EVIDENCE_DIR, fileName),
            displayPath,
            evidenceRegistrySchema
          );
          errors.push(...evidenceResult.errors);
          if (evidenceResult.data) {
            evidenceRecords.push(...evidenceResult.data);
          } else {
            evidenceFilesValid = false;
          }
        }

        const evidenceIds = new Set<string>();
        for (const evidence of evidenceRecords) {
          if (evidenceIds.has(evidence.id)) {
            errors.push({
              message: `research/evidence: Duplicate evidence id "${evidence.id}".`,
            });
          }
          evidenceIds.add(evidence.id);
        }

        const coverageResult = fs.existsSync(COVERAGE_PATH)
          ? readValidatedJson(
              COVERAGE_PATH,
              "research/coverage.json",
              coverageSchema
            )
          : { data: {} as z.infer<typeof coverageSchema>, errors: [] };
        errors.push(...coverageResult.errors);

        const substantiveBlockIds = allBlocks
          .filter((b) => decisionsResult.data![b.id]?.substantive === true)
          .map((b) => b.id);

        if (evidenceFilesValid) {
          const knownBlockIds = new Set(allBlocks.map((b) => b.id));
          for (const evidence of evidenceRecords) {
            for (const ref of evidence.sourceBlockRefs) {
              if (!knownBlockIds.has(ref)) {
                errors.push({
                  message: `research/evidence: ${evidence.id} references unknown source block "${ref}".`,
                });
              }
            }
          }
        }

        if (fs.existsSync(RANKINGS_PATH)) {
          const rankingsResult = readValidatedJson(
            RANKINGS_PATH,
            "content/rankings/bases.json",
            baseRankingsSchema
          );
          errors.push(...rankingsResult.errors);
          if (rankingsResult.data && evidenceFilesValid) {
            for (const base of rankingsResult.data.bases) {
              for (const dimension of RANKING_DIMENSIONS) {
                for (const evidenceRef of base.scores[dimension].evidenceRefs) {
                  if (!evidenceIds.has(evidenceRef)) {
                    errors.push({
                      message: `content/rankings/bases.json: ${base.slug}.${dimension} references unknown evidence id "${evidenceRef}".`,
                    });
                  }
                }
              }
            }
          }
        }

        // Validate the swimming/bathing locations file: parse it through the
        // zod schema and resolve any (optional) dimension evidenceRefs. Unlike
        // base rankings, evidenceRefs are OPTIONAL here because many locations
        // are official-source-only (ARS water-quality) with no corpus support;
        // those carry their provenance in location-level officialSource fields.
        if (fs.existsSync(SWIMMING_PATH)) {
          const swimmingResult = readValidatedJson(
            SWIMMING_PATH,
            "content/swimming/locations.json",
            bathingLocationsSchema
          );
          errors.push(...swimmingResult.errors);
          if (swimmingResult.data && evidenceFilesValid) {
            for (const location of swimmingResult.data.locations) {
              for (const dimension of BATHING_DIMENSIONS) {
                const refs = location.scores[dimension].evidenceRefs ?? [];
                for (const evidenceRef of refs) {
                  if (!evidenceIds.has(evidenceRef)) {
                    errors.push({
                      message: `content/swimming/locations.json: ${location.slug}.${dimension} references unknown evidence id "${evidenceRef}".`,
                    });
                  }
                }
              }
            }
          }
        }

        if (coverageResult.data) {
          const knownEvidenceIds = evidenceFilesValid ? evidenceIds : undefined;
          errors.push(
            ...validateCoverage(
              substantiveBlockIds,
              coverageResult.data,
              knownEvidenceIds
            )
          );
        }
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
