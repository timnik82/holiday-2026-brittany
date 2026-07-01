import { describe, expect, it } from "vitest";
import {
  calculateBaseRanking,
  rankBases,
  type BaseRankingInput,
} from "../calculate";
import {
  FAMILY_WEIGHTS,
  RANKING_DIMENSIONS,
  type RankingDimension,
} from "../weights";

const completeScores: Record<RankingDimension, number> = {
  climate: 8,
  nature: 9,
  culture: 7,
  familyActivities: 8,
  logistics: 6,
  accommodation: 7,
  food: 8,
};

function base(
  slug: string,
  scores: BaseRankingInput["scores"] = completeScores
): BaseRankingInput {
  return { slug, scores };
}

describe("family ranking weights", () => {
  it("cover every ranking dimension and sum to exactly one", () => {
    expect(Object.keys(FAMILY_WEIGHTS).sort()).toEqual(
      [...RANKING_DIMENSIONS].sort()
    );
    expect(Object.values(FAMILY_WEIGHTS).reduce((sum, value) => sum + value, 0)).toBe(1);
  });
});

describe("calculateBaseRanking", () => {
  it("calculates the approved weighted total", () => {
    expect(calculateBaseRanking(base("sample"))).toEqual({
      slug: "sample",
      total: 7.7,
      confidence: 1,
    });
  });

  it("returns an unknown total and reduced confidence when evidence is missing", () => {
    expect(
      calculateBaseRanking(
        base("incomplete", { ...completeScores, food: null })
      )
    ).toEqual({
      slug: "incomplete",
      total: null,
      confidence: 6 / 7,
    });
  });
});

describe("rankBases", () => {
  it("uses the slug as a stable tie-breaker", () => {
    expect(rankBases([base("z-base"), base("a-base")]).map((item) => item.slug)).toEqual([
      "a-base",
      "z-base",
    ]);
  });
});
