import { createHash } from "node:crypto";
import { TTS_PROFILE } from "./config";

/**
 * Deterministic cache key for a paragraph's audio.
 *
 * The key is a SHA-256 of the serialised TTS profile together with the
 * paragraph's pre-computed text hash. Because `paragraph.hash` is itself a
 * SHA-256 of the normalised plain text, the key changes if either the text
 * or any profile dimension (model, speaker, language, sampling rate, format)
 * changes — but stays stable otherwise, so identical text never regenerates.
 */
function computeCacheKey(paragraphHash: string): string {
  const profileString = JSON.stringify(
    Object.entries(TTS_PROFILE)
      .sort(([a], [b]) => a.localeCompare(b))
      .reduce<Record<string, unknown>>((acc, [k, v]) => {
        acc[k] = v;
        return acc;
      }, {}),
  );
  return createHash("sha256")
    .update(`${profileString}:${paragraphHash}`)
    .digest("hex")
    .slice(0, 32);
}

/** Blob pathname for a paragraph's audio object: `tts/<key>.mp3`. */
export function audioPathname(paragraphHash: string): string {
  return `tts/${computeCacheKey(paragraphHash)}.mp3`;
}

/** Blob pathname for a paragraph's lock object: `tts-locks/<key>.json`. */
export function lockPathname(paragraphHash: string): string {
  return `tts-locks/${computeCacheKey(paragraphHash)}.json`;
}

/** The cache key hash for a paragraph (without the `tts/` prefix). */
export function cacheKey(paragraphHash: string): string {
  return computeCacheKey(paragraphHash);
}
