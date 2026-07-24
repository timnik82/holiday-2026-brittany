import type { Metadata } from "next";
import Link from "next/link";
import { BaseComparison } from "@/components/bases/BaseComparison";
import { HowWeChose } from "@/components/bases/HowWeChose";
import { guideConfig } from "@/config/guide";
import styles from "@/components/bases/bases.module.css";
import {
  getSourceBlockLinks,
  requireEvidenceRecords,
} from "@/lib/content/evidence-links";
import { loadEvidenceRegistry } from "@/lib/content/sources-data";
import { loadBaseRankings } from "@/lib/ranking/data";
import { basesOnTrip } from "@/lib/trip/stays";
import {
  FAMILY_WEIGHTS,
  RANKING_DIMENSIONS,
  RANKING_DIMENSION_LABELS,
} from "@/lib/ranking/weights";

export function generateMetadata(): Metadata {
  const baseCount = loadBaseRankings().bases.length;

  return {
    title: `Compare ${guideConfig.regionName} bases — ${guideConfig.shortTitle}`,
    description: `An evidence-backed comparison of ${baseCount} ${guideConfig.regionName} bases for this family's ${guideConfig.seasonLabel} priorities.`,
  };
}

const SOURCE_RANKING_IDS = [
  "evidence:ranking-source-chatgpt-overall",
  "evidence:ranking-source-perplexity-overall",
  "evidence:ranking-source-operaai-overall",
];

export default function BasesPage() {
  const rankings = loadBaseRankings();
  const baseCount = rankings.bases.length;
  const bookedSlugs = new Set(rankings.bases.map((base) => base.slug));
  const bookedCount = basesOnTrip().filter((slug) => bookedSlugs.has(slug)).length;
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
        <p className={styles.eyebrow}>
          How we chose · {guideConfig.seasonLabel}
        </p>
        <h1>
          Compare {baseCount} {guideConfig.regionName} bases
        </h1>
        <p>
          The trip is booked, so this page is the record of the decision rather than
          the decision itself. It stays useful: the scores explain what each base is
          good at, and {bookedCount} of these {baseCount} are on the route. Each score
          uses the same 1–10 scale and links back to the supplied research.
        </p>
      </header>

      <HowWeChose bases={rankings.bases} />

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
