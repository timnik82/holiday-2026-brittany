import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { CitationLink } from "@/components/content/CitationLink";
import { CONTENT_STATUS_LABELS } from "@/components/content/labels";
import { NarratableContent } from "@/components/tts/NarratableContent";
import styles from "@/components/bases/base-detail.module.css";
import { guideConfig } from "@/config/guide";
import {
  getSourceBlockLinks,
  requireEvidenceRecords,
} from "@/lib/content/evidence-links";
import { getContentPage, loadContentPages } from "@/lib/content/registry";
import { loadEvidenceRegistry } from "@/lib/content/sources-data";

/**
 * Static params come only from reviewed things-to-do pages (status !== "draft").
 * The filterable Things to do directory lives at `/things-to-do`; this route
 * renders each individual canonical activity page.
 */
export async function generateStaticParams() {
  return loadContentPages()
    .filter(
      (e) => e.category === "things-to-do" && e.page.status !== "draft"
    )
    .map((e) => ({ slug: e.page.slug }));
}

export const dynamicParams = false;

function getVisibleThingToDoPage(slug: string) {
  const entry = getContentPage(slug, "things-to-do");
  if (!entry || entry.page.status === "draft") return undefined;
  return entry;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getVisibleThingToDoPage(slug);
  if (!entry) return {};
  return {
    title: `${entry.page.title} — Things to do — ${guideConfig.shortTitle}`,
    description: entry.page.summary,
  };
}

export default async function ThingToDoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getVisibleThingToDoPage(slug);
  if (!entry) notFound();

  const evidence = loadEvidenceRegistry();
  const evidenceById = new Map(evidence.map((r) => [r.id, r]));
  const paragraphEvidenceIds = Array.from(
    new Set(entry.page.paragraphs.flatMap((p) => p.evidenceRefs))
  );
  const paragraphEvidence = requireEvidenceRecords(
    evidenceById,
    paragraphEvidenceIds,
    `Things-to-do page ${slug}`
  );
  const sourceLinks = dedupe(getSourceBlockLinks(paragraphEvidence));

  return (
    <div className={styles.page}>
      <p className={styles.backLink}>
        <Link href="/things-to-do">← Back to Things to do</Link>
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

      <section
        className={styles.bodySection}
        aria-label={`${entry.page.title} guide content`}
      >
        <div className={styles.prose}>
          <NarratableContent
            content={entry.page.content}
            paragraphs={entry.page.paragraphs}
          />
        </div>
      </section>

      {sourceLinks.length > 0 && (
        <section
          className={styles.citationsSection}
          aria-labelledby="citations-heading"
        >
          <h2 id="citations-heading" className={styles.sectionHeading}>
            Evidence and sources
          </h2>
          <ul className={styles.citationsList}>
            {sourceLinks.map((link) => (
              <li key={link.ref}>
                <CitationLink refKey={link.ref} />
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
