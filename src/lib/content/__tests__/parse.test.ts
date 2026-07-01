import { describe, it, expect } from "vitest";
import { parseContent, validateParsedContent } from "../parse";
import type { ParsedContent } from "../types";

describe("parseContent", () => {
  it("strips the paragraph metadata comment", () => {
    const md = `<!-- paragraph id="intro-1" sources="src-a" -->\nHello world.`;
    const result = parseContent(md) as ParsedContent;
    expect(result.strippedMarkdown).not.toContain("<!-- paragraph");
    expect(result.strippedMarkdown).toContain("Hello world.");
  });

  it("assigns the paragraph ID from the comment", () => {
    const md = `<!-- paragraph id="para-1" sources="" -->\nSome text here.`;
    const result = parseContent(md) as ParsedContent;
    expect(result.paragraphs).toHaveLength(1);
    expect(result.paragraphs[0].id).toBe("para-1");
  });

  it("extracts comma-separated evidence references", () => {
    const md = `<!-- paragraph id="p1" sources="ref-a, ref-b, ref-c" -->\nContent.`;
    const result = parseContent(md) as ParsedContent;
    expect(result.paragraphs[0].evidenceRefs).toEqual([
      "ref-a",
      "ref-b",
      "ref-c",
    ]);
  });

  it("hashes normalized text with SHA-256", () => {
    const md = `<!-- paragraph id="p1" sources="" -->\nHello world.`;
    const result = parseContent(md) as ParsedContent;
    expect(result.paragraphs[0].hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("produces consistent hash for same text with different whitespace", () => {
    const md1 = `<!-- paragraph id="p1" sources="" -->\nHello   world.`;
    const md2 = `<!-- paragraph id="p1" sources="" -->\nHello world.`;
    const r1 = parseContent(md1) as ParsedContent;
    const r2 = parseContent(md2) as ParsedContent;
    expect(r1.paragraphs[0].hash).toBe(r2.paragraphs[0].hash);
  });

  it("rejects duplicate paragraph IDs (keeps first occurrence only)", () => {
    const md = [
      `<!-- paragraph id="dup" sources="" -->`,
      `First paragraph.`,
      ``,
      `<!-- paragraph id="dup" sources="" -->`,
      `Second paragraph.`,
    ].join("\n");
    const result = parseContent(md) as ParsedContent;
    expect(result.paragraphs).toHaveLength(1);
    expect(result.paragraphs[0].text).toBe("First paragraph.");
  });

  it("rejects paragraphs over 500 characters", () => {
    const longText = "A".repeat(501);
    const md = `<!-- paragraph id="long" sources="" -->\n${longText}`;
    const result = parseContent(md) as ParsedContent;
    expect(result.paragraphs).toHaveLength(0);
  });

  it("marks headings as non-narratable", () => {
    const md = `<!-- paragraph id="h1" sources="" -->\n# A Heading`;
    const result = parseContent(md) as ParsedContent;
    expect(result.paragraphs).toHaveLength(1);
    expect(result.paragraphs[0].narratable).toBe(false);
  });

  it("marks lists as non-narratable", () => {
    const md = `<!-- paragraph id="list1" sources="" -->\n- Item one\n- Item two`;
    const result = parseContent(md) as ParsedContent;
    expect(result.paragraphs).toHaveLength(1);
    expect(result.paragraphs[0].narratable).toBe(false);
  });

  it("marks tables as non-narratable", () => {
    const md = [
      `<!-- paragraph id="tbl" sources="" -->`,
      `| A | B |`,
      `|---|---|`,
      `| 1 | 2 |`,
    ].join("\n");
    const result = parseContent(md) as ParsedContent;
    expect(result.paragraphs).toHaveLength(1);
    expect(result.paragraphs[0].narratable).toBe(false);
  });

  it("handles paragraphs with empty sources", () => {
    const md = `<!-- paragraph id="p1" sources="" -->\nNo sources.`;
    const result = parseContent(md) as ParsedContent;
    expect(result.paragraphs[0].evidenceRefs).toEqual([]);
  });

  it("ignores paragraphs without metadata comments", () => {
    const md = `Just a regular paragraph without any comment.`;
    const result = parseContent(md) as ParsedContent;
    expect(result.paragraphs).toHaveLength(0);
  });

  it("tolerates a blank line between the comment and the paragraph", () => {
    const md = `<!-- paragraph id="p1" sources="src-a" -->\n\nHello world.`;
    const result = parseContent(md) as ParsedContent;
    expect(result.paragraphs).toHaveLength(1);
    expect(result.paragraphs[0].id).toBe("p1");
    expect(result.paragraphs[0].text).toBe("Hello world.");
    expect(result.paragraphs[0].evidenceRefs).toEqual(["src-a"]);
  });

  it("tolerates a blank line before a non-narratable node", () => {
    const md = [
      `<!-- paragraph id="h1" sources="" -->`,
      ``,
      `# A Heading`,
    ].join("\n");
    const result = parseContent(md) as ParsedContent;
    expect(result.paragraphs).toHaveLength(1);
    expect(result.paragraphs[0].id).toBe("h1");
    expect(result.paragraphs[0].narratable).toBe(false);
  });
});

describe("validateParsedContent", () => {
  it("returns error for duplicate paragraph IDs", () => {
    const md = [
      `<!-- paragraph id="dup" sources="" -->`,
      `First.`,
      ``,
      `<!-- paragraph id="dup" sources="" -->`,
      `Second.`,
    ].join("\n");
    const errors = validateParsedContent(md, "test.md");
    expect(errors.some((e) => e.message.includes("Duplicate"))).toBe(true);
  });

  it("returns error for oversized paragraphs", () => {
    const longText = "B".repeat(501);
    const md = `<!-- paragraph id="big" sources="" -->\n${longText}`;
    const errors = validateParsedContent(md, "test.md");
    expect(errors.some((e) => e.message.includes("exceeds"))).toBe(true);
  });

  it("returns empty errors for valid content", () => {
    const md = `<!-- paragraph id="ok" sources="s1" -->\nValid paragraph.`;
    const errors = validateParsedContent(md, "test.md");
    expect(errors).toHaveLength(0);
  });

  it("flags oversized paragraphs even with a blank line before them", () => {
    const longText = "C".repeat(501);
    const md = `<!-- paragraph id="big" sources="" -->\n\n${longText}`;
    const errors = validateParsedContent(md, "test.md");
    expect(errors.some((e) => e.message.includes("exceeds"))).toBe(true);
  });

  it("flags a malformed paragraph comment (e.g. single quotes)", () => {
    const md = `<!-- paragraph id='bad' sources='' -->\nSome text.`;
    const errors = validateParsedContent(md, "test.md");
    expect(errors.some((e) => e.message.includes("Malformed"))).toBe(true);
  });

  it("does not flag unrelated HTML comments", () => {
    const md = `<!-- just a regular comment -->\nSome text.`;
    const errors = validateParsedContent(md, "test.md");
    expect(errors).toHaveLength(0);
  });
});
