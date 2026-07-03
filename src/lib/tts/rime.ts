import "server-only";

import { requireEnv } from "@/lib/auth/env";
import { RIME_ENDPOINT, RIME_TIMEOUT_MS, TTS_PROFILE } from "./config";

/**
 * Rime TTS adapter.
 *
 * Calls `POST https://users.rime.ai/v1/rime-tts` with a bearer API key,
 * requesting `audio/mpeg` output via the `Accept` header. Returns the raw
 * audio bytes buffered into a `Uint8Array`.
 *
 * Errors are mapped to typed failures so the caller can distinguish
 * configuration problems (bad key) from retryable upstream issues.
 */

export type RimeFailure =
  | { kind: "configuration"; status: number }
  | { kind: "quota"; status: number }
  | { kind: "upstream"; status: number | null };

export class RimeError extends Error {
  constructor(public readonly failure: RimeFailure, message: string) {
    super(message);
    this.name = "RimeError";
  }
}

/**
 * Generate audio for `text` via Rime. Throws `RimeError` on any failure.
 * Resolves with the complete MP3 audio bytes.
 */
export async function generateAudio(text: string): Promise<Uint8Array> {
  const apiKey = requireEnv("RIME_API_KEY");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), RIME_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(RIME_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: TTS_PROFILE.accept,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        speaker: TTS_PROFILE.speaker,
        modelId: TTS_PROFILE.modelId,
        samplingRate: TTS_PROFILE.samplingRate,
        lang: TTS_PROFILE.lang,
      }),
      signal: controller.signal,
    });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new RimeError({ kind: "upstream", status: null }, "Rime request timed out");
    }
    throw new RimeError({ kind: "upstream", status: null }, `Network error: ${(error as Error).message}`);
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 401 || response.status === 403) {
    throw new RimeError({ kind: "configuration", status: response.status }, "Rime authentication failed");
  }
  if (response.status === 429) {
    throw new RimeError({ kind: "quota", status: 429 }, "Rime quota or rate limit exceeded");
  }
  if (response.status >= 500) {
    throw new RimeError({ kind: "upstream", status: response.status }, `Rime server error: ${response.status}`);
  }
  if (!response.ok) {
    throw new RimeError({ kind: "upstream", status: response.status }, `Rime error: ${response.status}`);
  }

  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
}
