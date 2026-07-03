// @vitest-environment node

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

// Mock the content registry so we control which paragraphs exist.
vi.mock("@/lib/content/registry", () => ({
  loadContentPages: vi.fn(() => [
    {
      category: "bases",
      page: {
        slug: "saint-malo-dinan",
        title: "Saint-Malo",
        summary: "A base",
        updatedAt: "2026-07-01",
        status: "review",
        content: "",
        paragraphs: [
          {
            id: "narratable-paragraph",
            text: "This is a long enough paragraph for narration testing purposes.",
            hash: "hash-narratable",
            evidenceRefs: [],
            narratable: true,
          },
          {
            id: "non-narratable-paragraph",
            text: "A heading node text",
            hash: "hash-non-narratable",
            evidenceRefs: [],
            narratable: false,
          },
        ],
      },
      frontmatter: {},
    },
  ]),
}));

// We need the real RimeError class so `instanceof` works in service.ts.
// Import it before mocking so the class identity is preserved.
import { RimeError } from "../rime";

// Mock the generateAudio function (but keep RimeError real).
vi.mock("../rime", async () => {
  const actual = await vi.importActual<typeof import("../rime")>("../rime");
  return {
    ...actual,
    generateAudio: vi.fn(),
  };
});

// Mock Blob adapter
vi.mock("../blob", () => ({
  audioExists: vi.fn(),
  putAudioIdempotent: vi.fn(),
}));

// Mock locks so we always "own" the lock (lock contention tested separately)
vi.mock("../locks", () => ({
  acquireLock: vi.fn(),
  releaseLock: vi.fn(),
}));

import { generateOrRetrieveAudio } from "../service";
import { generateAudio } from "../rime";
import { audioExists, putAudioIdempotent } from "../blob";
import { acquireLock, releaseLock } from "../locks";

const mockGenerateAudio = vi.mocked(generateAudio);
const mockAudioExists = vi.mocked(audioExists);
const mockPutAudioIdempotent = vi.mocked(putAudioIdempotent);
const mockAcquireLock = vi.mocked(acquireLock);
const mockReleaseLock = vi.mocked(releaseLock);

describe("TTS service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAcquireLock.mockResolvedValue(true);
    mockReleaseLock.mockResolvedValue(undefined);
    mockPutAudioIdempotent.mockResolvedValue("blob-url");
  });

  it("rejects an unknown paragraph id with 404", async () => {
    await expect(generateOrRetrieveAudio("nonexistent")).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("rejects a non-narratable paragraph with 400", async () => {
    await expect(
      generateOrRetrieveAudio("non-narratable-paragraph"),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("serves a cache hit without calling Rime", async () => {
    mockAudioExists.mockResolvedValue(true);

    const result = await generateOrRetrieveAudio("narratable-paragraph");

    expect(result.status).toBe("hit");
    expect(mockGenerateAudio).not.toHaveBeenCalled();
    expect(mockAcquireLock).not.toHaveBeenCalled();
  });

  it("generates audio on a cache miss (calls Rime exactly once)", async () => {
    mockAudioExists.mockResolvedValue(false);
    mockGenerateAudio.mockResolvedValue(new Uint8Array([1, 2, 3]));

    const result = await generateOrRetrieveAudio("narratable-paragraph");

    expect(result.status).toBe("generated");
    expect(mockGenerateAudio).toHaveBeenCalledTimes(1);
    expect(mockPutAudioIdempotent).toHaveBeenCalledTimes(1);
    expect(mockReleaseLock).toHaveBeenCalledTimes(1);
  });

  it("maps a Rime upstream failure to 503", async () => {
    mockAudioExists.mockResolvedValue(false);
    mockGenerateAudio.mockRejectedValue(
      new RimeError({ kind: "upstream", status: 500 }, "Server error"),
    );

    await expect(
      generateOrRetrieveAudio("narratable-paragraph"),
    ).rejects.toMatchObject({ statusCode: 503 });
    expect(mockReleaseLock).toHaveBeenCalledTimes(1);
  });

  it("maps a Rime configuration failure to 500", async () => {
    mockAudioExists.mockResolvedValue(false);
    mockGenerateAudio.mockRejectedValue(
      new RimeError({ kind: "configuration", status: 401 }, "Auth failed"),
    );

    await expect(
      generateOrRetrieveAudio("narratable-paragraph"),
    ).rejects.toMatchObject({ statusCode: 500 });
  });

  it("maps a Rime quota failure to 429", async () => {
    mockAudioExists.mockResolvedValue(false);
    mockGenerateAudio.mockRejectedValue(
      new RimeError({ kind: "quota", status: 429 }, "Rate limited"),
    );

    await expect(
      generateOrRetrieveAudio("narratable-paragraph"),
    ).rejects.toMatchObject({ statusCode: 429 });
  });

  it("returns a hit when another request generated during polling", async () => {
    mockAudioExists.mockResolvedValue(false);
    mockAcquireLock.mockResolvedValue(false);

    const result = await generateOrRetrieveAudio("narratable-paragraph");

    expect(result.status).toBe("hit");
    expect(mockGenerateAudio).not.toHaveBeenCalled();
  });
});
