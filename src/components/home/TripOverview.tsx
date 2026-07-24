import Link from "next/link";
import { guideConfig } from "@/config/guide";
import { getTripDay, listStays } from "@/lib/trip/stays";
import { formatDateRange, formatDay } from "@/lib/trip/format";
import type { Stay } from "@/config/guide";
import styles from "./home.module.css";

/** Whether a stay starts and ends in the same month, so the month is said once. */
function sharesMonth(stay: Stay): boolean {
  return stay.checkIn.slice(0, 7) === stay.checkOut.slice(0, 7);
}

/**
 * The whole booked trip, five stays in travel order, with the current one
 * marked. This replaces the two candidate date windows the guide used to
 * compare — the choice is made and paid for, so the useful view is the sequence
 * we are actually travelling.
 */
export function TripOverview({
  date,
  writtenStayIds,
}: {
  date: string;
  /** Stay ids with a page under /trip; others link to their base instead. */
  writtenStayIds: Set<string>;
}) {
  const stays = listStays();
  const current = getTripDay(date).stay;

  return (
    <section aria-labelledby="trip-heading">
      <h2 id="trip-heading" className={styles.sectionHeading}>
        The trip
      </h2>
      <p className={styles.sectionIntro}>
        {stays.length} stays, {stays.reduce((sum, entry) => sum + entry.nights, 0)} nights,{" "}
        {formatDateRange(guideConfig.trip.start, guideConfig.trip.end)}.
      </p>
      <ol className={styles.stays}>
        {stays.map(({ stay, nights }) => {
          const isCurrent = current?.id === stay.id;
          return (
            <li
              key={stay.id}
              className={`${styles.stayCard} ${isCurrent ? styles.stayCardCurrent : ""}`}
              aria-current={isCurrent ? "step" : undefined}
            >
              <span className={styles.stayPlace}>
                {/* The stay's own day-by-day page is the more useful
                    destination; the base page is the fallback until a stay is
                    written up, and plain text when it has neither. */}
                {writtenStayIds.has(stay.id) ? (
                  <Link href={`/trip/${stay.id}`}>{stay.place}</Link>
                ) : stay.baseSlug ? (
                  <Link href={`/bases/${stay.baseSlug}`}>{stay.place}</Link>
                ) : (
                  stay.place
                )}
              </span>
              <span className={styles.stayDates}>
                {/* Two machine-readable dates rather than one wrapping the whole
                    range, so the markup states check-in and check-out rather than
                    labelling a range with a single date. */}
                <time dateTime={stay.checkIn}>{formatDay(stay.checkIn, !sharesMonth(stay))}</time>
                {" – "}
                <time dateTime={stay.checkOut}>{formatDay(stay.checkOut, true)}</time>
                {" · "}
                {nights} night{nights === 1 ? "" : "s"}
              </span>
              {stay.note && <span className={styles.stayNote}>{stay.note}</span>}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
