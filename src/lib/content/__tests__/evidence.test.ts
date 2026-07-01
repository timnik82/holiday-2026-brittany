import { describe, it, expect } from "vitest";
import { evidenceSchema, evidenceRegistrySchema } from "../evidence";

function validBase() {
  return {
    id: "evidence:test-claim",
    text: "A concise English claim.",
    kind: "fact" as const,
    sourceBlockRefs: ["chatgpt:b001"],
    sourceUrls: [],
    qualifiers: [],
    timeSensitive: false,
  };
}

describe("evidence schema", () => {
  it("accepts a minimal non-time-sensitive record without checkedAt", () => {
    const result = evidenceSchema.safeParse(validBase());
    expect(result.success).toBe(true);
  });

  it("requires checkedAt when timeSensitive is true", () => {
    const record = { ...validBase(), timeSensitive: true };
    const result = evidenceSchema.safeParse(record);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("checkedAt"))).toBe(true);
    }
  });

  it("accepts a time-sensitive record with checkedAt", () => {
    const record = { ...validBase(), timeSensitive: true, checkedAt: "2026-06-30" };
    const result = evidenceSchema.safeParse(record);
    expect(result.success).toBe(true);
  });

  it("rejects an id that does not start with evidence:", () => {
    const result = evidenceSchema.safeParse({ ...validBase(), id: "bad-id" });
    expect(result.success).toBe(false);
  });

  it("requires at least one source block reference", () => {
    const result = evidenceSchema.safeParse({ ...validBase(), sourceBlockRefs: [] });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid evidence kind", () => {
    const result = evidenceSchema.safeParse({ ...validBase(), kind: "opinion" });
    expect(result.success).toBe(false);
  });

  it("validates each url in sourceUrls", () => {
    const result = evidenceSchema.safeParse({
      ...validBase(),
      sourceUrls: ["not-a-url"],
    });
    expect(result.success).toBe(false);
  });
});

describe("evidence registry schema", () => {
  it("accepts an array of valid evidence records", () => {
    const result = evidenceRegistrySchema.safeParse([validBase()]);
    expect(result.success).toBe(true);
  });

  it("rejects a non-array registry", () => {
    const result = evidenceRegistrySchema.safeParse({ records: [validBase()] });
    expect(result.success).toBe(false);
  });
});
