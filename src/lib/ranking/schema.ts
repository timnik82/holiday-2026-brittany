import { z } from "zod";
import { RANKING_DIMENSIONS } from "./weights";

const scoreSchema = z.object({
  score: z.number().min(1).max(10).nullable(),
  rationale: z.string().min(1),
  evidenceRefs: z.array(z.string().regex(/^evidence:[a-z0-9-]+$/)).min(1),
});

const scoresShape = Object.fromEntries(
  RANKING_DIMENSIONS.map((dimension) => [dimension, scoreSchema])
) as Record<(typeof RANKING_DIMENSIONS)[number], typeof scoreSchema>;

export const baseRecordSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  summary: z.string().min(1),
  bestFor: z.string().min(1),
  compromises: z.array(z.string().min(1)).min(1),
  carNeed: z.enum(["optional", "helpful", "recommended", "essential"]),
  priceBand: z.enum(["budget", "moderate", "high"]),
  scores: z.object(scoresShape),
});

export const baseRankingsSchema = z
  .object({
    scale: z.object({
      minimum: z.literal(1),
      maximum: z.literal(10),
      description: z.string().min(1),
    }),
    bases: z.array(baseRecordSchema).length(6),
  })
  .superRefine((data, context) => {
    const seen = new Set<string>();
    data.bases.forEach((base, index) => {
      if (seen.has(base.slug)) {
        context.addIssue({
          code: "custom",
          message: `Duplicate base slug: ${base.slug}`,
          path: ["bases", index, "slug"],
        });
      }
      seen.add(base.slug);
    });
  });

export type BaseRecord = z.infer<typeof baseRecordSchema>;
export type BaseRankings = z.infer<typeof baseRankingsSchema>;
