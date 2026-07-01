import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { z } from "zod";
import type { SourceBlock } from "./source-blocks";

export const sourceManifestEntrySchema = z.object({
  slug: z.string().min(1),
  path: z.string().min(1),
  language: z.string().min(1),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  stopHeadings: z.array(z.string()),
});

export const sourceManifestSchema = z.array(sourceManifestEntrySchema);

export type SourceManifestEntry = z.infer<typeof sourceManifestEntrySchema>;
export type SourceManifest = z.infer<typeof sourceManifestSchema>;

export const blockDecisionSchema = z.object({
  substantive: z.boolean(),
  reason: z.string().min(1).optional(),
});

export const blockDecisionsSchema = z.record(z.string(), blockDecisionSchema);

export type BlockDecision = z.infer<typeof blockDecisionSchema>;
export type BlockDecisions = z.infer<typeof blockDecisionsSchema>;

export interface ValidationError {
  message: string;
}

export interface JsonValidationResult<T> {
  data: T | null;
  errors: ValidationError[];
}

/**
 * Read and validate a JSON file without allowing JSON or schema failures to
 * escape as stack traces from command-line validation scripts.
 */
export function readValidatedJson<T>(
  filePath: string,
  displayPath: string,
  schema: z.ZodType<T>
): JsonValidationResult<T> {
  let raw: string;
  try {
    raw = fs.readFileSync(filePath, "utf8");
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    return {
      data: null,
      errors: [{ message: `${displayPath}: Could not read file (${detail}).` }],
    };
  }

  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    return {
      data: null,
      errors: [{ message: `${displayPath}: Invalid JSON (${detail}).` }],
    };
  }

  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    return {
      data: null,
      errors: parsed.error.issues.map((issue) => ({
        message: `${displayPath}: ${issue.path.join(".") || "root"} - ${issue.message}`,
      })),
    };
  }

  return { data: parsed.data, errors: [] };
}

/**
 * Resolve a manifest source path only when it remains inside research/raw.
 */
export function resolveSourcePath(
  sourcePath: string,
  cwd: string = process.cwd()
): string | null {
  const sourceRoot = path.resolve(cwd, "research", "raw");
  const resolvedPath = path.resolve(cwd, sourcePath);
  const relative = path.relative(sourceRoot, resolvedPath);

  if (
    relative === "" ||
    relative === ".." ||
    relative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relative)
  ) {
    return null;
  }

  return resolvedPath;
}

/**
 * Compute the SHA-256 digest of repository-canonical Markdown text. Git stores
 * these files with LF endings, while Windows may check them out as CRLF.
 */
export function computeSha256(filePath: string): string {
  const canonicalMarkdown = fs
    .readFileSync(filePath, "utf8")
    .replace(/\r\n/g, "\n");
  return createHash("sha256").update(canonicalMarkdown, "utf8").digest("hex");
}

/**
 * Verify every manifest entry's checksum still matches the corresponding raw
 * source file on disk. A mismatch means the raw source changed without a
 * new manifest revision, which must fail validation.
 */
export function validateManifestChecksums(
  manifest: SourceManifest,
  cwd: string = process.cwd()
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const entry of manifest) {
    const absPath = resolveSourcePath(entry.path, cwd);
    if (!absPath) {
      errors.push({
        message: `${entry.path}: Source path for slug "${entry.slug}" must stay within research/raw.`,
      });
      continue;
    }

    if (!fs.existsSync(absPath)) {
      errors.push({
        message: `${entry.path}: File referenced by source-manifest.json (slug "${entry.slug}") does not exist.`,
      });
      continue;
    }

    const actual = computeSha256(absPath);
    if (actual !== entry.sha256) {
      errors.push({
        message: `${entry.path}: SHA-256 checksum mismatch (manifest expects ${entry.sha256}, file is ${actual}). Raw sources must not change without a new manifest revision.`,
      });
    }
  }

  return errors;
}

/**
 * Verify that every extracted block has an explicit decision, that no
 * decision references a block that no longer exists, and that every
 * non-substantive decision includes a reason.
 */
export function validateBlockDecisions(
  blocks: SourceBlock[],
  decisions: BlockDecisions
): ValidationError[] {
  const errors: ValidationError[] = [];
  const blockIds = new Set(blocks.map((b) => b.id));

  for (const block of blocks) {
    const decision = decisions[block.id];
    if (!decision) {
      errors.push({
        message: `${block.id}: Missing entry in research/block-decisions.json.`,
      });
      continue;
    }

    if (decision.substantive === false && !decision.reason) {
      errors.push({
        message: `${block.id}: Non-substantive decision requires a "reason".`,
      });
    }
  }

  for (const id of Object.keys(decisions)) {
    if (!blockIds.has(id)) {
      errors.push({
        message: `${id}: Decision references a block that no longer exists. Remove it or re-run build:source-blocks.`,
      });
    }
  }

  return errors;
}
