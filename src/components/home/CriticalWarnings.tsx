import Link from "next/link";
import { guideConfig } from "@/config/guide";
import { loadFacts } from "@/lib/content/facts";
import { getFreshness } from "@/lib/content/freshness";
import type { BaseRecord } from "@/lib/ranking/schema";
import { CAR_NEED_LABELS, PRICE_BAND_LABELS } from "@/components/bases/labels";
import styles from "./home.module.css";

/**
 * The six material warning domains the spec calls out, each grounded in
 * existing reviewed content and linked to its deep page. This is a concise
 * synthesis, not a new data source: the authoritative text lives on the
 * plan-your-trip and swimming pages.
 *
 * Accommodation freshness is computed from the facts file so a stale price
 * check surfaces here as "needs recheck" rather than being silently presented
 * as current.
 */
export function CriticalWarnings({
  bases,
}: {
  bases: BaseRecord[];
}) {
  const accommodation = loadFacts().find((f) => f.category === "accommodation");
  const accommodationFacts = accommodation?.facts ?? [];
  const staleAccommodation = accommodationFacts.filter(
    (f) => !getFreshness(f.checkedAt, f.reviewWindowDays).fresh
  );

  // Summarise car need across bases: if any base requires a car, surface it.
  const carEssential = bases.filter((b) => b.carNeed === "essential");
  const carRecommended = bases.filter((b) => b.carNeed === "recommended");
  const carNeedCount = carEssential.length || carRecommended.length;

  // Group bases by price band so the price warning reflects the data, not a
  // hardcoded restatement of which bases are expensive (which would drift if
  // a base's priceBand is ever corrected).
  const highPriceBases = bases.filter((b) => b.priceBand === "high");
  const budgetBases = bases.filter((b) => b.priceBand === "budget");
  const priceNotes: string[] = [];
  if (highPriceBases.length > 0) {
    priceNotes.push(
      `${highPriceBases.length} base${highPriceBases.length > 1 ? "s" : ""} sit at the ${PRICE_BAND_LABELS.high.toLowerCase()} end (${highPriceBases.map((b) => b.name).join(", ")})`
    );
  }
  if (budgetBases.length > 0) {
    priceNotes.push(
      `${budgetBases.length} are ${PRICE_BAND_LABELS.budget.toLowerCase()} (${budgetBases.map((b) => b.name).join(", ")})`
    );
  }

  return (
    <section aria-labelledby="warnings-heading">
      <h2 id="warnings-heading" className={styles.sectionHeading}>
        What to watch on this trip
      </h2>
      <p className={styles.sectionIntro}>
        Six conditions that change what a day can hold — each links to the full
        guide.
      </p>
      <ul className={styles.warnings}>
        <li className={styles.warningCard}>
          <h3>Changeable weather</h3>
          <p>
            August is mostly mild (20–24 °C highs) but a sunny morning can turn
            to sea fog or wind, especially on the exposed west coast.
          </p>
          <p className={styles.warningLinks}>
            <Link href="/plan/weather">Weather and packing →</Link>
          </p>
        </li>
        <li className={styles.warningCard}>
          <h3>Cold water</h3>
          <p>
            August sea temperatures run 16–19 °C — refreshing rather than warm.
            A shorty wetsuit helps a child who tolerates cool water poorly.
          </p>
          <p className={styles.warningLinks}>
            <Link href="/swimming">Swimming guide →</Link>
          </p>
        </li>
        <li className={styles.warningCard}>
          <h3>Tides</h3>
          <p>
            Tides govern island causeway walks and beach safety on the north
            coast. Carry an offline tide table for your stay.
          </p>
          <p className={styles.warningLinks}>
            <Link href="/plan/weather">Tides detail →</Link>
          </p>
        </li>
        <li className={styles.warningCard}>
          <h3>Driving</h3>
          <p>
            {carNeedCount > 0
              ? `${carNeedCount} of six bases ${
                  carNeedCount === 1 ? "requires" : "require"
                } a car; `
              : "Car need varies by base; "}
            the others range from {CAR_NEED_LABELS.optional.toLowerCase()} to{" "}
            {CAR_NEED_LABELS.recommended.toLowerCase()}.
          </p>
          <p className={styles.warningLinks}>
            <Link href="/plan/getting-around">Getting around →</Link>
          </p>
        </li>
        <li className={styles.warningCard}>
          <h3>Availability</h3>
          <p>
            Accommodation is booked, but August is peak season for everything
            else: attractions with timed entry, boat crossings and restaurants
            fill days ahead.
            {staleAccommodation.length > 0 &&
              ` ${staleAccommodation.length} price check${
                staleAccommodation.length > 1 ? "s are" : " is"
              } older than its review window.`}
          </p>
          <p className={styles.warningLinks}>
            <Link href="/plan/accommodation-budget">Accommodation budget →</Link>
          </p>
        </li>
        <li className={styles.warningCard}>
          <h3>Price</h3>
          <p>
            The family target is €{guideConfig.accommodationBudget.targetNightly}
            /night (ceiling €{guideConfig.accommodationBudget.ceilingNightly}).
            {priceNotes.length > 0 && ` ${priceNotes.join("; ")}.`}
          </p>
          <p className={styles.warningLinks}>
            <Link href="/plan/accommodation-budget">Price detail →</Link>
          </p>
        </li>
      </ul>
    </section>
  );
}
