import Link from "next/link";
import { guideConfig } from "@/config/guide";
import { getTripDay, stayNights } from "@/lib/trip/stays";
import { formatFullDate } from "@/lib/trip/format";
import styles from "./home.module.css";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function daysBetween(from: string, to: string): number {
  return Math.round(
    (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / MS_PER_DAY
  );
}

/**
 * Where we are on a given date, and the shortest route to what is nearby.
 *
 * This replaces the old "which base should we pick" verdict as the first thing
 * on the page: the trip is booked, so the open question is no longer the choice
 * but the day. Task 4 adds the weather and time toggles below this card; until
 * then it links straight to the stay's base and its places.
 */
export function TodayCard({ date }: { date: string }) {
  const day = getTripDay(date);
  const { start, stays } = guideConfig.trip;

  if (!day.onTrip) {
    const upcoming = daysBetween(date, start);
    const first = stays[0];
    return (
      <section className={styles.today} aria-labelledby="today-heading">
        <p className={styles.eyebrow}>{formatFullDate(date)}</p>
        <h2 id="today-heading" className={styles.todayHeadline}>
          {upcoming > 0
            ? `${upcoming} day${upcoming === 1 ? "" : "s"} until the trip`
            : "The trip is over"}
        </h2>
        <p>
          {upcoming > 0
            ? `It starts in ${first.place} on ${formatFullDate(start)}, landing at ${guideConfig.trip.arrivalTime}.`
            : "Everything below is the trip as it was planned and lived."}
        </p>
      </section>
    );
  }

  const stay = day.stay;

  if (!stay) {
    // Departure morning: the last stay has been checked out of, no night left.
    return (
      <section className={styles.today} aria-labelledby="today-heading">
        <p className={styles.eyebrow}>{formatFullDate(date)}</p>
        <h2 id="today-heading" className={styles.todayHeadline}>
          Flying home from {day.leaving?.place}
        </h2>
        <p>Check-out day — no night booked tonight.</p>
      </section>
    );
  }

  const nightNumber = daysBetween(stay.checkIn, date) + 1;
  const nights = stayNights(stay);

  return (
    <section className={styles.today} aria-labelledby="today-heading">
      <p className={styles.eyebrow}>{formatFullDate(date)}</p>
      <h2 id="today-heading" className={styles.todayHeadline}>
        {stay.place}
      </h2>
      <p className={styles.chips}>
        <span className={styles.chip}>
          Night {nightNumber} of {nights}
        </span>
        {day.arrival && <span className={styles.chip}>Arrival, {guideConfig.trip.arrivalTime}</span>}
        {day.moving && <span className={styles.chip}>Moving from {day.leaving?.place}</span>}
      </p>
      {stay.note && <p>{stay.note}</p>}
      {stay.baseSlug && (
        <p className={styles.todayLinks}>
          <Link href={`/bases/${stay.baseSlug}`}>About this base →</Link>{" "}
          <Link href={`/things-to-do?base=${stay.baseSlug}`}>What is nearby →</Link>
        </p>
      )}
    </section>
  );
}
