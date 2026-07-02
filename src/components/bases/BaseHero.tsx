import { guideConfig } from "@/config/guide";
import type { BaseFrontmatter } from "@/lib/content/schemas";
import type { BaseRecord } from "@/lib/ranking/schema";
import { CAR_NEED_LABELS, PRICE_BAND_LABELS } from "./labels";
import styles from "./base-detail.module.css";

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
        <span className={styles.chip}>Car {CAR_NEED_LABELS[base.carNeed].toLowerCase()}</span>
        <span className={styles.chip}>{PRICE_BAND_LABELS[base.priceBand]}</span>
        {rankedTotal !== null && (
          <span className={styles.chip}>
            {rankedTotal.toFixed(2)}/10 · {Math.round(confidence * 100)}%
            confidence
          </span>
        )}
      </p>
      <p className={styles.updated}>
        Last updated{" "}
        <time dateTime={frontmatter.updatedAt}>
          {formatUpdatedDate(frontmatter.updatedAt)}
        </time>{" "}
        · status: {frontmatter.status}
      </p>
    </header>
  );
}

// The configured locale keeps rendered dates stable across build environments
// rather than depending on the build server's locale.
const updatedDateFormatter = new Intl.DateTimeFormat(guideConfig.locale, {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function formatUpdatedDate(iso: string): string {
  // updatedAt is validated as YYYY-MM-DD by the frontmatter schema.
  const date = new Date(`${iso}T00:00:00`);
  return updatedDateFormatter.format(date);
}
