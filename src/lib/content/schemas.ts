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
  /**
   * Whether the place has shelter, for reordering options on a wet day.
   * `mixed` means part of it is under a roof — a museum wing, a visitor centre,
   * a castle interior. It does not mean "copes with drizzle": a roofless place
   * that the sources call all-weather is still `outdoor`.
   */
  weatherFit: z.enum(["indoor", "mixed", "outdoor"]).optional(),
  /**
   * How long a visit takes, in hours, derived from each page's own "Visit
   * duration" line against one conversion table (half-day 3–4 h, full day
   * 6–8 h). A range may span both buckets: about a third of the corpus reads
   * "a half-day to a full day", which becomes 3–8 rather than being forced into
   * one. Optional: a place whose page states no duration is left unmarked and
   * ranks neutral rather than being guessed at.
   */
  durationHours: z
    .object({
      min: z.number().positive(),
      max: z.number().positive(),
    })
    // Reported on `max` rather than on the object, so the error names the field
    // to edit instead of the pair.
    .refine((d) => d.max >= d.min, {
      message: "durationHours.max must be greater than or equal to min",
      path: ["max"],
    })
    .optional(),
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
 * Content categories, in the order they are scanned. Derived from the schema
 * map rather than listed again, so registering a category and scanning for it
 * cannot drift apart. Shared by the runtime registry and the CLI validator.
 */
export const CONTENT_CATEGORIES = Object.keys(SCHEMA_BY_CATEGORY);
