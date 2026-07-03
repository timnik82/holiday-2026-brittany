import { z } from "zod";
import { BATHING_DIMENSIONS, type BathingDimension } from "./bathing-dimensions";

const dimensionScoreSchema = z.object({
  score: z.number().min(1).max(10).nullable(),
  rationale: z.string().min(1),
  // Optional: corpus-backed evidence. Locations whose only support is an
  // official source (e.g. ARS water-quality) carry their provenance in the
  // location-level officialSource/sourceUrl fields instead, so this is not
  // required (unlike base rankings, where every score needs evidence).
  evidenceRefs: z.array(z.string().regex(/^evidence:[a-z0-9-]+$/)).optional(),
});

const scoresShape = Object.fromEntries(
  BATHING_DIMENSIONS.map((dimension) => [dimension, dimensionScoreSchema])
) as Record<BathingDimension, typeof dimensionScoreSchema>;

export const bathingLocationSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  type: z.enum(["sea", "lake", "tidal-pool", "pool"]),
  linkedBases: z.array(z.string().min(1)),
  officialSource: z.string().min(1),
  sourceUrl: z.string().url(),
  checkedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reviewWindowDays: z.number().int().positive().optional(),
  warningStatus: z.enum(["none", "advisory", "closure", "unknown"]),
  notes: z.string().optional(),
  scores: z.object(scoresShape),
});

export const bathingLocationsSchema = z
  .object({
    locations: z.array(bathingLocationSchema),
  })
  .superRefine((data, context) => {
    // Reject duplicate slugs (mirror ranking/schema.ts). Duplicate locations
    // would otherwise silently double-count a spot across the comparison.
    const seen = new Set<string>();
    data.locations.forEach((location, index) => {
      if (seen.has(location.slug)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate bathing location slug: ${location.slug}`,
          path: ["locations", index, "slug"],
        });
      }
      seen.add(location.slug);
    });
  })
  .superRefine((data, context) => {
    // Calendar validity for checkedAt — the regex accepts `2026-02-31` but a
    // real calendar does not. Reject impossible dates at load/build time
    // (mirror facts.ts) so they never reach FreshnessLabel as stale/NaN.
    data.locations.forEach((location, index) => {
      const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(location.checkedAt);
      if (match) {
        const [, y, m, d] = match;
        const date = new Date(
          Date.UTC(Number(y), Number(m) - 1, Number(d), 12)
        );
        if (
          date.getUTCFullYear() !== Number(y) ||
          date.getUTCMonth() !== Number(m) - 1 ||
          date.getUTCDate() !== Number(d)
        ) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: `checkedAt "${location.checkedAt}" is not a real calendar date`,
            path: ["locations", index, "checkedAt"],
          });
        }
      }
    });
  });

export type BathingLocation = z.infer<typeof bathingLocationSchema>;
export type BathingLocations = z.infer<typeof bathingLocationsSchema>;
