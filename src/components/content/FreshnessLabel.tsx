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

// The configured locale keeps rendered dates stable across build environments;
// timeZone: "UTC" makes `YYYY-MM-DD` dates render identically on server and
// client (avoiding Next.js hydration mismatches regardless of server TZ).
const checkedDateFormatter = new Intl.DateTimeFormat(guideConfig.locale, {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * Renders a fact's verification state: "Checked {date}" while fresh, or
 * "Needs recheck · {date}" once it is older than its review window. The fact
 * itself never disappears — passing time only changes the label. A missing or
 * unparseable `checkedAt` renders "Needs recheck" without a date.
 */
export function FreshnessLabel({
  checkedAt,
  reviewWindowDays = DEFAULT_REVIEW_WINDOW_DAYS,
}: FreshnessLabelProps) {
  const state = getFreshness(checkedAt, reviewWindowDays);

  // A missing or unparseable checkedAt has no date to show.
  if (Number.isNaN(state.ageDays)) {
    return (
      <span className={`${styles.label} ${styles.stale}`}>
        Needs recheck
      </span>
    );
  }

  // Parse the YYYY-MM-DD string as UTC to format consistently.
  const dateText = checkedDateFormatter.format(new Date(`${checkedAt}T00:00:00Z`));

  if (!state.fresh) {
    return (
      <span className={`${styles.label} ${styles.stale}`}>
        Needs recheck · <time dateTime={checkedAt}>{dateText}</time>
      </span>
    );
  }

  return (
    <span className={`${styles.label} ${styles.fresh}`}>
      Checked <time dateTime={checkedAt}>{dateText}</time>
    </span>
  );
}
