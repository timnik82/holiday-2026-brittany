import { describe, it, expect } from "vitest";
import { coverageSchema, coverageOutcomeSchema } from "../coverage";

describe("coverage outcome schema", () => {
  it("rejects the temporary draft outcome", () => {
    const result = coverageOutcomeSchema.safeParse({
      status: "draft",
      plannedArea: "climate",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a retained outcome with evidence and paragraph ids", () => {
    const result = coverageOutcomeSchema.safeParse({
      status: "retained",
      evidenceIds: ["evidence:foo"],
      paragraphIds: ["method-1"],
    });
    expect(result.success).toBe(true);
  });

  it("requires paragraphIds for a retained outcome", () => {
    const result = coverageOutcomeSchema.safeParse({
      status: "retained",
      evidenceIds: ["evidence:foo"],
      paragraphIds: [],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a duplicate outcome with a retained evidence id", () => {
    const result = coverageOutcomeSchema.safeParse({
      status: "duplicate",
      retainedEvidenceId: "evidence:foo",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a conflict outcome with two evidence ids and interpretation", () => {
    const result = coverageOutcomeSchema.safeParse({
      status: "conflict",
      conflictId: "conflict:sea-temp",
      evidenceIds: ["evidence:claim-a", "evidence:claim-b"],
      paragraphIds: ["sources-1"],
      interpretation: "Use the wider range for planning.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a conflict with fewer than two evidence ids", () => {
    const result = coverageOutcomeSchema.safeParse({
      status: "conflict",
      conflictId: "conflict:sea-temp",
      evidenceIds: ["evidence:claim-a"],
      paragraphIds: ["sources-1"],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown status", () => {
    const result = coverageOutcomeSchema.safeParse({
      status: "resolved",
      evidenceIds: ["evidence:foo"],
    });
    expect(result.success).toBe(false);
  });
});

describe("coverage map schema", () => {
  it("accepts a record keyed by block id", () => {
    const result = coverageSchema.safeParse({
      "chatgpt:b001": {
        status: "duplicate",
        retainedEvidenceId: "evidence:foo",
      },
      "chatgpt:b002": {
        status: "retained",
        evidenceIds: ["evidence:foo"],
        paragraphIds: ["method-1"],
      },
    });
    expect(result.success).toBe(true);
  });
});
