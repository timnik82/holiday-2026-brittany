import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { guideConfig } from "@/config/guide";
import { getContentPage, loadContentPages } from "@/lib/content/registry";
import styles from "@/components/bases/base-detail.module.css";

/**
 * Static params come only from reviewed things-to-do pages (status !== "draft").
 * The full filterable Things to do directory lands in PR 9; this route exists
 * now so that base pages' "Linked places" links resolve to real pages instead
 * of 404s.
 */
export async function generateStaticParams() {
  return loadContentPages()
    .filter(
      (e) => e.category === "things-to-do" && e.page.status !== "draft"
    )
    .map((e) => ({ slug: e.page.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getContentPage(slug, "things-to-do");
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
  const entry = getContentPage(slug, "things-to-do");
  if (!entry || entry.page.status === "draft") notFound();

  return (
    <div className={styles.page}>
      <p className={styles.backLink}>
        <Link href="/bases">← Back to bases</Link>
      </p>

      <header className={styles.hero}>
        <h1>{entry.page.title}</h1>
        <p className={styles.summary}>{entry.page.summary}</p>
        <p className={styles.updated}>
          Last updated{" "}
          <time dateTime={entry.page.updatedAt}>{entry.page.updatedAt}</time> ·
          status: {entry.page.status}
        </p>
      </header>

      <section className={styles.bodySection}>
        <div className={styles.prose}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {entry.page.content}
          </ReactMarkdown>
        </div>
      </section>
    </div>
  );
}
