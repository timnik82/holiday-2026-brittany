import Link from "next/link";
import type { StayFrontmatter } from "@/lib/content/schemas";
import type { StayNeighbours } from "@/lib/trip/stays";
import { formatDateRange } from "@/lib/trip/format";
import { carRequirementLabel } from "./labels";
import styles from "./trip.module.css";

export interface StayTimelineProps {
  stay: StayNeighbours;
  /** Absent while a stay is booked but not yet written up. */
  frontmatter?: StayFrontmatter;
  /** baseSlug → baseTitle lookup, built once by the caller from the registry. */
  baseTitles: Map<string, string>;
  /**
   * Compact variant (index page): dates, nights and base only, with no links.
   * The index card already links its title to the detail page, so extra click
   * targets would only compete with it.
   */
  variant?: "full" | "compact";
}

/**
 * "At a glance" card for one booked stay.
 *
 * Everything factual — dates, nights, base, what comes before and after — is
 * read from `guideConfig.trip` rather than from the page's frontmatter, so a
 * changed booking updates every stay page at once and cannot leave a stale
 * date behind in prose. Only the car judgement is editorial.
 */
export function StayTimeline({
  stay,
  frontmatter,
  baseTitles,
  variant = "full",
}: StayTimelineProps) {
  const { stay: booked, nights, previous, next } = stay;
  const baseTitle = booked.baseSlug ? baseTitles.get(booked.baseSlug) : undefined;

  return (
    <dl className={styles.timeline}>
      <div className={styles.timelineRow}>
        <dt>Dates</dt>
        <dd>
          <time dateTime={booked.checkIn}>
            {formatDateRange(booked.checkIn, booked.checkOut)}
          </time>
        </dd>
      </div>
      <div className={styles.timelineRow}>
        <dt>Nights</dt>
        <dd>{nights}</dd>
      </div>
      {booked.baseSlug && baseTitle && (
        <div className={styles.timelineRow}>
          <dt>Base</dt>
          <dd>
            {variant === "compact" ? (
              <span>{baseTitle}</span>
            ) : (
              <Link href={`/bases/${booked.baseSlug}`} className={styles.baseLink}>
                {baseTitle}
              </Link>
            )}
          </dd>
        </div>
      )}
      {variant === "full" && (
        <>
          {frontmatter && (
            <div className={styles.timelineRow}>
              <dt>Car</dt>
              <dd>{carRequirementLabel(frontmatter.carRequirement)}</dd>
            </div>
          )}
          <div className={styles.timelineRow}>
            <dt>Arrive from</dt>
            <dd>{previous ? previous.place : "home — this is the first stay"}</dd>
          </div>
          <div className={styles.timelineRow}>
            <dt>Move on to</dt>
            <dd>{next ? next.place : "the flight home"}</dd>
          </div>
        </>
      )}
    </dl>
  );
}
