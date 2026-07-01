import "server-only";

import fs from "node:fs";
import path from "node:path";
import { baseRankingsSchema, type BaseRankings } from "./schema";

const RANKINGS_PATH = path.resolve(process.cwd(), "content", "rankings", "bases.json");

export function loadBaseRankings(): BaseRankings {
  return baseRankingsSchema.parse(
    JSON.parse(fs.readFileSync(RANKINGS_PATH, "utf8"))
  );
}
