import fs from "node:fs";
import path from "node:path";
import type { SourceBlock } from "./source-blocks";
import type { EvidenceRecord } from "./evidence";
import type { Coverage } from "./coverage";
import type {
  BlockDecisions,
  SourceManifest,
  SourceManifestEntry,
} from "./source-validation";

const RESEARCH_ROOT = path.resolve(process.cwd(), "research");
const MANIFEST_PATH = path.join(RESEARCH_ROOT, "source-manifest.json");
const BLOCKS_DIR = path.join(RESEARCH_ROOT, "blocks");
const EVIDENCE_PATH = path.join(RESEARCH_ROOT, "evidence", "registry.json");
const COVERAGE_PATH = path.join(RESEARCH_ROOT, "coverage.json");
const DECISIONS_PATH = path.join(RESEARCH_ROOT, "block-decisions.json");

function readJson<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

export interface SourceSummary {
  slug: string;
  language: string;
  sha256: string;
  blockCount: number;
  substantiveBlockCount: number;
}

/**
 * Load all source manifests enriched with block and substantive-block counts.
 */
export function loadSourceSummaries(): SourceSummary[] {
  const manifest = readJson<SourceManifest>(MANIFEST_PATH) ?? [];
  const decisions = readJson<BlockDecisions>(DECISIONS_PATH) ?? {};

  return manifest.map((entry) => {
    const blocks = readJson<SourceBlock[]>(
      path.join(BLOCKS_DIR, `${entry.slug}.json`)
    ) ?? [];
    const substantiveCount = blocks.filter(
      (b) => decisions[b.id]?.substantive === true
    ).length;
    return {
      slug: entry.slug,
      language: entry.language,
      sha256: entry.sha256,
      blockCount: blocks.length,
      substantiveBlockCount: substantiveCount,
    };
  });
}

/**
 * Load all blocks for a given source slug.
 */
export function loadSourceBlocks(slug: string): SourceBlock[] {
  return readJson<SourceBlock[]>(path.join(BLOCKS_DIR, `${slug}.json`)) ?? [];
}

/**
 * Load a single manifest entry by slug.
 */
export function loadSourceEntry(
  slug: string
): (SourceManifestEntry & { substantiveBlockCount: number }) | null {
  const manifest = readJson<SourceManifest>(MANIFEST_PATH) ?? [];
  const entry = manifest.find((m) => m.slug === slug);
  if (!entry) return null;

  const decisions = readJson<BlockDecisions>(DECISIONS_PATH) ?? {};
  const substantiveBlockCount = loadSourceBlocks(slug).filter(
    (block) => decisions[block.id]?.substantive === true
  ).length;

  return { ...entry, substantiveBlockCount };
}

/**
 * Load the English evidence registry.
 */
export function loadEvidenceRegistry(): EvidenceRecord[] {
  return readJson<EvidenceRecord[]>(EVIDENCE_PATH) ?? [];
}

/**
 * Load the coverage map keyed by source-block ID.
 */
export function loadCoverage(): Coverage {
  return readJson<Coverage>(COVERAGE_PATH) ?? {};
}

/** Slugs available for static generation. */
export function loadSourceSlugs(): string[] {
  const manifest = readJson<SourceManifest>(MANIFEST_PATH) ?? [];
  return manifest.map((m) => m.slug);
}
