import { z } from "zod";

/**
 * Discriminated union of coverage outcomes. Exactly one outcome is required
 * per substantive source block.
 *
 * - `draft`: temporarily unresolved, allowed only until PR 16 closes coverage.
 * - `retained`: the block's content is captured in one or more retained
 *   English evidence records and connected to guide paragraphs.
 * - `duplicate`: the block repeats a claim already captured by a retained
 *   evidence record.
 * - `conflict`: the block's claim disagrees with other sources; the two or
 *   more English claims are preserved side-by-side, never silently blended.
 */
export const coverageOutcomeSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("draft"),
    plannedArea: z.string().min(1),
  }),
  z.object({
    status: z.literal("retained"),
    evidenceIds: z.array(z.string().min(1)).min(1),
    paragraphIds: z.array(z.string().min(1)).min(1),
  }),
  z.object({
    status: z.literal("duplicate"),
    retainedEvidenceId: z.string().min(1),
  }),
  z.object({
    status: z.literal("conflict"),
    conflictId: z.string().min(1),
    evidenceIds: z.array(z.string().min(1)).min(2),
    paragraphIds: z.array(z.string().min(1)).min(1),
    /** Editorial planning interpretation explaining how the family should
     *  weigh the disagreement. Optional so un-interpreted conflicts can still
     *  validate; the coverage view labels it clearly when present. */
    interpretation: z.string().optional(),
  }),
]);

export type CoverageOutcome = z.infer<typeof coverageOutcomeSchema>;

/**
 * Coverage is a record keyed by source-block ID (e.g. `chatgpt:b001`).
 */
export const coverageSchema = z.record(z.string(), coverageOutcomeSchema);

export type Coverage = z.infer<typeof coverageSchema>;

export type CoverageStatus = CoverageOutcome["status"];

export interface CoverageError {
  message: string;
}

/** Extract every evidence id referenced by a coverage outcome. */
function outcomeEvidenceIds(outcome: CoverageOutcome): string[] {
  switch (outcome.status) {
    case "retained":
      return outcome.evidenceIds;
    case "conflict":
      return outcome.evidenceIds;
    case "duplicate":
      return [outcome.retainedEvidenceId];
    default:
      return [];
  }
}

/**
 * Verify that every substantive block has exactly one coverage outcome, that
 * no non-substantive or nonexistent block carries coverage, and that every
 * evidence id referenced by a coverage outcome exists in the registry.
 */
export function validateCoverage(
  substantiveBlockIds: string[],
  coverage: Coverage,
  knownEvidenceIds?: Set<string>
): CoverageError[] {
  const errors: CoverageError[] = [];
  const substantiveSet = new Set(substantiveBlockIds);

  for (const blockId of substantiveBlockIds) {
    if (!coverage[blockId]) {
      errors.push({
        message: `${blockId}: Missing coverage outcome in research/coverage.json.`,
      });
    }
  }

  for (const blockId of Object.keys(coverage)) {
    if (!substantiveSet.has(blockId)) {
      errors.push({
        message: `${blockId}: Coverage entry references a non-substantive or unknown block.`,
      });
    }
  }

  if (knownEvidenceIds) {
    for (const [blockId, outcome] of Object.entries(coverage)) {
      for (const evidenceId of outcomeEvidenceIds(outcome)) {
        if (!knownEvidenceIds.has(evidenceId)) {
          errors.push({
            message: `${blockId}: Coverage references unknown evidence id "${evidenceId}".`,
          });
        }
      }
    }
  }

  return errors;
}
