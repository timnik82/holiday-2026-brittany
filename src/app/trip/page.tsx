import Link from "next/link";
import type { Metadata } from "next";
import { guideConfig } from "@/config/guide";
import { getStayPages, loadContentPages } from "@/lib/content/registry";
import type { StayPage } from "@/lib/content/registry";
import { StayTimeline } from "@/components/trip/StayTimeline";
import { carRequirementLabel } from "@/components/trip/labels";
import styles from "@/components/trip/trip.module.css";
import { listStayNeighbours } from "@/lib/trip/stays";
import type { StayNeighbours } from "@/lib/trip/stays";
import { formatDateRange } from "@/lib/trip/format";

export function generateMetadata(): Metadata {
  return {
    title: `The trip — ${guideConfig.shortTitle}`,
    description: `The booked ${guideConfig.regionName} itinerary for ${guideConfig.seasonLabel}, stay by stay.`,
  };
}

interface StayCard {
  stay: StayNeighbours;
  /** The written-up page for this stay, or null while it is still to come. */
  page: StayPage | null;
}

interface TripIndexData {
  cards: StayCard[];
  baseTitles: Map<string, string>;
}

/**
 * Build one card per *booked* stay, not one per content file.
 *
 * The itinerary is the source of truth: every stay appears in travel order
 * whether or not it has been written up yet, so a stay awaiting its research
 * reads as work outstanding rather than as a gap in the trip. Which stays have
 * pages is decided by `getStayPages`, the single definition shared with the
 * home page, and it is handed the registry load made here — the registry cache
 * is disabled in dev, so one scan avoids repeat disk reads per request.
 */
function loadTripIndex(): TripIndexData {
  const allPages = loadContentPages();
  const baseTitles = new Map<string, string>();
  for (const entry of allPages) {
    if (entry.category === "bases") baseTitles.set(entry.page.slug, entry.page.title);
  }
  const pageByStayId = getStayPages(allPages);

  const cards: StayCard[] = listStayNeighbours().map((stay) => ({
    stay,
    page: pageByStayId.get(stay.stay.id) ?? null,
  }));

  return { cards, baseTitles };
}

export default function TripPage() {
  const { cards, baseTitles } = loadTripIndex();
  const { start, end } = guideConfig.trip;

  return (
    <div className={styles.indexPage}>
      <header className={styles.indexHero}>
        <p className={styles.eyebrow}>Booked · {guideConfig.seasonLabel}</p>
        <h1>The trip, stay by stay</h1>
        <p>
          {formatDateRange(start, end)} in {guideConfig.regionName}, in travel order.
          Open a stay for its day-by-day plan, its weather alternatives, and the
          place and base pages behind it.
        </p>
      </header>

      <ol className={styles.stayList}>
        {cards.map(({ stay, page }) => (
          <li key={stay.stay.id}>
            <article className={styles.stayCard}>
              <h2 className={styles.stayCardTitle}>
                {page ? (
                  <Link href={`/trip/${page.slug}`}>{page.title}</Link>
                ) : (
                  stay.stay.place
                )}
              </h2>
              <p className={styles.stayCardSummary}>
                {page
                  ? page.summary
                  : (stay.stay.note ?? "This stay is booked; its guide is still to come.")}
              </p>
              {page && (
                <p className={styles.stayCardChips}>
                  <span className={styles.chip}>
                    {carRequirementLabel(page.frontmatter.carRequirement)}
                  </span>
                </p>
              )}
              <StayTimeline
                stay={stay}
                frontmatter={page?.frontmatter}
                baseTitles={baseTitles}
                variant="compact"
              />
            </article>
          </li>
        ))}
      </ol>
    </div>
  );
}
