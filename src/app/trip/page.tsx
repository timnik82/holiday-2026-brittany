import Link from "next/link";
import type { Metadata } from "next";
import { guideConfig } from "@/config/guide";
import { loadContentPages } from "@/lib/content/registry";
import { StayTimeline } from "@/components/trip/StayTimeline";
import { carRequirementLabel } from "@/components/trip/labels";
import styles from "@/components/trip/trip.module.css";
import { findStay, listStays } from "@/lib/trip/stays";
import type { StayNeighbours } from "@/lib/trip/stays";
import { formatDateRange } from "@/lib/trip/format";
import { stayFrontmatterSchema } from "@/lib/content/schemas";
import type { StayFrontmatter } from "@/lib/content/schemas";

export function generateMetadata(): Metadata {
  return {
    title: `The trip — ${guideConfig.shortTitle}`,
    description: `The booked ${guideConfig.regionName} itinerary for ${guideConfig.seasonLabel}, stay by stay.`,
  };
}

interface StayPageSummary {
  slug: string;
  title: string;
  summary: string;
  frontmatter: StayFrontmatter;
}

interface StayCard {
  stay: StayNeighbours;
  /** The written-up page for this stay, or null while it is still to come. */
  page: StayPageSummary | null;
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
 * reads as work outstanding rather than as a gap in the trip. Pages are matched
 * by `stayId` from a single registry load, mirroring the directory-data
 * pattern — the registry cache is disabled in dev, so one scan here avoids
 * repeat disk reads per request.
 */
function loadTripIndex(): TripIndexData {
  const allPages = loadContentPages();
  const baseTitles = new Map<string, string>();
  const pageByStayId = new Map<string, StayPageSummary>();

  for (const entry of allPages) {
    if (entry.category === "bases") {
      baseTitles.set(entry.page.slug, entry.page.title);
      continue;
    }
    if (entry.category !== "trip" || entry.page.status === "draft") continue;
    const parsed = stayFrontmatterSchema.safeParse(entry.frontmatter);
    if (!parsed.success) continue;
    pageByStayId.set(parsed.data.stayId, {
      slug: entry.page.slug,
      title: entry.page.title,
      summary: entry.page.summary,
      frontmatter: parsed.data,
    });
  }

  const cards: StayCard[] = [];
  for (const { stay } of listStays()) {
    const resolved = findStay(stay.id);
    if (!resolved) continue;
    cards.push({ stay: resolved, page: pageByStayId.get(stay.id) ?? null });
  }

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
          Each stay carries its own day-by-day plan, its weather alternatives, and
          links to the place and base pages behind it.
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
