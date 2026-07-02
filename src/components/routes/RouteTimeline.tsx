import Link from "next/link";
import type { RouteFrontmatter } from "@/lib/content/schemas";
import { carRequirementLabel, paceLabel } from "./labels";
import styles from "./routes.module.css";

export interface RouteTimelineProps {
  frontmatter: RouteFrontmatter;
  /** baseSlug → baseTitle lookup, built once by the caller from the registry. */
  baseTitles: Map<string, string>;
  /**
   * Compact variant (index page): omits bestFit and renders base names as
   * plain text. The index card links the route title to the detail page;
   * base names are left non-interactive to avoid competing click targets.
   * Full variant (detail page): renders base names as links to /bases/[slug]
   * and includes the bestFit pitch.
   */
  variant?: "full" | "compact";
}

/**
 * "At a glance" summary card for a route. Renders the trip-level facts held in
 * the route frontmatter (duration, pace, bases in sequence, accommodation
 * changes, car requirement, best-fit pitch). The day-by-day itinerary itself
 * lives in the route page's markdown body.
 */
export function RouteTimeline({ frontmatter, baseTitles, variant = "full" }: RouteTimelineProps) {
  const bases = frontmatter.bases.map((slug) => ({
    slug,
    title: baseTitles.get(slug) ?? slug,
  }));

  return (
    <dl className={styles.timeline}>
      <div className={styles.timelineRow}>
        <dt>Duration</dt>
        <dd>{frontmatter.durationDays} days</dd>
      </div>
      <div className={styles.timelineRow}>
        <dt>Pace</dt>
        <dd>{paceLabel(frontmatter.pace)}</dd>
      </div>
      <div className={styles.timelineRow}>
        <dt>{bases.length > 1 ? "Bases" : "Base"}</dt>
        <dd>
          <ol className={styles.baseSequence}>
            {bases.map((base, index) => (
              <li key={base.slug} className={styles.baseSequenceItem}>
                {variant === "compact" ? (
                  <span>{base.title}</span>
                ) : (
                  <Link
                    href={`/bases/${base.slug}`}
                    className={styles.baseLink}
                  >
                    {base.title}
                  </Link>
                )}
                {index < bases.length - 1 && (
                  <span className={styles.baseArrow} aria-hidden="true">
                    {" → "}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </dd>
      </div>
      {frontmatter.bases.length > 1 && (
        <div className={styles.timelineRow}>
          <dt>Accommodation changes</dt>
          <dd>{frontmatter.accommodationChanges}</dd>
        </div>
      )}
      <div className={styles.timelineRow}>
        <dt>Car</dt>
        <dd>{carRequirementLabel(frontmatter.carRequirement)}</dd>
      </div>
      {variant === "full" && (
        <div className={styles.timelineRow}>
          <dt>Best fit</dt>
          <dd>{frontmatter.bestFit}</dd>
        </div>
      )}
    </dl>
  );
}
