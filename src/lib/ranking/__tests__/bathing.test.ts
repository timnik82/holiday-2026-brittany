import { describe, expect, it } from "vitest";
import {
  calculateBathingSuitability,
  rankBathing,
  type BathingSuitabilityInput,
} from "../bathing";
import {
  BATHING_DIMENSIONS,
  BATHING_WEIGHTS,
  type BathingDimension,
} from "../bathing-dimensions";

const completeScores: Record<BathingDimension, number> = {
  temperatureShelter: 8,
  tides: 8,
  easyAccess: 8,
  lifeguards: 8,
  waterQuality: 8,
  alternatives: 8,
};

function location(
  slug: string,
  overrides: Partial<BathingSuitabilityInput> = {}
): BathingSuitabilityInput {
  return {
    slug,
    scores: completeScores,
    waterQualityMissing: false,
    ...overrides,
  };
}

describe("bathing suitability weights", () => {
  it("cover every bathing dimension, are equal, and sum to one", () => {
    // The `as const satisfies Record<BathingDimension, number>` on
    // BATHING_WEIGHTS makes a missing or extra key a compile error, so this
    // key-set check mainly guards against accidental reordering at runtime.
    expect(Object.keys(BATHING_WEIGHTS).sort()).toEqual(
      [...BATHING_DIMENSIONS].sort()
    );

    const values = Object.values(BATHING_WEIGHTS);
    // Equal weight: every dimension carries exactly 1/6.
    for (const value of values) {
      expect(value).toBe(1 / BATHING_DIMENSIONS.length);
    }
    // The six 1/6 weights sum to 1 mathematically; IEEE-754 cannot represent
    // 1/6 exactly, so verify within floating-point tolerance (the engine
    // rounds its total to 2 decimals, which is unaffected).
    expect(
      values.reduce((sum, value) => sum + value, 0)
    ).toBeCloseTo(1, 10);
  });
});

describe("calculateBathingSuitability", () => {
  it("returns the equal-weight mean when every dimension is known", () => {
    // All-8 → 8.0 exactly.
    expect(calculateBathingSuitability(location("sample"))).toEqual({
      slug: "sample",
      total: 8.0,
      confidence: 1,
      waterQualityWarning: false,
    });
  });

  it("computes a deterministic total for mixed scores", () => {
    const scores: Record<BathingDimension, number> = {
      temperatureShelter: 9,
      tides: 7,
      easyAccess: 8,
      lifeguards: 6,
      waterQuality: 9,
      alternatives: 7,
    };
    // Equal weight mean: (9+7+8+6+9+7)/6 = 46/6 = 7.6666… → 7.67.
    expect(
      calculateBathingSuitability(location("mixed", { scores }))
    ).toEqual({
      slug: "mixed",
      total: 7.67,
      confidence: 1,
      waterQualityWarning: false,
    });
  });

  it("returns an unknown total and reduced confidence when one score is null", () => {
    expect(
      calculateBathingSuitability(
        location("incomplete", {
          scores: { ...completeScores, waterQuality: null },
        })
      )
    ).toEqual({
      slug: "incomplete",
      total: null,
      confidence: 5 / 6,
      waterQualityWarning: false,
    });
  });

  it("forces an unknown total and a warning when water-quality evidence is missing, even with all scores present", () => {
    const result = calculateBathingSuitability(
      location("no-water-data", { waterQualityMissing: true })
    );
    expect(result.total).toBeNull();
    expect(result.waterQualityWarning).toBe(true);
    // Confidence still reflects that all six scores were filled in; the
    // missing item is the *official evidence*, not the dimension itself.
    expect(result.confidence).toBe(1);
  });
});

describe("rankBathing", () => {
  it("orders by total descending and uses the slug as a stable tie-breaker", () => {
    const high = location("zeta", {
      scores: { ...completeScores, temperatureShelter: 10 },
    });
    const low = location("alpha", {
      scores: { ...completeScores, temperatureShelter: 4 },
    });
    expect(rankBathing([low, high]).map((item) => item.slug)).toEqual([
      "zeta",
      "alpha",
    ]);
  });

  it("places equal totals in slug order and sorts null totals last", () => {
    const a = location("bravo");
    const b = location("alpha"); // tie with bravo (both all-8)
    const unknown = location("zulu", {
      scores: { ...completeScores, waterQuality: null },
    });
    expect(rankBathing([unknown, b, a]).map((item) => item.slug)).toEqual([
      "alpha",
      "bravo",
      "zulu",
    ]);
  });
});
