// @vitest-environment node

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

// Mock auth — make requireApiSession a no-op by default (authenticated).
const mockRequireApiSession = vi.fn();
vi.mock("@/lib/auth/require-session", () => ({
  requireApiSession: (...args: unknown[]) => mockRequireApiSession(...args),
}));

// Mock the service
const mockGenerate = vi.fn();
vi.mock("@/lib/tts/service", () => ({
  generateOrRetrieveAudio: (...args: unknown[]) => mockGenerate(...args),
  TtsError: class TtsError extends Error {
    constructor(
      public statusCode: number,
      message: string,
    ) {
      super(message);
      this.name = "TtsError";
    }
  },
}));

import { POST } from "../route";
import { TtsError } from "@/lib/tts/service";

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/tts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireApiSession.mockResolvedValue(undefined);
  });

  it("returns 401 when unauthenticated", async () => {
    // requireApiSession throws a Response on failure — the route lets it
    // propagate, so we need to catch it here.
    mockRequireApiSession.mockRejectedValue(
      new Response("Unauthorized", { status: 401 }),
    );

    await expect(POST(makeRequest({ paragraphId: "test" }))).rejects.toMatchObject({
      status: 401,
    });
  });

  it("returns 400 for invalid body (missing paragraphId)", async () => {
    const response = await POST(makeRequest({}));

    expect(response.status).toBe(400);
    expect(mockGenerate).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid body (arbitrary text instead of paragraphId)", async () => {
    const response = await POST(makeRequest({ text: "speak this" }));

    expect(response.status).toBe(400);
    expect(mockGenerate).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid JSON body", async () => {
    const response = await POST(makeRequest("not json{"));

    expect(response.status).toBe(400);
  });

  it("returns cacheKey on success", async () => {
    mockGenerate.mockResolvedValue({
      status: "generated",
      audioPath: "tts/abc123def456.mp3",
    });

    const response = await POST(makeRequest({ paragraphId: "test-para" }));

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.cacheKey).toBe("abc123def456");
    expect(json.status).toBe("generated");
  });

  it("returns the service error status on TtsError", async () => {
    mockGenerate.mockRejectedValue(new TtsError(404, "Not found"));

    const response = await POST(makeRequest({ paragraphId: "missing" }));

    expect(response.status).toBe(404);
  });
});
