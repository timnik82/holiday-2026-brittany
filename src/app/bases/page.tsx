import type { Metadata } from "next";
import Link from "next/link";
import { BaseComparison } from "@/components/bases/BaseComparison";
import styles from "@/components/bases/bases.module.css";
import {
  getSourceBlockLinks,
  requireEvidenceRecords,
} from "@/lib/content/evidence-links";
import { loadEvidenceRegistry } from "@/lib/content/sources-data";
import { loadBaseRankings } from "@/lib/ranking/data";
import {
  FAMILY_WEIGHTS,
  RANKING_DIMENSIONS,
  RANKING_DIMENSION_LABELS,
} from "@/lib/ranking/weights";

export const metadata: Metadata = {
  title: "Compare Brittany bases — Brittany Family Guide",
  description: "An evidence-backed comparison of six Brittany bases for this family's August 2026 priorities.",
};

const SOURCE_RANKING_IDS = [
  "evidence:ranking-source-chatgpt-overall",
  "evidence:ranking-source-perplexity-overall",
  "evidence:ranking-source-operaai-overall",
];

export default function BasesPage() {
  const rankings = loadBaseRankings();
  const evidence = loadEvidenceRegistry();
  const evidenceById = new Map(evidence.map((record) => [record.id, record]));
  const sourceRankings = requireEvidenceRecords(
    evidenceById,
    SOURCE_RANKING_IDS,
    "Source ranking comparison"
  );

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Decision guide · August 2026</p>
        <h1>Compare six Brittany bases</h1>
        <p>
          This is a family-specific comparison, not a universal destination ranking.
          Each score uses the same 1–10 scale and links back to the supplied research.
        </p>
      </header>

      <section className={styles.methodNote} aria-labelledby="weight-heading">
        <h2 id="weight-heading">How the total is calculated</h2>
        <p>
          A missing dimension produces an unknown total instead of a guessed score.
          With all seven dimensions reviewed, the current comparison has 100% confidence.
        </p>
        <ul className={styles.weightList}>
          {RANKING_DIMENSIONS.map((dimension) => (
            <li key={dimension}>
              {RANKING_DIMENSION_LABELS[dimension]} {FAMILY_WEIGHTS[dimension] * 100}%
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.sourceDisagreement} aria-labelledby="disagreement-heading">
        <h2 id="disagreement-heading">The original rankings disagree</h2>
        <p>
          That disagreement is preserved rather than averaged away. This page derives its
          order from the visible weighted dimensions below.
        </p>
        <ul>
          {sourceRankings.map((record) => {
            const sourceLinks = getSourceBlockLinks([record]);
            return (
              <li key={record.id}>
                {record.text}{" "}
                <span className={styles.sourceLinks}>
                  Sources:{" "}
                  {sourceLinks.map((link, index) => (
                    <span key={`${link.ref}-${index}`}>
                      {index > 0 && ", "}
                      <Link href={link.href}>{link.ref}</Link>
                    </span>
                  ))}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <BaseComparison bases={rankings.bases} evidence={evidence} />
    </div>
  );
}
