import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { CONTENT_STATUS_LABELS } from "@/components/content/labels";
import { NarratableContent } from "@/components/tts/NarratableContent";
import { guideConfig } from "@/config/guide";
import { getContentPage, loadContentPages } from "@/lib/content/registry";
import styles from "@/components/bases/base-detail.module.css";

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
    </div>
  );
}
