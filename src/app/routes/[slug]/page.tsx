import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { CONTENT_STATUS_LABELS } from "@/components/content/labels";
import { guideConfig } from "@/config/guide";
import {
  getContentPage,
  getRouteFrontmatter,
  loadContentPages,
} from "@/lib/content/registry";
import { RouteTimeline } from "@/components/routes/RouteTimeline";
import {
  getSourceBlockLinks,
  requireEvidenceRecords,
} from "@/lib/content/evidence-links";
import { loadEvidenceRegistry } from "@/lib/content/sources-data";
import styles from "@/components/routes/routes.module.css";

/**
 * Static params come only from reviewed route pages (status !== "draft").
 */
export async function generateStaticParams() {
  return loadContentPages()
    .filter((e) => e.category === "routes" && e.page.status !== "draft")
    .map((e) => ({ slug: e.page.slug }));
}

export const dynamicParams = false;

function getVisibleRoutePage(slug: string) {
  const entry = getContentPage(slug, "routes");
  if (!entry || entry.page.status === "draft") return undefined;
  return entry;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getVisibleRoutePage(slug);
  if (!entry) return {};
  return {
    title: `${entry.page.title} — Routes — ${guideConfig.shortTitle}`,
    description: entry.page.summary,
  };
}

/**
 * Build a baseSlug → baseTitle lookup from a single registry load so the
 * timeline's base links use the canonical base titles without a per-base
 * content scan.
 */
function buildBaseTitles(): Map<string, string> {
  const titles = new Map<string, string>();
  for (const entry of loadContentPages()) {
    if (entry.category === "bases") {
      titles.set(entry.page.slug, entry.page.title);
    }
  }
  return titles;
}

export default async function RoutePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getVisibleRoutePage(slug);
  if (!entry) notFound();

  // A reviewed route page must have valid route frontmatter; if it doesn't,
  // the content is out of sync — surface it loudly at build time.
  const frontmatter = getRouteFrontmatter(slug);
  if (!frontmatter) {
    throw new Error(
      `Route page "${slug}" has no valid route frontmatter (trip-level fields are required).`
    );
  }

  const evidence = loadEvidenceRegistry();
  const evidenceById = new Map(evidence.map((r) => [r.id, r]));

  // Every evidence reference on this route's paragraphs must resolve to a
  // registered record; a typo or deleted evidence id fails loudly at build
  // time instead of silently dropping a citation.
  const paragraphEvidenceIds = Array.from(
    new Set(entry.page.paragraphs.flatMap((p) => p.evidenceRefs))
  );
  const paragraphEvidence = requireEvidenceRecords(
    evidenceById,
    paragraphEvidenceIds,
    `Route page ${slug}`
  );
  const sourceLinks = dedupe(getSourceBlockLinks(paragraphEvidence));
  const baseTitles = buildBaseTitles();

  return (
    <div className={styles.page}>
      <p className={styles.backLink}>
        <Link href="/routes">← Back to Routes</Link>
      </p>

      <header className={styles.hero}>
        <h1>{entry.page.title}</h1>
        <p className={styles.summary}>{entry.page.summary}</p>
        <p className={styles.updated}>
          Last updated{" "}
          <time dateTime={entry.page.updatedAt}>{entry.page.updatedAt}</time> ·
          status: {CONTENT_STATUS_LABELS[entry.page.status]}
        </p>
      </header>

      <RouteTimeline frontmatter={frontmatter} baseTitles={baseTitles} />

      <section className={styles.bodySection} aria-label={`${entry.page.title} itinerary`}>
        <div className={styles.prose}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {entry.page.content}
          </ReactMarkdown>
        </div>
      </section>

      {sourceLinks.length > 0 && (
        <section className={styles.citationsSection} aria-labelledby="citations-heading">
          <h2 id="citations-heading" className={styles.sectionHeading}>
            Evidence and sources
          </h2>
          <ul className={styles.citationsList}>
            {sourceLinks.map((link) => (
              <li key={link.ref}>
                <Link
                  href={link.href}
                  aria-label={`Source ${link.sourceSlug}, block ${link.ref}`}
                >
                  {link.ref}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function dedupe(
  links: { ref: string; sourceSlug: string; href: string }[]
) {
  const seen = new Set<string>();
  const out: { ref: string; sourceSlug: string; href: string }[] = [];
  for (const link of links) {
    if (seen.has(link.ref)) continue;
    seen.add(link.ref);
    out.push(link);
  }
  return out;
}
