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

/** Compute the SHA-256 hex digest of a file's raw bytes. */
export function computeSha256(filePath: string): string {
  const buffer = fs.readFileSync(filePath);
  return createHash("sha256").update(buffer).digest("hex");
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
    const absPath = path.join(cwd, entry.path);
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
