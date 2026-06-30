import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CitationLink } from "./CitationLink";
import { TableOfContents } from "./TableOfContents";
import type { ParagraphRecord } from "@/lib/content/types";

interface MarkdownArticleProps {
  /** The stripped markdown content (no paragraph comments) */
  content: string;
  /** Paragraph records for citation linking */
  paragraphs: ParagraphRecord[];
  /** Whether to show table of contents */
  showToc?: boolean;
}

/**
 * Renders a GFM markdown article with citation links and table of contents.
 */
export function MarkdownArticle({
  content,
  paragraphs,
  showToc = true,
}: MarkdownArticleProps) {
  // Build citation map from paragraphs
  const citationMap = new Map<string, string[]>();
  for (const p of paragraphs) {
    if (p.evidenceRefs.length > 0) {
      citationMap.set(p.id, p.evidenceRefs);
    }
  }

  return (
    <article className="markdown-article">
      {showToc && <TableOfContents markdown={content} />}
      <div className="article-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h2: ({ children, ...props }) => {
              const text = String(children);
              const id = text
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");
              return (
                <h2 id={id} {...props}>
                  {children}
                </h2>
              );
            },
            h3: ({ children, ...props }) => {
              const text = String(children);
              const id = text
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");
              return (
                <h3 id={id} {...props}>
                  {children}
                </h3>
              );
            },
            h4: ({ children, ...props }) => {
              const text = String(children);
              const id = text
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");
              return (
                <h4 id={id} {...props}>
                  {children}
                </h4>
              );
            },
          }}
        />
        {/* Render citation links at end of article */}
        {citationMap.size > 0 && (
          <aside className="citations" aria-label="Citations">
            <h2>Sources</h2>
            <ul>
              {Array.from(citationMap.entries()).map(([paraId, refs]) => (
                <li key={paraId}>
                  {refs.map((ref) => (
                    <CitationLink key={ref} refKey={ref} />
                  ))}
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </article>
  );
}
