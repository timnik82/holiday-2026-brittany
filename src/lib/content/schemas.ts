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
