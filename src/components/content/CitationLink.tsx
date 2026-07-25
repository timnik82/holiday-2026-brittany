import Link from "next/link";
import { getSourceBlockLinks } from "@/lib/content/evidence-links";
import { loadEvidenceRegistry } from "@/lib/content/sources-data";

interface CitationLinkProps {
  /** Evidence id (`evidence:…`) or a raw source-block id (`slug:bNNN`). */
  refKey: string;
}

/**
 * Invitation from a published claim to its original research block.
 * Prefers the first source-block href; falls back to the coverage row when the
 * evidence registry has no block refs (or the key is unknown).
 */
export function CitationLink({ refKey }: CitationLinkProps) {
  const { href, label, title } = resolveCitation(refKey);

  return (
    <Link href={href} className="citation-link" title={title}>
      {label}
    </Link>
  );
}

function resolveCitation(refKey: string): {
  href: string;
  label: string;
  title: string;
} {
  const coverageFallback = {
    href: `/sources/coverage#${refKey}`,
    label: "View in coverage →",
    title: `Coverage for ${refKey}`,
  };

  if (refKey.includes(":") && !refKey.startsWith("evidence:")) {
    const sourceSlug = refKey.slice(0, refKey.indexOf(":"));
    return {
      href: `/sources/${sourceSlug}#block-${refKey}`,
      label: "Read original research →",
      title: `Research block ${refKey}`,
    };
  }

  const evidence = loadEvidenceRegistry().find((record) => record.id === refKey);
  if (!evidence) return coverageFallback;

  const [first] = getSourceBlockLinks([evidence]);
  if (!first) return coverageFallback;

  return {
    href: first.href,
    label: "Read original research →",
    title: `Research block ${first.ref}`,
  };
}
