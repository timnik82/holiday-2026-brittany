import "server-only";

import fs from "node:fs";
import path from "node:path";
import { baseRankingsSchema, type BaseRankings } from "./schema";

const RANKINGS_PATH = path.resolve(process.cwd(), "content", "rankings", "bases.json");

export function loadBaseRankings(): BaseRankings {
  const parsed = baseRankingsSchema.parse(
    JSON.parse(fs.readFileSync(RANKINGS_PATH, "utf8"))
  );

  const slugs = new Set<string>();
  for (const base of parsed.bases) {
    if (slugs.has(base.slug)) {
      throw new Error(`Duplicate base ranking slug: ${base.slug}`);
    }
    slugs.add(base.slug);
  }

  return parsed;
}
