import React from "react";
import { createSlugger, stripInlineMarkdown } from "@/lib/content/slug";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  /** The markdown content to extract headings from */
  markdown: string;
}

/**
 * Generates a table of contents from heading elements in markdown.
 */
export function TableOfContents({ markdown }: TableOfContentsProps) {
  const headings = extractHeadings(markdown);

  if (headings.length === 0) return null;

  return (
    <nav aria-label="Table of contents" className="toc">
      <h2 className="toc-title">Contents</h2>
      <ol className="toc-list">
        {headings.map((h, index) => (
          <li key={`${index}-${h.id}`} className={`toc-item toc-level-${h.level}`}>
            <a href={`#${h.id}`}>{h.text}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function extractHeadings(markdown: string): TocItem[] {
  // CommonMark allows up to three leading spaces before an ATX heading marker.
  const headingRe = /^ {0,3}(#{2,4})\s+(.+)$/;
  // Matches the opening fence of a fenced code block: ``` or ~~~ (3+ chars).
  const fenceRe = /^(`{3,}|~{3,})/;
  const items: TocItem[] = [];
  const nextId = createSlugger();

  const lines = markdown.split("\n");
  let inFencedCode = false;
  let fenceMarker = "";

  for (const line of lines) {
    const fenceMatch = line.match(fenceRe);
    if (fenceMatch) {
      const marker = fenceMatch[1][0];
      if (!inFencedCode) {
        // Entering a fenced code block.
        inFencedCode = true;
        fenceMarker = marker;
      } else if (marker === fenceMarker) {
        // Closing fence must use the same character.
        inFencedCode = false;
        fenceMarker = "";
      }
      continue;
    }

    if (inFencedCode) continue;

    const match = line.match(headingRe);
    if (!match) continue;

    const level = match[1].length;
    const text = stripInlineMarkdown(match[2]);
    const id = nextId(text);
    items.push({ id, text, level });
  }

  return items;
}
