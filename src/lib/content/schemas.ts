import { z } from "zod";

export const pageFrontmatterSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(["draft", "review", "published"]),
});

export const baseFrontmatterSchema = pageFrontmatterSchema.extend({
  region: z.string().min(1),
  coordinates: z
    .object({ lat: z.number(), lng: z.number() })
    .optional(),
});

export const routeFrontmatterSchema = pageFrontmatterSchema.extend({
  origin: z.string().min(1),
  destination: z.string().min(1),
  mode: z.enum(["car", "train", "ferry", "flight"]),
  // Trip-level facts surfaced in the route's "at a glance" card. The
  // day-by-day itinerary itself lives in the markdown body (each day's
  // facts cited via paragraph evidence comments), mirroring how base and
  // things-to-do pages already work.
  durationDays: z.number().int().positive(),
  pace: z.enum(["relaxed", "moderate", "active"]),
  bases: z.array(z.string().min(1)).min(1),
  accommodationChanges: z.number().int().nonnegative(),
  carRequirement: z.enum(["optional", "recommended", "essential"]),
  bestFit: z.string().min(1),
});

export const thingsToDoFrontmatterSchema = pageFrontmatterSchema.extend({
  category: z.string().min(1),
  ageRange: z.string().optional(),
});

export const practicalFrontmatterSchema = pageFrontmatterSchema.extend({
  section: z.string().min(1),
});

export type PageFrontmatter = z.infer<typeof pageFrontmatterSchema>;
export type BaseFrontmatter = z.infer<typeof baseFrontmatterSchema>;
export type RouteFrontmatter = z.infer<typeof routeFrontmatterSchema>;
export type ThingsToDoFrontmatter = z.infer<typeof thingsToDoFrontmatterSchema>;
export type PracticalFrontmatter = z.infer<typeof practicalFrontmatterSchema>;

/**
 * Per-category frontmatter schema. Each content type validates its specific
 * extended fields (region for bases, mode for routes, etc.) instead of
 * falling back to the generic page schema. Shared between the CLI validator
 * and the runtime registry loader so both enforce the same rules.
 */
export const SCHEMA_BY_CATEGORY: Record<string, z.ZodType<PageFrontmatter>> = {
  plan: practicalFrontmatterSchema,
  bases: baseFrontmatterSchema,
  routes: routeFrontmatterSchema,
  "things-to-do": thingsToDoFrontmatterSchema,
  practical: practicalFrontmatterSchema,
};
