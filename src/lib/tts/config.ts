import { guideConfig } from "@/config/guide";

/**
 * TTS generation profile. Every field that affects the audio output is part of
 * the cache key, so changing any of these (e.g. switching speaker or language)
 * produces a new key instead of serving a stale mismatch.
 *
 * Rime API notes:
 * - The output format is set via the `Accept` header (`accept`), not a body field.
 * - `lang` is the documented Rime body field; it is kept in the profile so a
 *   language change invalidates the cache.
 * - `samplingRate` is camelCase per the Rime HTTP reference.
 */
export const TTS_PROFILE = {
  modelId: "coda",
  speaker: "astra",
  lang: guideConfig.language,
  samplingRate: 24000,
  accept: "audio/mpeg",
} as const;

/** Rime endpoint for streaming text-to-speech. */
export const RIME_ENDPOINT = "https://users.rime.ai/v1/rime-tts";

/** Abort timeout for the Rime request, in milliseconds. */
export const RIME_TIMEOUT_MS = 30_000;

/** Lock expiry: a stale lock older than this may be removed and reacquired. */
export const LOCK_EXPIRY_MS = 2 * 60 * 1000;

/** How many times a lock contender polls for the finished audio. */
export const LOCK_POLL_ATTEMPTS = 3;

/** Delay between lock polls, in milliseconds. */
export const LOCK_POLL_INTERVAL_MS = 2_000;
