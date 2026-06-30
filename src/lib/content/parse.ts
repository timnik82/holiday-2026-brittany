import { createHash } from "node:crypto";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";
import { toString } from "mdast-util-to-string";
import type { Paragraph } from "mdast";
import type { ParagraphRecord, ParsedContent } from "./types";

const PARAGRAPH_COMMENT_RE =
  /<!--\s*paragraph\s+id="([^"]+)"\s+sources="([^"]*)"\s*-->/;

const MAX_PARAGRAPH_LENGTH = 500;

/** Node types that are not narratable (not spoken by TTS) */
const NON_NARRATABLE_TYPES = new Set([
  "heading",
  "list",
  "table",
  "html",
  "code",
  "thematicBreak",
]);

function hashText(text: string): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  return createHash("sha256").update(normalized).digest("hex");
}

export interface ParseError {
  message: string;
}

export function parseContent(markdown: string): ParsedContent | ParseError {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown);

  const paragraphs: ParagraphRecord[] = [];
  const seenIds = new Set<string>();
  const strippedLines: string[] = [];
  const lines = markdown.split("\n");

  // First pass: identify paragraph comment -> paragraph pairs
  // Build a map of line indices that are paragraph comments
  const commentLineMap = new Map<
    number,
    { id: string; sources: string[] }
  >();

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].trim().match(PARAGRAPH_COMMENT_RE);
    if (match) {
      const id = match[1];
      const sources = match[2]
        ? match[2].split(",").map((s) => s.trim()).filter(Boolean)
        : [];
      commentLineMap.set(i, { id, sources });
    }
  }

  // Build stripped markdown (comments removed)
  for (let i = 0; i < lines.length; i++) {
    if (!commentLineMap.has(i)) {
      strippedLines.push(lines[i]);
    }
  }

  // Walk the AST to find paragraph nodes
  // We need to associate each paragraph with its preceding comment
  visit(tree, (node) => {
    if (node.type === "paragraph") {
      const para = node as Paragraph;
      const startLine = para.position?.start.line;
      if (startLine == null) return;

      // Check if the previous line (0-indexed: startLine - 2) is a comment
      const commentLineIdx = startLine - 2; // lines are 0-indexed, AST is 1-indexed
      const meta = commentLineMap.get(commentLineIdx);

      if (!meta) return; // No metadata comment = not a tracked paragraph

      const text = toString(para);

      // Validate
      if (seenIds.has(meta.id)) {
        return;
      }

      if (text.length > MAX_PARAGRAPH_LENGTH) {
        return;
      }

      seenIds.add(meta.id);
      paragraphs.push({
        id: meta.id,
        text,
        hash: hashText(text),
        evidenceRefs: meta.sources,
        narratable: true,
      });
    } else if (NON_NARRATABLE_TYPES.has(node.type)) {
      // Check if there's a comment before this non-narratable node
      const startLine = node.position?.start.line;
      if (startLine == null) return;
      const commentLineIdx = startLine - 2;
      const meta = commentLineMap.get(commentLineIdx);
      if (!meta) return;

      if (seenIds.has(meta.id)) return;

      const text = toString(node);
      seenIds.add(meta.id);
      paragraphs.push({
        id: meta.id,
        text,
        hash: hashText(text),
        evidenceRefs: meta.sources,
        narratable: false,
      });
    }
  });

  return { strippedMarkdown: strippedLines.join("\n"), paragraphs };
}

/**
 * Validate parsed content, returning errors if any.
 */
export function validateParsedContent(
  markdown: string,
  filePath: string
): ParseError[] {
  const errors: ParseError[] = [];
  const lines = markdown.split("\n");
  const seenIds = new Set<string>();

  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown);

  // Find all comments and validate
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].trim().match(PARAGRAPH_COMMENT_RE);
    if (match) {
      const id = match[1];
      if (seenIds.has(id)) {
        errors.push({
          message: `${filePath}: Duplicate paragraph ID "${id}" at line ${i + 1}`,
        });
      }
      seenIds.add(id);
    }
  }

  // Check paragraph lengths
  visit(tree, "paragraph", (node: Paragraph) => {
    const startLine = node.position?.start.line;
    if (startLine == null) return;
    const commentLineIdx = startLine - 2;
    const commentMatch = lines[commentLineIdx]?.trim().match(PARAGRAPH_COMMENT_RE);
    if (!commentMatch) return;

    const text = toString(node);
    if (text.length > MAX_PARAGRAPH_LENGTH) {
      errors.push({
        message: `${filePath}: Paragraph "${commentMatch[1]}" exceeds ${MAX_PARAGRAPH_LENGTH} characters (${text.length}) at line ${startLine}`,
      });
    }
  });

  return errors;
}
