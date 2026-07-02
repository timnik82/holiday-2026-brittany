import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { BaseHero } from "@/components/bases/BaseHero";
import { BaseFacts } from "@/components/bases/BaseFacts";
import { RelatedPlaces } from "@/components/bases/RelatedPlaces";
import { guideConfig } from "@/config/guide";
import styles from "@/components/bases/base-detail.module.css";

import { getContentPage, getBaseFrontmatter, loadContentPages } from "@/lib/content/registry";
import {
  getSourceBlockLinks,
  requireEvidenceRecords,
} from "@/lib/content/evidence-links";
import { loadEvidenceRegistry } from "@/lib/content/sources-data";
import { loadBaseRankings } from "@/lib/ranking/data";
import { rankBases } from "@/lib/ranking/calculate";
import { RANKING_DIMENSIONS } from "@/lib/ranking/weights";
import { getRelatedPlaces } from "@/components/bases/related-places-data";

/**
 * Static params come only from reviewed base pages (status !== "draft").
 * A draft base page never gets a route until it is promoted to review or
 * published. The slug list is intersected with the ranking records so a
 * content page without a matching ranking entry can never render.
 */
export async function generateStaticParams() {
  const rankings = loadBaseRankings();
  return loadContentPages()
    .filter(
      (e) =>
        e.category === "bases" &&
        e.page.status !== "draft" &&
        rankings.bases.some((b) => b.slug === e.page.slug)
    )
    .map((e) => ({ slug: e.page.slug }));
}

export const dynamicParams = false;

function getBasePage(slug: string) {
  const entry = getContentPage(slug, "bases");
  if (!entry) return undefined;
  if (entry.page.status === "draft") return undefined;
  return entry;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getBasePage(slug);
  if (!entry) return {};
  return {
    title: `${entry.page.title} — ${guideConfig.shortTitle}`,
    description: entry.page.summary,
  };
}

export default async function BaseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = await getBasePage(slug);
  if (!entry) notFound();

  const rankings = loadBaseRankings();
  const evidence = loadEvidenceRegistry();
  const evidenceById = new Map(evidence.map((r) => [r.id, r]));

  const base = rankings.bases.find((b) => b.slug === slug);
  if (!base) {
    // A reviewed base page must correspond to a ranking record. If it does
    // not, the content and rankings are out of sync — surface it loudly.
    throw new Error(
      `Base page "${slug}" has no matching record in content/rankings/bases.json.`
    );
  }

  const ranked = rankBases(
    rankings.bases.map((b) => ({
      slug: b.slug,
      scores: Object.fromEntries(
        RANKING_DIMENSIONS.map((d) => [d, b.scores[d].score])
      ) as Record<(typeof RANKING_DIMENSIONS)[number], number | null>,
    }))
  );
  const rankIndex = ranked.findIndex((r) => r.slug === slug);
  const result = ranked[rankIndex];

  // Read the full base-specific frontmatter (region, coordinates) that the
  // generic ContentPage type does not carry. A reviewed base page must have
  // valid base frontmatter; if it doesn't, the content is out of sync.
  const frontmatter = getBaseFrontmatter(slug);
  if (!frontmatter) {
    throw new Error(
      `Base page "${slug}" has no valid base frontmatter (region is required).`
    );
  }

  // Every evidence reference on this base's paragraphs must resolve to a
  // registered record. The raw refs are passed straight to
  // requireEvidenceRecords (no pre-filtering) so a typo or deleted evidence
  // id fails loudly at build time instead of silently dropping a citation.
  const paragraphEvidenceIds = Array.from(
    new Set(entry.page.paragraphs.flatMap((p) => p.evidenceRefs))
  );
  const paragraphEvidence = requireEvidenceRecords(
    evidenceById,
    paragraphEvidenceIds,
    `Base page ${slug}`
  );
  const sourceLinks = getSourceBlockLinks(paragraphEvidence);
  const places = getRelatedPlaces(slug);

  return (
    <div className={styles.page}>
      <p className={styles.backLink}>
        <Link href="/bases">← Compare all bases</Link>
      </p>

      <BaseHero
        base={base}
        frontmatter={frontmatter}
        rankedTotal={result.total}
        confidence={result.confidence}
        rank={rankIndex + 1}
        totalBases={rankings.bases.length}
      />

      <BaseFacts base={base} evidenceById={evidenceById} />

      <section className={styles.bodySection} aria-labelledby="body-heading">
        <h2 id="body-heading" className={styles.sectionHeading}>
          What the research says
        </h2>
        <div className={styles.prose}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {entry.page.content}
          </ReactMarkdown>
        </div>
      </section>

      <RelatedPlaces places={places} idBase={`related-${slug}`} />

      {sourceLinks.length > 0 && (
        <section
          className={styles.citationsSection}
          aria-labelledby="citations-heading"
        >
          <h2 id="citations-heading" className={styles.sectionHeading}>
            Evidence and sources
          </h2>
          <ul className={styles.citationsList}>
            {dedupe(sourceLinks).map((link) => (
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
