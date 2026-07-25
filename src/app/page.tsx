import type { Metadata } from "next";
import Link from "next/link";
import { guideConfig } from "@/config/guide";
import { loadBaseRankings } from "@/lib/ranking/data";
import { getStayPages } from "@/lib/content/registry";
import { resolveViewDate } from "@/lib/trip/stays";
import { formatDateRange } from "@/lib/trip/format";
import { TodayCard } from "@/components/home/TodayCard";
import { TripOverview } from "@/components/home/TripOverview";
import { CriticalWarnings } from "@/components/home/CriticalWarnings";
import styles from "@/components/home/home.module.css";

export function generateMetadata(): Metadata {
  return {
    title: guideConfig.siteTitle,
    description: guideConfig.siteDescription,
  };
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const requested = Array.isArray(params.date) ? params.date[0] : params.date;
  const date = resolveViewDate(requested);
  const rankings = loadBaseRankings();
  const stayPages = getStayPages();

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>
          {guideConfig.regionName} · {guideConfig.seasonLabel}
        </p>
        <h1>The trip, day by day</h1>
        <p>
          The route is booked. This is where we are, what is reachable from
          there, and every fact behind it traced back to the research it came
          from.
        </p>
      </header>

      <TodayCard date={date} stayPages={stayPages} />
      <TripOverview date={date} stayPages={stayPages} />
      <CriticalWarnings bases={rankings.bases} />

      <section
        id="assumptions"
        aria-labelledby="assumptions-heading"
        className={styles.assumptions}
      >
        <h2 id="assumptions-heading" className={styles.sectionHeading}>
          Who this trip is for
        </h2>
        <p className={styles.sectionIntro}>
          The guide is built for one specific family and one booked trip. Change
          any of these and its recommendations stop applying.
        </p>
        <dl className={styles.assumptionGrid}>
          <dt className={styles.assumptionKey}>Family</dt>
          <dd className={styles.assumptionValue}>
            {guideConfig.travelers.adults} adults,{" "}
            {guideConfig.travelers.children} child (age{" "}
            {guideConfig.travelers.childAgeRange})
          </dd>
          <dt className={styles.assumptionKey}>Travelling from</dt>
          <dd className={styles.assumptionValue}>
            {guideConfig.origins.join(" or ")}
          </dd>
          <dt className={styles.assumptionKey}>Dates</dt>
          <dd className={styles.assumptionValue}>
            {formatDateRange(guideConfig.trip.start, guideConfig.trip.end)}{" "}
            {guideConfig.tripYear}, landing at {guideConfig.trip.arrivalTime}
          </dd>
          <dt className={styles.assumptionKey}>Accommodation budget</dt>
          <dd className={styles.assumptionValue}>
            €{guideConfig.accommodationBudget.targetNightly}/night target,
            ceiling €{guideConfig.accommodationBudget.ceilingNightly}
          </dd>
          <dt className={styles.assumptionKey}>Priorities</dt>
          <dd className={styles.assumptionValue}>
            {guideConfig.priorities.join(", ")}
          </dd>
        </dl>
        <p>
          The bases were compared before booking; that comparison is kept as{" "}
          <Link href="/bases">how the destination was chosen</Link>.
        </p>
      </section>
    </div>
  );
}
