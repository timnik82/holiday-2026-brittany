/**
 * Cross-platform clean script. Removes build caches, Playwright MCP artifacts,
 * root-level screenshots, and standard Playwright output directories.
 *
 * Replaces Unix-only `rm -rf` + `find … -delete` so `npm run clean` works
 * identically on macOS, Linux, and Windows. `fs.rmSync` with `force: true`
 * never throws on missing targets, so the script is safe to run repeatedly.
 */
import fs from "node:fs";
import path from "node:path";

const DIRS = [
  ".next",
  ".playwright-mcp",
  "test-results",
  "playwright-report",
  "blob-report",
  "coverage",
];

for (const dir of DIRS) {
  fs.rmSync(dir, { recursive: true, force: true });
}

// Remove root-level *.png (Playwright MCP screenshots). Scoped to depth 1 so
// project images under public/ are never touched.
for (const entry of fs.readdirSync(".")) {
  if (path.extname(entry).toLowerCase() === ".png") {
    fs.rmSync(entry, { force: true });
  }
}

console.log("Cleaned build caches and Playwright artifacts.");
