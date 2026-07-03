import type { Metadata } from "next";
import { guideConfig } from "@/config/guide";
import { loadBaseRankings } from "@/lib/ranking/data";
import { rankBases } from "@/lib/ranking/calculate";
import { RANKING_DIMENSIONS } from "@/lib/ranking/weights";
import { Verdict } from "@/components/home/Verdict";
import { TopBases, type TopBaseRow } from "@/components/home/TopBases";
import { DateWindows } from "@/components/home/DateWindows";
import { RouteChoices } from "@/components/home/RouteChoices";
import { CriticalWarnings } from "@/components/home/CriticalWarnings";
import styles from "@/components/home/home.module.css";

export function generateMetadata(): Metadata {
  return {
    title: guideConfig.siteTitle,
    description: guideConfig.siteDescription,
  };
}

export default function Home() {
  const rankings = loadBaseRankings();
  const ranked = rankBases(
    rankings.bases.map((base) => ({
      slug: base.slug,
      scores: Object.fromEntries(
        RANKING_DIMENSIONS.map((dimension) => [
          dimension,
          base.scores[dimension].score,
        ])
      ) as Record<(typeof RANKING_DIMENSIONS)[number], number | null>,
    }))
  );
  const baseBySlug = new Map(rankings.bases.map((b) => [b.slug, b]));

  const topRows: TopBaseRow[] = ranked.slice(0, 3).map((result, index) => ({
    result,
    base: baseBySlug.get(result.slug)!,
    rank: index + 1,
  }));

  const topResult = ranked[0];
  const topBase = baseBySlug.get(topResult.slug)!;

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>
          Decision guide · {guideConfig.seasonLabel}
        </p>
        <h1>{guideConfig.regionName} for this family</h1>
        <p>
          A personalised, evidence-backed recommendation for {guideConfig.tripYear}{" "}
          — the shortlist, the routes, and the warnings that could change the
          decision, all in one place.
        </p>
      </header>

      <Verdict topResult={topResult} topBase={topBase} />
      <TopBases rows={topRows} />
      <DateWindows />
      <RouteChoices />
      <CriticalWarnings bases={rankings.bases} />

      <section
        id="assumptions"
        aria-labelledby="assumptions-heading"
        className={styles.assumptions}
      >
        <h2 id="assumptions-heading" className={styles.sectionHeading}>
          About this recommendation
        </h2>
        <p className={styles.sectionIntro}>
          This guide is built for one specific family and trip. The ranking is
          not universal — change any of these and the answer may change.
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
          <dt className={styles.assumptionKey}>Date windows</dt>
          <dd className={styles.assumptionValue}>
            {guideConfig.dateWindows
              .map((w) => `${w.label} (${w.start} – ${w.end})`)
              .join("; ")}
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
          See the{" "}
          <a href="/bases">full six-base comparison and methodology</a> for how
          these priorities are weighted.
        </p>
      </section>
    </div>
  );
}
