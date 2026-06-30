import React from "react";

interface CitationLinkProps {
  /** The evidence reference key */
  refKey: string;
}

/**
 * Renders an evidence reference as a link to the sources coverage page.
 */
export function CitationLink({ refKey }: CitationLinkProps) {
  return (
    <a
      href={`/sources/coverage#${refKey}`}
      className="citation-link"
      title={`Source: ${refKey}`}
    >
      [{refKey}]
    </a>
  );
}
