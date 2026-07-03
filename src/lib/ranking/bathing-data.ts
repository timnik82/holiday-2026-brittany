import "server-only";

import fs from "node:fs";
import path from "node:path";
import { bathingLocationsSchema, type BathingLocations } from "./bathing-schema";

const LOCATIONS_PATH = path.resolve(
  process.cwd(),
  "content",
  "swimming",
  "locations.json"
);

export function loadBathingLocations(): BathingLocations {
  return bathingLocationsSchema.parse(
    JSON.parse(fs.readFileSync(LOCATIONS_PATH, "utf8"))
  );
}
