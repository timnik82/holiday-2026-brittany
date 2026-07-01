import { describe, expect, it } from "vitest";
import type { EvidenceRecord } from "../evidence";
import {
  getSourceBlockLinks,
  requireEvidenceRecords,
} from "../evidence-links";

const evidence: EvidenceRecord = {
  id: "evidence:test-ranking",
  text: "A reviewed ranking claim.",
  kind: "recommendation",
  sourceBlockRefs: ["chatgpt:b001", "perplexity:b002"],
  sourceUrls: [],
  qualifiers: [],
  timeSensitive: false,
};

describe("requireEvidenceRecords", () => {
  it("fails when an expected evidence record is missing", () => {
    const records = new Map([[evidence.id, evidence]]);

    expect(() =>
      requireEvidenceRecords(records, ["evidence:missing"], "source rankings")
    ).toThrow('source rankings references missing evidence "evidence:missing"');
  });
});

describe("getSourceBlockLinks", () => {
  it("returns a link for every supporting source block", () => {
    expect(getSourceBlockLinks([evidence])).toEqual([
      {
        ref: "chatgpt:b001",
        sourceSlug: "chatgpt",
        href: "/sources/chatgpt#block-chatgpt:b001",
      },
      {
        ref: "perplexity:b002",
        sourceSlug: "perplexity",
        href: "/sources/perplexity#block-perplexity:b002",
      },
    ]);
  });
});
