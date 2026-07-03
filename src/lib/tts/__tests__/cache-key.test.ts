import { describe, it, expect } from "vitest";
import { audioPathname, lockPathname, cacheKey } from "../cache-key";

describe("cache-key", () => {
  it("produces a deterministic key for the same hash", () => {
    const hash = "abc123";
    expect(cacheKey(hash)).toBe(cacheKey(hash));
    expect(audioPathname(hash)).toBe(audioPathname(hash));
  });

  it("produces a different key when the text hash changes", () => {
    const a = cacheKey("hash-a");
    const b = cacheKey("hash-b");
    expect(a).not.toBe(b);
  });

  it("returns a tts/ pathname with .mp3 extension", () => {
    const path = audioPathname("somehash");
    expect(path).toMatch(/^tts\/[a-f0-9]+\.mp3$/);
  });

  it("returns a tts-locks/ pathname with .json extension", () => {
    const path = lockPathname("somehash");
    expect(path).toMatch(/^tts-locks\/[a-f0-9]+\.json$/);
  });

  it("produces consistent prefix between audio and lock pathnames", () => {
    const hash = "consistent-test";
    const key = cacheKey(hash);
    expect(audioPathname(hash)).toBe(`tts/${key}.mp3`);
    expect(lockPathname(hash)).toBe(`tts-locks/${key}.json`);
  });
});
