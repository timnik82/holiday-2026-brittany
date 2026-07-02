import { guideConfig } from "@/config/guide";
import {
  DEFAULT_REVIEW_WINDOW_DAYS,
  getFreshness,
} from "@/lib/content/freshness";
import styles from "./freshness.module.css";

export interface FreshnessLabelProps {
  /** ISO date (`YYYY-MM-DD`) the fact was last verified against an official source. */
  checkedAt: string | undefined;
  /** Review window in days (default 30, per about-this-guide.md). */
  reviewWindowDays?: number;
}

// The configured locale keeps rendered dates stable across build environments.
const checkedDateFormatter = new Intl.DateTimeFormat(guideConfig.locale, {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/**
 * Renders a fact's verification state: "Checked {date}" while fresh, or
 * "Needs recheck · {date}" once it is older than its review window. The fact
 * itself never disappears — passing time only changes the label. A missing
 * `checkedAt` renders "Needs recheck" without a date.
 */
export function FreshnessLabel({
  checkedAt,
  reviewWindowDays = DEFAULT_REVIEW_WINDOW_DAYS,
}: FreshnessLabelProps) {
  const state = getFreshness(checkedAt, reviewWindowDays);

  if (!checkedAt) {
    return (
      <span className={`${styles.label} ${styles.stale}`} role="status">
        Needs recheck
      </span>
    );
  }

  const dateText = checkedDateFormatter.format(new Date(`${checkedAt}T00:00:00`));

  if (!state.fresh) {
    return (
      <span className={`${styles.label} ${styles.stale}`} role="status">
        Needs recheck · checked {dateText}
      </span>
    );
  }

  return (
    <span className={`${styles.label} ${styles.fresh}`}>
      Checked {dateText}
    </span>
  );
}
