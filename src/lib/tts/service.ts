import "server-only";

import { loadContentPages } from "@/lib/content/registry";
import type { ParagraphRecord } from "@/lib/content/types";
import { audioPathname, lockPathname } from "./cache-key";
import { acquireLock, releaseLock } from "./locks";
import { audioExists, putAudioIdempotent } from "./blob";
import { generateAudio, RimeError } from "./rime";

export type TtsResult =
  | { status: "hit"; audioPath: string }
  | { status: "generated"; audioPath: string };

export class TtsError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "TtsError";
  }
}

/**
 * Resolve a paragraph by its id across all content. Returns `null` if no
 * reviewed paragraph with that id exists.
 */
function findParagraph(paragraphId: string): ParagraphRecord | null {
  for (const entry of loadContentPages()) {
    const found = entry.page.paragraphs.find((p) => p.id === paragraphId);
    if (found) return found;
  }
  return null;
}

/**
 * Generate or retrieve cached audio for a paragraph.
 *
 * 1. Resolve the paragraph by id; reject unknown ids (404) and
 *    non-narratable nodes (400).
 * 2. Compute the deterministic cache pathname.
 * 3. Cache hit → return immediately without calling Rime.
 * 4. Cache miss → acquire a lock, generate via Rime, store in Blob.
 *    Concurrent requests poll for the finished audio instead of duplicating
 *    the Rime call.
 * 5. Lock is always released in `finally`.
 */
export async function generateOrRetrieveAudio(
  paragraphId: string,
): Promise<TtsResult> {
  const paragraph = findParagraph(paragraphId);
  if (!paragraph) {
    throw new TtsError(404, `Unknown paragraph: ${paragraphId}`);
  }
  if (!paragraph.narratable) {
    throw new TtsError(400, `Paragraph is not narratable: ${paragraphId}`);
  }

  const audioPath = audioPathname(paragraph.hash);

  // Cache hit — serve without calling Rime.
  if (await audioExists(audioPath)) {
    return { status: "hit", audioPath };
  }

  const lockPath = lockPathname(paragraph.hash);

  let ownsLock: boolean;
  try {
    ownsLock = await acquireLock(lockPath, audioPath);
  } catch {
    // Polling exhausted: the other request may have failed. Surface as retryable.
    throw new TtsError(503, "Audio generation timed out. Please try again.");
  }

  if (!ownsLock) {
    // Another request generated the audio while we polled.
    return { status: "hit", audioPath };
  }

  // We own the lock — generate.
  try {
    const audioBytes = await generateAudio(paragraph.text);
    await putAudioIdempotent(audioPath, audioBytes);
    return { status: "generated", audioPath };
  } catch (error) {
    if (error instanceof RimeError) {
      const { kind } = error.failure;
      const statusCode = kind === "configuration" ? 500 : kind === "quota" ? 429 : 503;
      throw new TtsError(statusCode, `TTS generation failed: ${kind}`);
    }
    throw error;
  } finally {
    await releaseLock(lockPath);
  }
}
