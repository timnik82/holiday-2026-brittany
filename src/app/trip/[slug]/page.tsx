import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { CONTENT_STATUS_LABELS } from "@/components/content/labels";
import { NarratableContent } from "@/components/tts/NarratableContent";
import { guideConfig } from "@/config/guide";
import { loadContentPages } from "@/lib/content/registry";
import { stayFrontmatterSchema } from "@/lib/content/schemas";
import type { StayFrontmatter } from "@/lib/content/schemas";
import { StayTimeline } from "@/components/trip/StayTimeline";
import { findStay } from "@/lib/trip/stays";
import type { StayNeighbours } from "@/lib/trip/stays";
import {
  getSourceBlockLinks,
  requireEvidenceRecords,
} from "@/lib/content/evidence-links";
import { loadEvidenceRegistry } from "@/lib/content/sources-data";
import styles from "@/components/trip/trip.module.css";
import type { RegistryEntry } from "@/lib/content/registry";

/**
 * Static params come only from reviewed stay pages (status !== "draft").
 */
export async function generateStaticParams() {
  return loadContentPages()
    .filter((e) => e.category === "trip" && e.page.status !== "draft")
    .map((e) => ({ slug: e.page.slug }));
}

export const dynamicParams = false;

interface StayPageData {
  entry: RegistryEntry;
  frontmatter: StayFrontmatter;
  stay: StayNeighbours;
  baseTitles: Map<string, string>;
}

/**
 * Resolve a stay page from a single registry load, deriving the stay entry, its
 * validated frontmatter and the baseSlug → baseTitle map from one pass over
 * `loadContentPages()`. The registry cache is disabled in dev, so loading once
 * here avoids repeat full content-directory scans per request (mirroring the
 * directory-data pattern).
 */
function loadStayPageData(slug: string): StayPageData | undefined {
  const allPages = loadContentPages();

  let entry: RegistryEntry | undefined;
  const baseTitles = new Map<string, string>();
  for (const e of allPages) {
    if (e.category === "trip" && e.page.slug === slug && e.page.status !== "draft") {
      entry = e;
    } else if (e.category === "bases") {
      baseTitles.set(e.page.slug, e.page.title);
    }
  }
  if (!entry) return undefined;

  // A reviewed stay page must have valid stay frontmatter; if it doesn't, the
  // content is out of sync — surface it loudly at build time.
  const parsed = stayFrontmatterSchema.safeParse(entry.frontmatter);
  if (!parsed.success) {
    throw new Error(
      `Stay page "${slug}" has no valid stay frontmatter (stayId and carRequirement are required).`
    );
  }

  // The itinerary, not the page, owns the dates. A stayId that no longer
  // resolves means the booking changed without the content following.
  const stay = findStay(parsed.data.stayId);
  if (!stay) {
    throw new Error(
      `Stay page "${slug}" points at stayId "${parsed.data.stayId}", which is not a booked stay.`
    );
  }

  return { entry, frontmatter: parsed.data, stay, baseTitles };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = loadStayPageData(slug);
  if (!data) return {};
  return {
    title: `${data.entry.page.title} — The trip — ${guideConfig.shortTitle}`,
    description: data.entry.page.summary,
  };
}

export default async function StayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = loadStayPageData(slug);
  if (!data) notFound();
  const { entry, frontmatter, stay, baseTitles } = data;

  const evidence = loadEvidenceRegistry();
  const evidenceById = new Map(evidence.map((r) => [r.id, r]));

  // Every evidence reference on this stay's paragraphs must resolve to a
  // registered record; a typo or deleted evidence id fails loudly at build
  // time instead of silently dropping a citation.
  const paragraphEvidenceIds = Array.from(
    new Set(entry.page.paragraphs.flatMap((p) => p.evidenceRefs))
  );
  const paragraphEvidence = requireEvidenceRecords(
    evidenceById,
    paragraphEvidenceIds,
    `Stay page ${slug}`
  );
  const sourceLinks = dedupe(getSourceBlockLinks(paragraphEvidence));

  return (
    <div className={styles.page}>
      <p className={styles.backLink}>
        <Link href="/trip">← Back to the trip</Link>
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

      <StayTimeline stay={stay} frontmatter={frontmatter} baseTitles={baseTitles} />

      <section className={styles.bodySection} aria-label={`${entry.page.title} day by day`}>
        <div className={styles.prose}>
          <NarratableContent
            content={entry.page.content}
            paragraphs={entry.page.paragraphs}
          />
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
