import { describe, it, expect } from "vitest";
import { extractBlocks } from "../source-blocks";

describe("extractBlocks", () => {
  it("assigns sequential slug-prefixed IDs to top-level content", () => {
    const md = `# Title\n\nFirst paragraph.\n\n- item one\n- item two\n\n| a | b |\n| - | - |\n| 1 | 2 |\n`;
    const blocks = extractBlocks(md, "chatgpt");
    expect(blocks.map((b) => b.id)).toEqual([
      "chatgpt:b001",
      "chatgpt:b002",
      "chatgpt:b003",
    ]);
    expect(blocks.map((b) => b.nodeType)).toEqual(["paragraph", "list", "table"]);
  });

  it("uses headings to establish context without creating blocks of their own", () => {
    const md = `# Doc\n\n## Section A\n\nParagraph under A.\n\n### Subsection\n\nParagraph under subsection.\n\n## Section B\n\nParagraph under B.\n`;
    const blocks = extractBlocks(md, "gemini");
    expect(blocks).toHaveLength(3);
    expect(blocks[0].headingPath).toEqual(["Doc", "Section A"]);
    expect(blocks[1].headingPath).toEqual(["Doc", "Section A", "Subsection"]);
    expect(blocks[2].headingPath).toEqual(["Doc", "Section B"]);
  });

  it("excludes footnote definitions", () => {
    const md = `Paragraph with a reference.[^1]\n\n[^1]: https://example.com/citation\n`;
    const blocks = extractBlocks(md, "perplexity");
    expect(blocks).toHaveLength(1);
    expect(blocks[0].nodeType).toBe("paragraph");
  });

  it("excludes content under stopHeadings until the next heading at the same or shallower depth", () => {
    const md = `# Doc\n\n## Body\n\nSubstantive paragraph.\n\n## Works cited\n\n1. First source\n2. Second source\n\n## Appendix\n\nAnother substantive paragraph.\n`;
    const blocks = extractBlocks(md, "gemini-britany", ["Works cited"]);
    expect(blocks).toHaveLength(2);
    expect(blocks[0].markdown).toContain("Substantive paragraph.");
    expect(blocks[1].markdown).toContain("Another substantive paragraph.");
    expect(blocks[1].headingPath).toEqual(["Doc", "Appendix"]);
  });

  it("matches a stopHeading's plain text even when the heading uses markdown formatting", () => {
    const md = `# Doc\n\n#### **Works cited**\n\n1. First source\n`;
    const blocks = extractBlocks(md, "gemini-britany", ["Works cited"]);
    expect(blocks).toHaveLength(0);
  });

  it("captures the original markdown and source line range for each block", () => {
    const md = `# Doc\n\nLine two paragraph.\n`;
    const blocks = extractBlocks(md, "chatgpt");
    expect(blocks[0].markdown).toBe("Line two paragraph.");
    expect(blocks[0].startLine).toBe(3);
    expect(blocks[0].endLine).toBe(3);
  });

  it("is deterministic across repeated runs of the same input", () => {
    const md = `# Doc\n\nParagraph.\n\n- one\n- two\n`;
    const first = extractBlocks(md, "chatgpt");
    const second = extractBlocks(md, "chatgpt");
    expect(second).toEqual(first);
  });

  it("produces identical blocks for LF and CRLF checkouts", () => {
    const lf = `# Doc\n\nParagraph.\n\n- one\n- two\n`;
    const crlf = lf.replace(/\n/g, "\r\n");

    expect(extractBlocks(crlf, "chatgpt")).toEqual(
      extractBlocks(lf, "chatgpt")
    );
  });
});
