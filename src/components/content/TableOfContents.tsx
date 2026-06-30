import React from "react";

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
        {headings.map((h) => (
          <li key={h.id} className={`toc-item toc-level-${h.level}`}>
            <a href={`#${h.id}`}>{h.text}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function extractHeadings(markdown: string): TocItem[] {
  const headingRe = /^(#{2,4})\s+(.+)$/gm;
  const items: TocItem[] = [];
  let match;

  while ((match = headingRe.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    items.push({ id, text, level });
  }

  return items;
}
