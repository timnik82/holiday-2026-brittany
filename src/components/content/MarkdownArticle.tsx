import React from "react";
import { createHash } from "node:crypto";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CitationLink } from "./CitationLink";
import { TableOfContents } from "./TableOfContents";
import { createSlugger } from "@/lib/content/slug";
import { ListenButton } from "@/components/tts/ListenButton";
import type { ParagraphRecord } from "@/lib/content/types";

/** Minimum paragraph length for a Listen button (short snippets don't need audio). */
const MIN_NARRATABLE_LENGTH = 150;

/**
 * Hash rendered paragraph text the same way `parseContent` does, so we can
 * match a rendered `<p>` to its `ParagraphRecord`. The normalisation
 * (collapse whitespace, trim) matches `hashText` in `parse.ts`.
 */
function hashRenderedText(text: string): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  return createHash("sha256").update(normalized).digest("hex");
}

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

  // Build a hash → paragraphId map for narratable paragraphs, so we can
  // attach a ListenButton to each rendered `<p>` that matches. Only
  // paragraphs with enough text to warrant narration are included.
  const narratableByHash = new Map<string, string>();
  for (const p of paragraphs) {
    if (p.narratable && p.text.length >= MIN_NARRATABLE_LENGTH) {
      narratableByHash.set(p.hash, p.id);
    }
  }

  // Shared across all heading levels (in render/document order) so repeated
  // headings get unique, de-duplicated anchor ids instead of colliding.
  const nextId = createSlugger();

  return (
    <article className="markdown-article">
      {showToc && <TableOfContents markdown={content} />}
      <div className="article-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h2: ({ children, ...props }) => {
              const id = nextId(extractText(children));
              return (
                <h2 id={id} {...props}>
                  {children}
                </h2>
              );
            },
            h3: ({ children, ...props }) => {
              const id = nextId(extractText(children));
              return (
                <h3 id={id} {...props}>
                  {children}
                </h3>
              );
            },
            h4: ({ children, ...props }) => {
              const id = nextId(extractText(children));
              return (
                <h4 id={id} {...props}>
                  {children}
                </h4>
              );
            },
            p: ({ children, ...props }) => {
              const text = extractText(children);
              const hash = hashRenderedText(text);
              const paragraphId = narratableByHash.get(hash);
              if (paragraphId) {
                return (
                  <p {...props}>
                    {children}
                    <ListenButton paragraphId={paragraphId} />
                  </p>
                );
              }
              return <p {...props}>{children}</p>;
            },
          }}
        >
          {content}
        </ReactMarkdown>
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

/**
 * Recursively extract plain text from React children so that headings rendered
 * with bold, italic, code, or link formatting produce a stable anchor id.
 * `String(children)` returns "[object Object]" for nested elements, which would
 * otherwise break the generated anchor links. Elements like `<img>` have no
 * `children`, so their `alt` (or `title`) text prop is used instead.
 */
function extractText(children: React.ReactNode): string {
  if (children == null || children === false || children === true) return "";
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(extractText).join("");
  }
  if (React.isValidElement(children)) {
    const props = children.props as {
      children?: React.ReactNode;
      alt?: string;
      title?: string;
    };
    const nested = extractText(props.children);
    if (nested) return nested;
    return props.alt ?? props.title ?? "";
  }
  return "";
}
