import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createHash } from "node:crypto";
import { createSlugger } from "@/lib/content/slug";
import { ListenButton } from "./ListenButton";
import type { ParagraphRecord } from "@/lib/content/types";

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

/**
 * Recursively extract plain text from React children so paragraphs rendered
 * with bold, italic, code, or link formatting produce the same text that was
 * hashed during content parsing.
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

interface NarratableContentProps {
  /** Stripped markdown content (paragraph comments removed). */
  content: string;
  /** Paragraph records for this page, used to match rendered `<p>` tags. */
  paragraphs: ParagraphRecord[];
}

/**
 * Renders a GFM markdown article with Listen buttons attached to narratable
 * paragraphs over the minimum length threshold. Used by base, route,
 * things-to-do, and plan detail pages — any page that renders reviewed
 * content with paragraph metadata.
 *
 * The hash-based matching ensures only paragraphs with a tracked `id` get a
 * Listen button; untracked `<p>` tags (e.g. in tables or lists) render normally.
 */
export function NarratableContent({ content, paragraphs }: NarratableContentProps) {
  const narratableByHash = new Map<string, string[]>();
  for (const p of paragraphs) {
    if (p.narratable && p.text.length >= MIN_NARRATABLE_LENGTH) {
      const ids = narratableByHash.get(p.hash) ?? [];
      ids.push(p.id);
      narratableByHash.set(p.hash, ids);
    }
  }
  const occurrenceByHash = new Map<string, number>();

  const nextId = createSlugger();

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h2: ({ node: _node, children, ...props }) => (
          <h2 id={nextId(extractText(children))} {...props}>
            {children}
          </h2>
        ),
        h3: ({ node: _node, children, ...props }) => (
          <h3 id={nextId(extractText(children))} {...props}>
            {children}
          </h3>
        ),
        h4: ({ node: _node, children, ...props }) => (
          <h4 id={nextId(extractText(children))} {...props}>
            {children}
          </h4>
        ),
        p: ({ node: _node, children, ...props }) => {
          const text = extractText(children);
          const hash = hashRenderedText(text);
          const occurrence = occurrenceByHash.get(hash) ?? 0;
          const paragraphId = narratableByHash.get(hash)?.[occurrence];
          occurrenceByHash.set(hash, occurrence + 1);
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
  );
}
