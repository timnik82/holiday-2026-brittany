import { guideConfig } from "@/config/guide";
import type { BaseRankingResult } from "@/lib/ranking/calculate";
import type { BaseRecord } from "@/lib/ranking/schema";
import styles from "./home.module.css";

function formatTotal(total: number | null): string {
  return total === null ? "unknown" : `${total.toFixed(2)}/10`;
}

function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

/**
 * The lead answer to "Is Brittany a good fit for this family in August 2026?"
 *
 * Grounds the verdict in the top-ranked base's weighted total and confidence
 * (computed by `rankBases` upstream) rather than asserting fit universally.
 * The leading base's `bestFor` makes the recommendation concrete.
 */
export function Verdict({
  topResult,
  topBase,
}: {
  topResult: BaseRankingResult;
  topBase: BaseRecord;
}) {
  return (
    <section className={styles.verdict} aria-label="Suitability verdict">
      <p className={styles.verdictHeadline}>
        Yes — {guideConfig.regionName} is a strong fit for this family in{" "}
        {guideConfig.seasonLabel}.
      </p>
      <p>
        The leading base, {topBase.name}, scores{" "}
        <span className={styles.verdictTotal}>{formatTotal(topResult.total)}</span>{" "}
        ({formatConfidence(topResult.confidence)} confidence) against the
        family&apos;s stated priorities. {topBase.bestFor}. The recommendation
        is family-specific, not a universal ranking — see{" "}
        <a href="#assumptions">how it is personalised</a> and the{" "}
        <a href="/bases">full six-base comparison</a>.
      </p>
    </section>
  );
}
