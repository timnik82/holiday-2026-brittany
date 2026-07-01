import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { toString } from "mdast-util-to-string";
import type { Heading, Root, RootContent } from "mdast";

/**
 * A single extracted, reviewable unit of a raw research document. Headings
 * are not blocks themselves — they only establish the `headingPath` context
 * for the blocks that follow them.
 */
export interface SourceBlock {
  /** Stable, sequential identifier, e.g. `chatgpt:b001`. */
  id: string;
  /** Heading text stack leading to this block, outermost first. */
  headingPath: string[];
  /** The underlying mdast node type (paragraph, list, table, code, html, blockquote). */
  nodeType: string;
  /** The original Markdown source for this block, unmodified. */
  markdown: string;
  /** 1-indexed, inclusive source line range of the block. */
  startLine: number;
  endLine: number;
}

/** Node types that become sequential, reviewable blocks. */
const BLOCK_NODE_TYPES = new Set([
  "paragraph",
  "list",
  "table",
  "code",
  "html",
  "blockquote",
]);

/** Node types that are always excluded, regardless of heading context. */
const EXCLUDED_NODE_TYPES = new Set([
  "footnoteDefinition",
  "thematicBreak",
  "yaml",
  "definition",
]);

function padId(n: number): string {
  return String(n).padStart(3, "0");
}

function extractSource(
  lines: string[],
  startLine: number,
  endLine: number
): string {
  // startLine/endLine are 1-indexed and inclusive, matching mdast `position`.
  return lines.slice(startLine - 1, endLine).join("\n");
}

/**
 * Deterministically extract stable, reviewable blocks from a single raw
 * research document. Headings establish context (the `headingPath`);
 * top-level paragraphs, lists, tables, code blocks, raw HTML, and
 * blockquotes become sequential blocks. Footnote definitions, thematic
 * breaks, and any content nested under a `stopHeadings` heading (e.g. a
 * "Works cited" or "Источники" section) are excluded entirely.
 *
 * Running this function twice on unchanged input always produces an
 * identical result (pure function of `markdown`, `slug`, and `stopHeadings`).
 */
export function extractBlocks(
  markdown: string,
  slug: string,
  stopHeadings: string[] = []
): SourceBlock[] {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown) as Root;
  const lines = markdown.split("\n");
  const stopSet = new Set(stopHeadings.map((h) => h.trim()));

  const blocks: SourceBlock[] = [];
  const headingStack: { depth: number; text: string }[] = [];

  let counter = 0;
  // When set, we are skipping content nested under a stop heading until a
  // heading at or above this depth is encountered.
  let skipDepth: number | null = null;

  for (const node of tree.children as RootContent[]) {
    if (node.type === "heading") {
      const heading = node as Heading;
      const text = toString(heading).trim();

      // Pop any headings at the same or deeper level.
      while (
        headingStack.length > 0 &&
        headingStack[headingStack.length - 1].depth >= heading.depth
      ) {
        headingStack.pop();
      }
      headingStack.push({ depth: heading.depth, text });

      if (skipDepth !== null && heading.depth <= skipDepth) {
        skipDepth = null;
      }

      if (skipDepth === null && stopSet.has(text)) {
        skipDepth = heading.depth;
      }

      continue;
    }

    if (EXCLUDED_NODE_TYPES.has(node.type)) {
      continue;
    }

    if (!BLOCK_NODE_TYPES.has(node.type)) {
      continue;
    }

    if (skipDepth !== null) {
      continue;
    }

    const startLine = node.position?.start.line;
    const endLine = node.position?.end.line;
    if (startLine == null || endLine == null) {
      continue;
    }

    counter++;
    blocks.push({
      id: `${slug}:b${padId(counter)}`,
      headingPath: headingStack.map((h) => h.text),
      nodeType: node.type,
      markdown: extractSource(lines, startLine, endLine),
      startLine,
      endLine,
    });
  }

  return blocks;
}
