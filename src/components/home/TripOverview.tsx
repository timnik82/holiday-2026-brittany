import Link from "next/link";
import { guideConfig } from "@/config/guide";
import { getTripDay, listStays } from "@/lib/trip/stays";
import { formatDateRange } from "@/lib/trip/format";
import styles from "./home.module.css";

/**
 * The whole booked trip, five stays in travel order, with the current one
 * marked. This replaces the two candidate date windows the guide used to
 * compare — the choice is made and paid for, so the useful view is the sequence
 * we are actually travelling.
 */
export function TripOverview({ date }: { date: string }) {
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
              aria-current={isCurrent ? "true" : undefined}
            >
              <span className={styles.stayPlace}>
                {stay.baseSlug ? (
                  <Link href={`/bases/${stay.baseSlug}`}>{stay.place}</Link>
                ) : (
                  stay.place
                )}
              </span>
              <span className={styles.stayDates}>
                <time dateTime={stay.checkIn}>{formatDateRange(stay.checkIn, stay.checkOut)}</time>
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
