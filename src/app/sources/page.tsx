import Link from "next/link";
import type { Metadata } from "next";
import { guideConfig } from "@/config/guide";
import { loadSourceSummaries } from "@/lib/content/sources-data";
import styles from "@/components/sources/sources.module.css";

export const metadata: Metadata = {
  title: `Sources — ${guideConfig.shortTitle}`,
  description: `Original-language research documents behind the ${guideConfig.regionName} family guide.`,
};

const LANGUAGE_NAMES: Record<string, string> = {
  ru: "Russian",
  en: "English",
  fr: "French",
};

export default function SourcesPage() {
  const summaries = loadSourceSummaries();

  return (
    <div className={styles.sourcesPage}>
      <div>
        <h1>Sources</h1>
        <p className={styles.sourcesIntro}>
          The four research documents are preserved here in their original
          language. Each substantive block links to its coverage outcome, where
          concise English evidence records provide the auditable basis for the
          guide — without offering a full translation of the original text.
        </p>
      </div>

      <nav>
        <Link href="/sources/coverage">View coverage overview →</Link>
      </nav>

      <ul className={styles.sourceList}>
        {summaries.map((s) => (
          <li key={s.slug} className={styles.sourceCard}>
            <h2 className={styles.sourceCardTitle}>
              <Link href={`/sources/${s.slug}`}>{s.slug}</Link>
            </h2>
            <div className={styles.sourceCardMeta}>
              <span>Language: {LANGUAGE_NAMES[s.language] ?? s.language}</span>
              <span>{s.substantiveBlockCount} substantive block(s)</span>
              <span className={styles.sourceCardCode}>
                sha256: {s.sha256.slice(0, 12)}…
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
