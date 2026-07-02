import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { CONTENT_STATUS_LABELS } from "@/components/content/labels";
import { guideConfig } from "@/config/guide";
import { loadContentPages } from "@/lib/content/registry";
import { routeFrontmatterSchema } from "@/lib/content/schemas";
import type { RouteFrontmatter } from "@/lib/content/schemas";
import { RouteTimeline } from "@/components/routes/RouteTimeline";
import {
  getSourceBlockLinks,
  requireEvidenceRecords,
} from "@/lib/content/evidence-links";
import { loadEvidenceRegistry } from "@/lib/content/sources-data";
import styles from "@/components/routes/routes.module.css";
import type { RegistryEntry } from "@/lib/content/registry";

/**
 * Static params come only from reviewed route pages (status !== "draft").
 */
export async function generateStaticParams() {
  return loadContentPages()
    .filter((e) => e.category === "routes" && e.page.status !== "draft")
    .map((e) => ({ slug: e.page.slug }));
}

export const dynamicParams = false;

interface RoutePageData {
  entry: RegistryEntry;
  frontmatter: RouteFrontmatter;
  baseTitles: Map<string, string>;
}

/**
 * Resolve a route page from a single registry load, deriving the route entry,
 * its validated route frontmatter, and the baseSlug → baseTitle map from one
 * pass over `loadContentPages()`. The registry cache is disabled in dev, so
 * loading once here avoids three separate full content-directory scans per
 * request (mirroring the directory-data pattern).
 */
function loadRoutePageData(slug: string): RoutePageData | undefined {
  const allPages = loadContentPages();

  let entry: RegistryEntry | undefined;
  const baseTitles = new Map<string, string>();
  for (const e of allPages) {
    if (e.category === "routes" && e.page.slug === slug && e.page.status !== "draft") {
      entry = e;
    } else if (e.category === "bases") {
      baseTitles.set(e.page.slug, e.page.title);
    }
  }
  if (!entry) return undefined;

  // A reviewed route page must have valid route frontmatter; if it doesn't,
  // the content is out of sync — surface it loudly at build time.
  const parsed = routeFrontmatterSchema.safeParse(entry.frontmatter);
  if (!parsed.success) {
    throw new Error(
      `Route page "${slug}" has no valid route frontmatter (trip-level fields are required).`
    );
  }

  return { entry, frontmatter: parsed.data, baseTitles };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = loadRoutePageData(slug);
  if (!data) return {};
  return {
    title: `${data.entry.page.title} — Routes — ${guideConfig.shortTitle}`,
    description: data.entry.page.summary,
  };
}

export default async function RoutePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = loadRoutePageData(slug);
  if (!data) notFound();
  const { entry, frontmatter, baseTitles } = data;

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
