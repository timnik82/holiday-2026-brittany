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

/**
 * A stay page: the day-by-day guide to one booked accommodation.
 *
 * Deliberately thin. Dates, nights, place and base all live in
 * `guideConfig.trip.stays` and are looked up through `stayId`, so a changed
 * booking cannot leave a stale date behind in frontmatter. Only editorial
 * judgement that is *not* a trip fact belongs here.
 */
export const stayFrontmatterSchema = pageFrontmatterSchema.extend({
  /** Must match a stay id in `guideConfig.trip.stays`; checked by the validator. */
  stayId: z.string().min(1),
  carRequirement: z.enum(["optional", "recommended", "essential"]),
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
export type StayFrontmatter = z.infer<typeof stayFrontmatterSchema>;
export type ThingsToDoFrontmatter = z.infer<typeof thingsToDoFrontmatterSchema>;
export type PracticalFrontmatter = z.infer<typeof practicalFrontmatterSchema>;

/**
 * Per-category frontmatter schema. Each content type validates its specific
 * extended fields (region for bases, stayId for trip stays, etc.) instead of
 * falling back to the generic page schema. Shared between the CLI validator
 * and the runtime registry loader so both enforce the same rules.
 */
export const SCHEMA_BY_CATEGORY: Record<string, z.ZodType<PageFrontmatter>> = {
  plan: practicalFrontmatterSchema,
  bases: baseFrontmatterSchema,
  trip: stayFrontmatterSchema,
  "things-to-do": thingsToDoFrontmatterSchema,
  practical: practicalFrontmatterSchema,
};

/**
 * Content categories, in the order they are scanned. Shared by the runtime
 * registry and the CLI validator so a new category cannot be validated by one
 * and ignored by the other.
 */
export const CONTENT_CATEGORIES = [
  "plan",
  "bases",
  "trip",
  "things-to-do",
  "practical",
] as const;
