import {
  BATHING_DIMENSIONS,
  BATHING_WEIGHTS,
  type BathingDimension,
} from "./bathing-dimensions";

export interface BathingSuitabilityInput {
  slug: string;
  scores: Record<BathingDimension, number | null>;
  /**
   * Whether official water-quality evidence is missing. When true the total is
   * forced to null and a visible warning is surfaced — we never publish a
   * neutral-looking score in the absence of verifiable water-quality data.
   */
  waterQualityMissing: boolean;
}

export interface BathingSuitabilityResult {
  slug: string;
  total: number | null;
  /** Fraction of dimensions with a known score (always knownDimensions/6). */
  confidence: number;
  /** Whether a missing-water-quality warning should be shown. */
  waterQualityWarning: boolean;
}

/**
 * Calculate bathing suitability. Confidence is always knownDimensions/6. The
 * total is null when any dimension is null OR when water-quality evidence is
 * missing (even if every score is present). Otherwise the total is the
 * equal-weight mean of the six scores, rounded to 2 decimals.
 */
export function calculateBathingSuitability(
  input: BathingSuitabilityInput
): BathingSuitabilityResult {
  const knownDimensions = BATHING_DIMENSIONS.filter(
    (dimension) => input.scores[dimension] !== null
  );
  const confidence = knownDimensions.length / BATHING_DIMENSIONS.length;

  const waterQualityWarning = input.waterQualityMissing;

  if (knownDimensions.length !== BATHING_DIMENSIONS.length || waterQualityWarning) {
    return { slug: input.slug, total: null, confidence, waterQualityWarning };
  }

  const total = BATHING_DIMENSIONS.reduce(
    (sum, dimension) => sum + input.scores[dimension]! * BATHING_WEIGHTS[dimension],
    0
  );

  return {
    slug: input.slug,
    total: Math.round(total * 100) / 100,
    confidence,
    waterQualityWarning,
  };
}

/**
 * Rank bathing locations: highest total first, null totals last, ties broken
 * alphabetically by slug (mirrors `rankBases` in calculate.ts).
 */
export function rankBathing(
  inputs: BathingSuitabilityInput[]
): BathingSuitabilityResult[] {
  return inputs
    .map(calculateBathingSuitability)
    .sort((left, right) => {
      if (left.total === null && right.total !== null) return 1;
      if (left.total !== null && right.total === null) return -1;
      if (left.total !== null && right.total !== null && left.total !== right.total) {
        return right.total - left.total;
      }
      return left.slug.localeCompare(right.slug);
    });
}
