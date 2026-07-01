import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  loadSourceEntry,
  loadSourceBlocks,
  loadCoverage,
  loadSourceSlugs,
} from "@/lib/content/sources-data";
import styles from "@/components/sources/sources.module.css";

const LANGUAGE_NAMES: Record<string, string> = {
  ru: "Russian",
  en: "English",
  fr: "French",
};

export function generateStaticParams() {
  return loadSourceSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = loadSourceEntry(slug);
  if (!entry) return {};
  const lang = LANGUAGE_NAMES[entry.language] ?? entry.language;
  return {
    title: `${slug} (original ${lang}) — Sources`,
    description: `Original ${lang} research document, preserved unchanged.`,
  };
}

export default async function SourceDocumentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = loadSourceEntry(slug);
  if (!entry) notFound();

  const blocks = loadSourceBlocks(slug);
  const coverage = loadCoverage();

  return (
    <div className={styles.docPage}>
      <div>
        <h1>{slug}</h1>
        <p className={styles.docNotice}>
          This document is shown in its original {LANGUAGE_NAMES[entry.language] ?? entry.language}.
          It is preserved unchanged from the research corpus. No full English
          translation is provided — instead, concise English evidence records
          summarise the substantive claims in the coverage view.
        </p>
      </div>

      <nav>
        <Link href="/sources">← All sources</Link>
        {" · "}
        <Link href={`/sources/coverage?source=${slug}`}>Coverage for this source →</Link>
      </nav>

      <ul className={styles.docBlocks}>
        {blocks.map((block) => {
          const outcome = coverage[block.id];
          return (
            <li key={block.id} className={styles.docBlock} id={`block-${block.id}`}>
              <div className={styles.docBlockHeader}>
                <span className={styles.docBlockId}>{block.id}</span>
                {outcome ? (
                  <Link href={`/sources/coverage?source=${slug}#block-${block.id}`}>
                    coverage: {outcome.status}
                  </Link>
                ) : (
                  <span className={styles.docBlockHeading}>no coverage</span>
                )}
              </div>
              {block.headingPath.length > 0 && (
                <p className={styles.docBlockHeading}>
                  {block.headingPath.join(" › ")}
                </p>
              )}
              <div className={styles.docBlockMarkdown}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {block.markdown}
                </ReactMarkdown>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
