import {
  FAMILY_WEIGHTS,
  RANKING_DIMENSIONS,
  type RankingDimension,
} from "./weights";
import type { BaseRecord } from "./schema";

export interface BaseRankingInput {
  slug: string;
  scores: Record<RankingDimension, number | null>;
}

export interface BaseRankingResult {
  slug: string;
  total: number | null;
  confidence: number;
}

export function calculateBaseRanking(input: BaseRankingInput): BaseRankingResult {
  const knownDimensions = RANKING_DIMENSIONS.filter(
    (dimension) => input.scores[dimension] !== null
  );
  const confidence = knownDimensions.length / RANKING_DIMENSIONS.length;

  if (knownDimensions.length !== RANKING_DIMENSIONS.length) {
    return { slug: input.slug, total: null, confidence };
  }

  const total = RANKING_DIMENSIONS.reduce(
    (sum, dimension) =>
      sum + input.scores[dimension]! * FAMILY_WEIGHTS[dimension],
    0
  );

  return { slug: input.slug, total: Math.round(total * 100) / 100, confidence };
}

/**
 * Rank loaded base records directly.
 *
 * Every view that ranks bases — the selection summary, the comparison table and
 * each base's detail page — needs the same projection from `BaseRecord` to
 * `BaseRankingInput`. Doing it inline three times meant a change to the
 * dimension list or the score shape could leave the views disagreeing about the
 * order, so the projection lives here once.
 */
export function rankBaseRecords(bases: BaseRecord[]): BaseRankingResult[] {
  return rankBases(
    bases.map((base) => ({
      slug: base.slug,
      scores: Object.fromEntries(
        RANKING_DIMENSIONS.map((dimension) => [dimension, base.scores[dimension].score])
      ) as Record<RankingDimension, number | null>,
    }))
  );
}

export function rankBases(inputs: BaseRankingInput[]): BaseRankingResult[] {
  return inputs
    .map(calculateBaseRanking)
    .sort((left, right) => {
      if (left.total === null && right.total !== null) return 1;
      if (left.total !== null && right.total === null) return -1;
      if (left.total !== null && right.total !== null && left.total !== right.total) {
        return right.total - left.total;
      }
      return left.slug.localeCompare(right.slug);
    });
}
