import type { BaseFrontmatter } from "@/lib/content/schemas";
import type { BaseRecord } from "@/lib/ranking/schema";
import styles from "./base-detail.module.css";

const CAR_LABELS: Record<BaseRecord["carNeed"], string> = {
  optional: "Car optional",
  helpful: "Car helpful",
  recommended: "Car recommended",
  essential: "Car essential",
};

const PRICE_LABELS: Record<BaseRecord["priceBand"], string> = {
  budget: "Better value",
  moderate: "Moderate price",
  high: "High price",
};

export interface BaseHeroProps {
  base: BaseRecord;
  frontmatter: BaseFrontmatter;
  rankedTotal: number | null;
  confidence: number;
  rank: number;
  /** Total number of ranked bases, so the "Base X of Y" header stays
   *  correct if the dataset size ever changes. */
  totalBases: number;
}

export function BaseHero({
  base,
  frontmatter,
  rankedTotal,
  confidence,
  rank,
  totalBases,
}: BaseHeroProps) {
  return (
    <header className={styles.hero}>
      <p className={styles.eyebrow}>
        Base {rank} of {totalBases} · {frontmatter.region}
      </p>
      <h1>{frontmatter.title}</h1>
      <p className={styles.summary}>{base.summary}</p>
      <p className={styles.practical}>
        <span className={styles.chip}>{base.bestFor}</span>
        <span className={styles.chip}>{CAR_LABELS[base.carNeed]}</span>
        <span className={styles.chip}>{PRICE_LABELS[base.priceBand]}</span>
        {rankedTotal !== null && (
          <span className={styles.chip}>
            {rankedTotal.toFixed(2)}/10 · {Math.round(confidence * 100)}%
            confidence
          </span>
        )}
      </p>
      <p className={styles.updated}>
        Last updated{" "}
        <time dateTime={frontmatter.updatedAt}>{frontmatter.updatedAt}</time>{" "}
        · status: {frontmatter.status}
      </p>
    </header>
  );
}
