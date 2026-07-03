import "server-only";

import {
  LOCK_EXPIRY_MS,
  LOCK_POLL_ATTEMPTS,
  LOCK_POLL_INTERVAL_MS,
} from "./config";
import {
  audioExists,
  deleteLock,
  putLock,
  readLock,
} from "./blob";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Distributed-lock helper to prevent duplicate generation.
 *
 * Before calling Rime, the service acquires a lock at
 * `tts-locks/<cacheKey>.json`. If the lock is already held by another
 * request, the contender polls for the finished audio with bounded backoff
 * instead of calling Rime a second time. Locks expire after 2 minutes so a
 * crashed generator does not block forever.
 *
 * `acquireLock` returns `true` if the caller owns the lock (and should
 * generate) or `false` if a concurrent request is generating and the
 * audio appeared during polling (the caller should treat this as a cache
 * hit).
 *
 * @throws if polling exhausts attempts without the audio appearing.
 */
export async function acquireLock(
  lockPath: string,
  audioPath: string,
  now: number = Date.now(),
): Promise<boolean> {
  // Try to create the lock.
  if (await putLock(lockPath, now)) {
    return true;
  }

  // Lock already exists — check if it's stale.
  const existing = await readLock(lockPath);
  if (existing && now - existing.createdAt > LOCK_EXPIRY_MS) {
    // Stale lock: remove and try to acquire.
    await deleteLock(lockPath);
    if (await putLock(lockPath, now)) {
      return true;
    }
  }

  // Another request is generating. Poll for the finished audio.
  return pollForAudio(audioPath);
}

/**
 * Release a held lock. Best-effort: errors are swallowed so a cleanup failure
 * never masks the real result of a generation call. Stale locks are reclaimed
 * by `acquireLock` on the next request.
 */
export async function releaseLock(lockPath: string): Promise<void> {
  await deleteLock(lockPath);
}

/**
 * Poll for audio existence with bounded backoff. Returns `true` if the audio
 * appeared (cache hit), throws if it never appeared within the attempt budget.
 */
async function pollForAudio(audioPath: string): Promise<boolean> {
  for (let i = 0; i < LOCK_POLL_ATTEMPTS; i++) {
    await sleep(LOCK_POLL_INTERVAL_MS);
    if (await audioExists(audioPath)) {
      return true;
    }
  }
  throw new Error("Timed out waiting for audio generation by another request");
}
