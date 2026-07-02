import "server-only";

import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

const FACTS_DIR = path.resolve(process.cwd(), "content", "facts");

/**
 * A single time-sensitive fact (transport time, accommodation price, etc.).
 * `checkedAt` is the date it was last verified against an official source, and
 * drives the FreshnessLabel. `reviewWindowDays` is optional; when omitted, the
 * FreshnessLabel falls back to its own 30-day default (see freshness.ts).
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
}).superRefine((fact, ctx) => {
  // The regex above accepts `YYYY-MM-DD` shape but not real-calendar validity
  // (e.g. `2026-02-31`). Reject impossible dates at load/build time so they
  // surface here rather than reaching FreshnessLabel as stale/NaN.
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fact.checkedAt);
  if (match) {
    const [, y, m, d] = match;
    const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d), 12));
    if (
      date.getUTCFullYear() !== Number(y) ||
      date.getUTCMonth() !== Number(m) - 1 ||
      date.getUTCDate() !== Number(d)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `checkedAt "${fact.checkedAt}" is not a real calendar date`,
        path: ["checkedAt"],
      });
    }
  }
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
