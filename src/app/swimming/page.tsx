import type { Metadata } from "next";
import { SwimmingComparison } from "@/components/swimming/SwimmingComparison";
import { guideConfig } from "@/config/guide";
import { loadBathingLocations } from "@/lib/ranking/bathing-data";
import { rankBathing, type BathingSuitabilityInput } from "@/lib/ranking/bathing";
import type { BathingLocation } from "@/lib/ranking/bathing-schema";
import {
  BATHING_DIMENSIONS,
  BATHING_DIMENSION_LABELS,
} from "@/lib/ranking/bathing-dimensions";
import { loadBaseRankings } from "@/lib/ranking/data";
import styles from "@/components/swimming/swimming.module.css";

export function generateMetadata(): Metadata {
  return {
    title: `Where to swim — ${guideConfig.shortTitle}`,
    description: `An evidence-backed bathing-suitability comparison of sea, lake and tidal-pool swimming spots around ${guideConfig.regionName} for ${guideConfig.seasonLabel}.`,
  };
}

/**
 * Convert a bathing location into the engine's input. `waterQualityMissing` is
 * derived from whether the waterQuality dimension has a known score: a null
 * score means we have no official water-quality evidence, which forces an
 * unknown total and a visible warning (never a silent neutral number).
 */
function toInput(location: BathingLocation): BathingSuitabilityInput {
  return {
    slug: location.slug,
    scores: Object.fromEntries(
      BATHING_DIMENSIONS.map((dimension) => [
        dimension,
        location.scores[dimension].score,
      ])
    ) as BathingSuitabilityInput["scores"],
    waterQualityMissing: location.scores.waterQuality.score === null,
  };
}

export default function SwimmingPage() {
  const { locations } = loadBathingLocations();
  const results = rankBathing(locations.map(toInput));
  const resultBySlug = new Map(results.map((r) => [r.slug, r]));

  const rows = locations.map((location) => ({
    location,
    result: resultBySlug.get(location.slug)!,
  }));
  const baseNames = new Map(
    loadBaseRankings().bases.map((base) => [base.slug, base.name])
  );

  const dimensionCount = BATHING_DIMENSIONS.length;

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>
          Swimming guide · {guideConfig.seasonLabel}
        </p>
        <h1>Where to swim around {guideConfig.regionName}</h1>
        <p>
          Sea, lake and tidal-pool spots scored for family bathing. Each score
          uses the same 1–10 scale. Water quality is checked against the official
          French bathing-water register (baignades.sante.gouv.fr) and dated.
        </p>
      </header>

      <section className={styles.methodNote} aria-labelledby="method-heading">
        <h2 id="method-heading">How the bathing score works</h2>
        <p>
          Six dimensions carry equal weight ({(100 / dimensionCount).toFixed(1)}%
          each). A missing score, or missing official water-quality data, produces
          an unknown total instead of a guessed number — so a spot with no
          verifiable water-quality evidence never shows a neutral-looking score.
        </p>
        <ul className={styles.methodChips}>
          {BATHING_DIMENSIONS.map((dimension) => (
            <li key={dimension}>{BATHING_DIMENSION_LABELS[dimension]}</li>
          ))}
        </ul>
      </section>

      <SwimmingComparison rows={rows} baseNames={baseNames} />
    </div>
  );
}
