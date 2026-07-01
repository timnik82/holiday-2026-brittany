import { z } from "zod";

/**
 * The kind of an English evidence record. Each record is written directly in
 * English from one or more agreeing source blocks — it is not a line-by-line
 * translation.
 */
export const evidenceKindSchema = z.enum([
  "fact",
  "recommendation",
  "price",
  "warning",
  "qualification",
]);

export type EvidenceKind = z.infer<typeof evidenceKindSchema>;

/**
 * A single concise English evidence record. `checkedAt` is required when
 * `timeSensitive` is true so that changeable facts (prices, schedules, water
 * quality, opening times) always carry a verifiable check date.
 */
export const evidenceSchema = z
  .object({
    id: z.string().regex(/^evidence:[a-z0-9-]+$/),
    text: z.string().min(1),
    kind: evidenceKindSchema,
    sourceBlockRefs: z.array(z.string().min(1)).min(1),
    sourceUrls: z.array(z.url()),
    qualifiers: z.array(z.string()),
    timeSensitive: z.boolean(),
    checkedAt: z.iso.date().optional(),
  })
  .refine((data) => !data.timeSensitive || data.checkedAt !== undefined, {
    message: "checkedAt is required when timeSensitive is true",
    path: ["checkedAt"],
  });

export type EvidenceRecord = z.infer<typeof evidenceSchema>;

/**
 * The registry file is an array of evidence records. Later content PRs add
 * sibling files (rankings.json, northern.json, …); this loader only owns
 * registry.json, the seed file established in PR 4.
 */
export const evidenceRegistrySchema = z.array(evidenceSchema);

export type EvidenceRegistry = z.infer<typeof evidenceRegistrySchema>;
