import "server-only";

import { put, head, del, get } from "@vercel/blob";

const ACCESS = "private" as const;
const CONTENT_TYPE = "audio/mpeg" as const;

/**
 * Vercel Blob adapter for private TTS audio objects.
 *
 * Audio is stored at deterministic pathnames (`tts/<cacheKey>.mp3`) with
 * `addRandomSuffix: false` so the same paragraph text + profile always
 * resolves to the same object. All objects are private — they can only be
 * read through the authenticated `/api/audio/[cacheKey]` route, never
 * directly from a public Blob URL.
 *
 * Locks live at `tts-locks/<cacheKey>.json` and are used to prevent
 * duplicate generation under concurrent requests.
 */

/** Store a complete audio object. Returns the blob URL. */
export async function putAudio(
  pathname: string,
  audioBytes: Uint8Array,
): Promise<string> {
  const blob = await put(pathname, audioBytes.buffer as ArrayBuffer, {
    access: ACCESS,
    addRandomSuffix: false,
    contentType: CONTENT_TYPE,
  });
  return blob.url;
}

/**
 * Attempt to store audio, returning the winning URL. If a concurrent `put`
 * already created the object (deterministic pathname collision), resolve the
 * existing object instead. Genuine storage/auth/network failures propagate
 * rather than being masked — only the specific collision case is caught.
 */
export async function putAudioIdempotent(
  pathname: string,
  audioBytes: Uint8Array,
): Promise<string> {
  try {
    return await putAudio(pathname, audioBytes);
  } catch (error) {
    // Only treat a pathname collision (concurrent put) as recoverable.
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("already exists") || message.includes("conflict")) {
      const existing = await resolveAudioUrl(pathname);
      if (existing) return existing;
    }
    throw error;
  }
}

/** Resolve the URL for a private blob pathname via head(). Returns null if not found. */
export async function resolveAudioUrl(pathname: string): Promise<string | null> {
  try {
    const blob = await head(pathname);
    return blob.url;
  } catch {
    return null;
  }
}

/** Check whether an audio object exists without downloading it. */
export async function audioExists(pathname: string): Promise<boolean> {
  try {
    await head(pathname);
    return true;
  } catch {
    return false;
  }
}

/** Retrieve audio as a streamable response for the audio route. */
export async function getAudioStream(pathname: string): Promise<{
  stream: ReadableStream<Uint8Array>;
  size: number | undefined;
}> {
  const result = await get(pathname, { access: "private" });
  if (!result || !result.stream) throw new Error("Audio not found");

  const size = Number(result.headers.get("content-length")) || undefined;
  return {
    stream: result.stream,
    size,
  };
}

/** Put a lock marker. Returns true if acquired, false if already held. */
export async function putLock(pathname: string, createdAt: number): Promise<boolean> {
  try {
    await put(pathname, JSON.stringify({ createdAt }), {
      access: ACCESS,
      addRandomSuffix: false,
      contentType: "application/json",
    });
    return true;
  } catch {
    return false;
  }
}

/** Read a lock's content to check expiry. Returns null if missing. */
export async function readLock(pathname: string): Promise<{ createdAt: number } | null> {
  try {
    const result = await get(pathname, { access: "private" });
    if (!result) return null;
    const text = await new Response(result.stream).text();
    return JSON.parse(text) as { createdAt: number };
  } catch {
    return null;
  }
}

/** Delete a lock object. Best-effort: errors are swallowed. */
export async function deleteLock(pathname: string): Promise<void> {
  try {
    await del(pathname);
  } catch {
    // Lock cleanup is best-effort.
  }
}
