import Link from "next/link";
import type { BaseRankingResult } from "@/lib/ranking/calculate";
import type { BaseRecord } from "@/lib/ranking/schema";
import styles from "./home.module.css";

export interface TopBaseRow {
  result: BaseRankingResult;
  base: BaseRecord;
  rank: number;
}

function formatTotal(total: number | null): string {
  return total === null ? "Unknown" : `${total.toFixed(2)}/10`;
}

/**
 * The three leading bases with their weighted total and a one-line rationale.
 * Each card links to the base's detail page (the two-click path from verdict
 * to a complete base page), and a trailing link opens the full comparison.
 */
export function TopBases({ rows }: { rows: TopBaseRow[] }) {
  return (
    <section aria-labelledby="top-bases-heading">
      <h2 id="top-bases-heading" className={styles.sectionHeading}>
        The three bases that fit best
      </h2>
      <ol className={styles.baseList}>
        {rows.map(({ base, rank, result }) => (
          <li key={base.slug} className={styles.baseCard}>
            <div className={styles.baseCardHead}>
              <span className={styles.rank}>#{rank}</span>
              <h3>
                <Link href={`/bases/${base.slug}`}>{base.name}</Link>
              </h3>
            </div>
            <p className={styles.baseCardTotal}>
              {formatTotal(result.total)} · {Math.round(result.confidence * 100)}%
              confidence
            </p>
            <p className={styles.bestFor}>
              <strong>Best for:</strong> {base.bestFor}
            </p>
            <p>{base.summary}</p>
          </li>
        ))}
      </ol>
      <p>
        <Link className={styles.seeAll} href="/bases">
          See all six bases compared →
        </Link>
      </p>
    </section>
  );
}
