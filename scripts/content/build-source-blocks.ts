import fs from "node:fs";
import path from "node:path";
import {
  readValidatedJson,
  resolveSourcePath,
  sourceManifestSchema,
  validateManifestChecksums,
  type SourceManifest,
} from "../../src/lib/content/source-validation";
import { extractBlocks } from "../../src/lib/content/source-blocks";

const ROOT = path.resolve(process.cwd());
const MANIFEST_PATH = path.join(ROOT, "research", "source-manifest.json");
const BLOCKS_DIR = path.join(ROOT, "research", "blocks");

function loadManifest(): SourceManifest | null {
  const result = readValidatedJson(
    MANIFEST_PATH,
    "research/source-manifest.json",
    sourceManifestSchema
  );
  if (!result.data) {
    for (const error of result.errors) {
      console.error(error.message);
    }
    return null;
  }
  return result.data;
}

function main() {
  const manifest = loadManifest();
  if (!manifest) {
    process.exit(1);
  }

  const checksumErrors = validateManifestChecksums(manifest, ROOT);
  if (checksumErrors.length > 0) {
    console.error("\n❌ Raw source checksum validation failed:\n");
    for (const err of checksumErrors) {
      console.error(`  ${err.message}`);
    }
    console.error(
      "\nUpdate research/source-manifest.json with a new revision (recomputed sha256) if the change is intentional.\n"
    );
    process.exit(1);
  }

  fs.mkdirSync(BLOCKS_DIR, { recursive: true });

  let blockCount = 0;

  for (const entry of manifest) {
    // Checksum validation above guarantees every source path is contained and
    // exists; this guard keeps that invariant explicit at the read site.
    const sourcePath = resolveSourcePath(entry.path, ROOT);
    if (!sourcePath) continue;
    const markdown = fs.readFileSync(sourcePath, "utf-8");
    const blocks = extractBlocks(markdown, entry.slug, entry.stopHeadings);
    blockCount += blocks.length;

    const outPath = path.join(BLOCKS_DIR, `${entry.slug}.json`);
    const output = JSON.stringify(blocks, null, 2) + "\n";
    fs.writeFileSync(outPath, output, "utf-8");
    console.log(`  ${entry.slug}: ${blocks.length} block(s) -> ${path.relative(ROOT, outPath)}`);
  }

  console.log(`\n✅ Extracted ${blockCount} block(s) from ${manifest.length} source(s).\n`);
}

main();
