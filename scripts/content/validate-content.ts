import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { listContentFiles, readContentFile } from "../../src/lib/content/files";
import {
  pageFrontmatterSchema,
  SCHEMA_BY_CATEGORY,
  CONTENT_CATEGORIES,
  stayFrontmatterSchema,
  thingsToDoFrontmatterSchema,
} from "../../src/lib/content/schemas";
import {
  validateParsedContent,
  listParagraphIds,
  parseContent,
} from "../../src/lib/content/parse";
import { guideConfig } from "../../src/config/guide";
import { allReachEntries } from "../../src/lib/trip/reach";
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
import {
  coverageSchema,
  validateCoverage,
  validateCoverageParagraphs,
} from "../../src/lib/content/coverage";
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

  let fileCount = 0;
  // Every paragraph id *declared* anywhere in content/, with the file that
  // declares it. Paragraph ids must be unique across the whole corpus, not just
  // within a file: coverage, narration and citations all address a paragraph by
  // id alone, so a repeated id has no single owner.
  const paragraphOwners = new Map<string, string>();
  // The paragraphs the parser actually produced a record for. Coverage is
  // checked against these, not against the declarations: a marker placed before
  // a block the parser does not track yields no paragraph, so treating the
  // declaration as proof would let coverage certify content that never renders.
  const parsedParagraphIds = new Set<string>();
  const bookedStayIds = new Set<string>(guideConfig.trip.stays.map((stay) => stay.id));
  // stayId -> the file that already claimed it. One booked stay gets one page;
  // a second would silently win or lose depending on directory order.
  const stayPageOwners = new Map<string, string>();
  // "category/slug" -> file. Two pages sharing a slug make one of them
  // unreachable, and which one wins depends on the order the directory is read.
  const slugOwners = new Map<string, string>();
  // Base pages that exist, checked afterwards against the stays' baseSlug.
  const baseSlugs = new Set<string>();
  // Reviewed places carrying neither situational field. Reported, not failed:
  // the fields are derived from what a page already says, and some pages say
  // nothing. Guessing would be worse than an honest blank.
  const unmarkedPlaces: string[] = [];

  for (const category of CONTENT_CATEGORIES) {
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
      } else {
        const slugKey = `${category}/${parsed.data.slug}`;
        const slugOwner = slugOwners.get(slugKey);
        if (slugOwner) {
          errors.push({
            message: `${relPath}: Frontmatter: slug "${parsed.data.slug}" is already used by ${slugOwner}. Slugs must be unique within a category.`,
          });
        } else {
          slugOwners.set(slugKey, relPath);
        }
        if (category === "bases") baseSlugs.add(parsed.data.slug);
      }

      // A stay page is a view onto a booked stay: its dates, place and base
      // all come from `guideConfig.trip`, so an unresolvable stayId would
      // render a page with no trip behind it.
      // Situational fields are optional by design — a place whose page states
      // no duration or weather fit is left unmarked rather than guessed at, and
      // ranks neutral. But an unmarked place is invisible to the day filter, so
      // the list is reported rather than left to be discovered on the road.
      if (category === "things-to-do") {
        const place = thingsToDoFrontmatterSchema.safeParse(frontmatter);
        if (
          place.success &&
          place.data.status !== "draft" &&
          !place.data.weatherFit &&
          !place.data.durationHours
        ) {
          unmarkedPlaces.push(place.data.slug);
        }
      }

      if (category === "trip") {
        const stay = stayFrontmatterSchema.safeParse(frontmatter);
        if (stay.success) {
          if (!bookedStayIds.has(stay.data.stayId)) {
            errors.push({
              message: `${relPath}: Frontmatter: stayId "${stay.data.stayId}" does not match any stay in guideConfig.trip.`,
            });
          }
          const claimedBy = stayPageOwners.get(stay.data.stayId);
          if (claimedBy) {
            errors.push({
              message: `${relPath}: Frontmatter: stayId "${stay.data.stayId}" is already used by ${claimedBy}. One booked stay gets one page.`,
            });
          } else {
            stayPageOwners.set(stay.data.stayId, relPath);
          }
        }
      }

      for (const id of listParagraphIds(body)) {
        const owner = paragraphOwners.get(id);
        if (owner) {
          errors.push({
            message: `${relPath}: Paragraph ID "${id}" is already declared in ${owner}. Paragraph IDs must be unique across content/.`,
          });
        } else {
          paragraphOwners.set(id, relPath);
        }
      }
      for (const record of parseContent(body).paragraphs) {
        parsedParagraphIds.add(record.id);
      }

      // Validate content. `validateParsedContent` already prefixes each
      // message with the file path, so it isn't repeated here.
      const contentErrors = validateParsedContent(body, relPath);
      for (const err of contentErrors) {
        errors.push({ message: err.message });
      }
    }
  }

  // Reach lists name places by slug and nothing else links them, so a renamed
  // or deleted place would silently drop out of the day's options.
  for (const { stayId, entry } of allReachEntries()) {
    if (!bookedStayIds.has(stayId)) {
      errors.push({
        message: `src/lib/trip/reach.ts: Reach list "${stayId}" is not a booked stay.`,
      });
    }
    if (!slugOwners.has(`things-to-do/${entry.place}`)) {
      errors.push({
        message: `src/lib/trip/reach.ts: ${stayId} reaches "${entry.place}", which has no page in content/things-to-do/.`,
      });
    }
  }

  // Every stay's base must exist as a page. `baseSlug` lives in the trip
  // config, out of reach of content validation, so a renamed base page would
  // otherwise leave the home page and the stay cards linking into a 404.
  for (const stay of guideConfig.trip.stays) {
    if (stay.baseSlug && !baseSlugs.has(stay.baseSlug)) {
      errors.push({
        message: `src/config/guide.ts: Stay "${stay.id}" references baseSlug "${stay.baseSlug}", which has no page in content/bases/.`,
      });
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
          errors.push(
            ...validateCoverageParagraphs(parsedParagraphIds, coverageResult.data)
          );
        }
      }
    }
  }

  if (unmarkedPlaces.length > 0) {
    console.log("\nℹ️  Places with no weather fit or duration (invisible to the day filter):");
    for (const slug of unmarkedPlaces.sort()) {
      console.log(`  content/things-to-do/${slug}.md`);
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
