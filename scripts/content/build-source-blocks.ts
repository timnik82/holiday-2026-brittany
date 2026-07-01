import fs from "node:fs";
import path from "node:path";
import {
  sourceManifestSchema,
  validateManifestChecksums,
  type SourceManifest,
} from "../../src/lib/content/source-validation";
import { extractBlocks } from "../../src/lib/content/source-blocks";

const ROOT = path.resolve(process.cwd());
const MANIFEST_PATH = path.join(ROOT, "research", "source-manifest.json");
const BLOCKS_DIR = path.join(ROOT, "research", "blocks");

function loadManifest(): SourceManifest {
  const raw = fs.readFileSync(MANIFEST_PATH, "utf-8");
  const parsed = sourceManifestSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    console.error("research/source-manifest.json is invalid:");
    for (const issue of parsed.error.issues) {
      console.error(`  ${issue.path.join(".")}: ${issue.message}`);
    }
    process.exit(1);
  }
  return parsed.data;
}

function main() {
  const manifest = loadManifest();

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
    const markdown = fs.readFileSync(path.join(ROOT, entry.path), "utf-8");
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
