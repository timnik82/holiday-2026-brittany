import {
  FAMILY_WEIGHTS,
  RANKING_DIMENSIONS,
  type RankingDimension,
} from "./weights";

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
