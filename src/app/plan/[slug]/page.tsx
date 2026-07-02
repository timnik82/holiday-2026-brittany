import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { CONTENT_STATUS_LABELS } from "@/components/content/labels";
import { FreshnessLabel } from "@/components/content/FreshnessLabel";
import { guideConfig } from "@/config/guide";
import { loadContentPages, getContentPage } from "@/lib/content/registry";
import type { PracticalFrontmatter } from "@/lib/content/schemas";
import { loadFacts, type Fact } from "@/lib/content/facts";
import {
  getSourceBlockLinks,
  requireEvidenceRecords,
} from "@/lib/content/evidence-links";
import { loadEvidenceRegistry } from "@/lib/content/sources-data";
import styles from "@/components/plan/plan.module.css";

/**
 * Static params come only from reviewed plan guides (status !== "draft"). The
 * about-this-guide page stays in draft and is excluded.
 */
export async function generateStaticParams() {
  return loadContentPages()
    .filter((e) => e.category === "plan" && e.page.status !== "draft")
    .map((e) => ({ slug: e.page.slug }));
}

export const dynamicParams = false;

function getVisiblePlanPage(slug: string) {
  const entry = getContentPage(slug, "plan");
  if (!entry || entry.page.status === "draft") return undefined;
  return entry;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getVisiblePlanPage(slug);
  if (!entry) return {};
  return {
    title: `${entry.page.title} — Plan your trip — ${guideConfig.shortTitle}`,
    description: entry.page.summary,
  };
}

/**
 * Map a plan guide's `section` frontmatter to the facts file category whose
 * time-sensitive facts belong on that page. Returns undefined when the guide
 * has no associated facts block.
 */
const SECTION_TO_FACTS: Record<string, string | undefined> = {
  "getting-there": "transport",
  "getting-around": "transport",
  "accommodation-budget": "accommodation",
};

export default async function PlanGuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getVisiblePlanPage(slug);
  if (!entry) notFound();

  const section = (entry.frontmatter as PracticalFrontmatter).section;
  const factsCategory = SECTION_TO_FACTS[section];
  const facts: Fact[] = factsCategory
    ? loadFacts().find((f) => f.category === factsCategory)?.facts ?? []
    : [];

  const evidence = loadEvidenceRegistry();
  const evidenceById = new Map(evidence.map((r) => [r.id, r]));

  // Every evidence reference on this guide's paragraphs must resolve to a
  // registered record; a typo or deleted evidence id fails loudly at build
  // time instead of silently dropping a citation.
  const paragraphEvidenceIds = Array.from(
    new Set(entry.page.paragraphs.flatMap((p) => p.evidenceRefs))
  );
  const paragraphEvidence = requireEvidenceRecords(
    evidenceById,
    paragraphEvidenceIds,
    `Plan guide ${slug}`
  );
  const sourceLinks = dedupe(getSourceBlockLinks(paragraphEvidence));

  return (
    <div className={styles.page}>
      <p className={styles.backLink}>
        <Link href="/plan">← Back to Plan your trip</Link>
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

      {facts.length > 0 && (
        <section className={styles.factsSection} aria-labelledby="facts-heading">
          <h2 id="facts-heading" className={styles.sectionHeading}>
            Time-sensitive facts
          </h2>
          <ul className={styles.factsList}>
            {facts.map((fact) => (
              <li key={fact.id} className={styles.factItem}>
                <span className={styles.factLabel}>{fact.label}</span>
                <span className={styles.factValue}>{fact.value}</span>
                <span className={styles.factFreshness}>
                  <FreshnessLabel
                    checkedAt={fact.checkedAt}
                    reviewWindowDays={fact.reviewWindowDays}
                  />
                </span>
                {fact.notes && (
                  <span className={styles.factNotes}>{fact.notes}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className={styles.bodySection} aria-label={`${entry.page.title} guide content`}>
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
