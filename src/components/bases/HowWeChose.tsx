import Link from "next/link";
import { guideConfig } from "@/config/guide";
import { rankBases } from "@/lib/ranking/calculate";
import { RANKING_DIMENSIONS } from "@/lib/ranking/weights";
import type { BaseRecord } from "@/lib/ranking/schema";
import styles from "./how-we-chose.module.css";

function formatTotal(total: number | null): string {
  return total === null ? "unknown" : `${total.toFixed(2)}/10`;
}

/**
 * The verdict and the three leading bases — the answer this guide was
 * originally built to produce.
 *
 * The trip is now booked, so this is no longer the front page: it is the record
 * of how the destination was chosen, kept because the reasoning still explains
 * what each base is good for. The live comparison table follows below it.
 */
export function HowWeChose({ bases }: { bases: BaseRecord[] }) {
  const ranked = rankBases(
    bases.map((base) => ({
      slug: base.slug,
      scores: Object.fromEntries(
        RANKING_DIMENSIONS.map((dimension) => [dimension, base.scores[dimension].score])
      ) as Record<(typeof RANKING_DIMENSIONS)[number], number | null>,
    }))
  );
  const baseBySlug = new Map(bases.map((base) => [base.slug, base]));
  const top = ranked.slice(0, 3);
  const leader = baseBySlug.get(ranked[0].slug);

  return (
    <section aria-labelledby="how-we-chose-heading">
      <h2 id="how-we-chose-heading" className={styles.sectionHeading}>
        How the destination was chosen
      </h2>

      {leader && (
        <div className={styles.verdict}>
          <p className={styles.verdictHeadline}>
            {guideConfig.regionName} was judged a strong fit for this family in{" "}
            {guideConfig.seasonLabel}.
          </p>
          <p>
            The leading base, {leader.name}, scored{" "}
            <span className={styles.verdictTotal}>{formatTotal(ranked[0].total)}</span>{" "}
            ({Math.round(ranked[0].confidence * 100)}% confidence) against the family&apos;s
            stated priorities. {leader.bestFor}. The trip that was booked stays on{" "}
            <Link href="/">the trip page</Link>; three of these six bases are on it.
          </p>
        </div>
      )}

      <ol className={styles.topList}>
        {top.map((result, index) => {
          const base = baseBySlug.get(result.slug);
          if (!base) return null;
          return (
            <li key={base.slug} className={styles.topCard}>
              <div className={styles.topCardHead}>
                <span className={styles.topRank}>#{index + 1}</span>
                <h3>
                  <Link href={`/bases/${base.slug}`}>{base.name}</Link>
                </h3>
              </div>
              <p className={styles.topTotal}>
                {formatTotal(result.total)} · {Math.round(result.confidence * 100)}% confidence
              </p>
              <p className={styles.topBestFor}>
                <strong>Best for:</strong> {base.bestFor}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
