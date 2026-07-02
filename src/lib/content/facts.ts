import "server-only";

import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

const FACTS_DIR = path.resolve(process.cwd(), "content", "facts");

/**
 * A single time-sensitive fact (transport time, accommodation price, etc.).
 * `checkedAt` is the date it was last verified against an official source, and
 * drives the FreshnessLabel. `reviewWindowDays` defaults per-category when
 * omitted by the caller (see `loadFacts`).
 */
const factSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  value: z.string().min(1),
  officialSource: z.string().min(1),
  sourceUrl: z.string().url().optional(),
  checkedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reviewWindowDays: z.number().int().positive().optional(),
  notes: z.string().optional(),
  evidenceRef: z.string().regex(/^evidence:[a-z0-9-]+$/).optional(),
  baseSlug: z.string().optional(),
});

const factsFileSchema = z.object({
  scale: z
    .object({
      minimum: z.number(),
      maximum: z.number(),
      description: z.string().min(1),
    })
    .optional(),
  targetNightly: z.number().optional(),
  ceilingNightly: z.number().optional(),
  facts: z.array(factSchema),
});

export type Fact = z.infer<typeof factSchema>;

export interface FactFile {
  /** The file name without extension, e.g. "transport", "accommodation". */
  category: string;
  facts: Fact[];
}

/**
 * Load all fact files from `content/facts/`. Each `.json` file is parsed and
 * validated; a malformed file throws at build time rather than silently
 * dropping facts. Returns an empty array if the directory is absent.
 */
export function loadFacts(): FactFile[] {
  if (!fs.existsSync(FACTS_DIR)) return [];
  return fs
    .readdirSync(FACTS_DIR)
    .filter((name) => name.endsWith(".json"))
    .sort()
    .map((name) => {
      const parsed = factsFileSchema.parse(
        JSON.parse(fs.readFileSync(path.join(FACTS_DIR, name), "utf8"))
      );
      return { category: name.replace(/\.json$/, ""), facts: parsed.facts };
    });
}
