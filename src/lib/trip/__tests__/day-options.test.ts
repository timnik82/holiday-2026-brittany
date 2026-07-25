import { describe, expect, it } from "vitest";
import {
  rankDayOptions,
  resolveDayTime,
  resolveDayWeather,
  scoreDayOption,
  type DayOptionInput,
} from "../day-options";
import { reachForStay } from "../reach";

function place(
  slug: string,
  overrides: Partial<DayOptionInput> = {}
): DayOptionInput {
  return {
    slug,
    weatherFit: "mixed",
    durationHours: { min: 2, max: 4 },
    reach: "nearby",
    ...overrides,
  };
}

describe("reachForStay", () => {
  it("returns curated entries for a Brittany stay", () => {
    const entries = reachForStay("quimper-south-finistere");
    expect(entries.some((e) => e.place === "pointe-du-raz")).toBe(true);
    expect(entries.find((e) => e.place === "quimper")?.reach).toBe("nearby");
  });

  it("returns curated entries for Nantes arrival stay", () => {
    const entries = reachForStay("nantes-arrival");
    expect(entries.some((e) => e.place === "les-machines-de-l-ile")).toBe(true);
    expect(entries.find((e) => e.place === "jules-verne-planetarium")?.reach).toBe(
      "nearby"
    );
  });

  it("returns a smaller evening-oriented list for Nantes departure", () => {
    const entries = reachForStay("nantes-departure");
    expect(entries.map((e) => e.place)).toEqual([
      "chateau-des-ducs-nantes",
      "le-voyage-a-nantes",
      "les-machines-de-l-ile",
    ]);
  });

  it("returns an empty list for unknown stays", () => {
    expect(reachForStay("not-a-stay")).toEqual([]);
  });
});

describe("rankDayOptions for Nantes", () => {
  it("puts indoor options above outdoor ones in rain with two hours free", () => {
    const ranked = rankDayOptions(
      [
        place("jardin-extraordinaire", {
          weatherFit: "outdoor",
          durationHours: { min: 2, max: 3 },
          reach: "nearby",
        }),
        place("jules-verne-planetarium", {
          weatherFit: "indoor",
          durationHours: { min: 3, max: 4 },
          reach: "nearby",
        }),
        place("chateau-des-ducs-nantes", {
          weatherFit: "mixed",
          durationHours: { min: 2, max: 4 },
          reach: "nearby",
        }),
      ],
      "rain",
      2
    );

    expect(ranked[0]?.slug).toBe("chateau-des-ducs-nantes");
    expect(ranked[ranked.length - 1]?.slug).toBe("jardin-extraordinaire");
    expect(
      ranked.find((r) => r.slug === "jardin-extraordinaire")?.reasons
    ).toContain("outdoor — less suited to rain");
  });
});

describe("scoreDayOption", () => {
  it("demotes outdoor places in the rain", () => {
    const outdoor = scoreDayOption(
      place("cliffs", { weatherFit: "outdoor" }),
      "rain",
      8
    );
    const indoor = scoreDayOption(
      place("aquarium", { weatherFit: "indoor" }),
      "rain",
      8
    );
    expect(outdoor.score).toBeLessThan(indoor.score);
    expect(outdoor.reasons).toContain("outdoor — less suited to rain");
    expect(indoor.reasons).toEqual([]);
  });

  it("demotes places whose minimum duration exceeds available time", () => {
    const result = scoreDayOption(
      place("half-day", { durationHours: { min: 3, max: 4 } }),
      "fair",
      2
    );
    expect(result.reasons).toContain("does not fit 2 hours");
  });

  it("demotes day trips when only two hours are free", () => {
    const result = scoreDayOption(
      place("drive", { reach: "day-trip" }),
      "fair",
      2
    );
    expect(result.reasons).toContain("day trip");
  });

  it("leaves unmarked weather and duration fields neutral", () => {
    const unmarked = scoreDayOption(
      place("lac", {
        weatherFit: undefined,
        durationHours: undefined,
        reach: "nearby",
      }),
      "rain",
      2
    );
    expect(unmarked.reasons).toEqual([]);
    expect(unmarked.score).toBe(100);
  });
});

describe("rankDayOptions", () => {
  it("keeps every place on the list and sorts high to low", () => {
    const ranked = rankDayOptions(
      [
        place("pointe-du-raz", {
          weatherFit: "outdoor",
          durationHours: { min: 3, max: 8 },
          reach: "day-trip",
        }),
        place("quimper", {
          weatherFit: "mixed",
          durationHours: { min: 3, max: 8 },
          reach: "nearby",
        }),
        place("oceanopolis", {
          weatherFit: "indoor",
          durationHours: { min: 3, max: 8 },
          reach: "day-trip",
        }),
      ],
      "rain",
      2
    );

    expect(ranked.map((r) => r.slug)).toEqual([
      "quimper",
      "oceanopolis",
      "pointe-du-raz",
    ]);
    expect(ranked).toHaveLength(3);
    expect(ranked.find((r) => r.slug === "pointe-du-raz")?.reasons).toEqual(
      expect.arrayContaining(["day trip", "outdoor — less suited to rain"])
    );
  });

  it("keeps curated input order when scores tie", () => {
    const ranked = rankDayOptions(
      [place("zeta"), place("alpha"), place("mid")],
      "fair",
      8
    );
    expect(ranked.map((r) => r.slug)).toEqual(["zeta", "alpha", "mid"]);
  });
});

describe("resolveDayWeather / resolveDayTime", () => {
  it("defaults weather to fair and time to a full day", () => {
    expect(resolveDayWeather(undefined)).toBe("fair");
    expect(resolveDayWeather("windy")).toBe("fair");
    expect(resolveDayTime(undefined)).toBe(8);
    expect(resolveDayTime("99")).toBe(8);
  });

  it("accepts known values", () => {
    expect(resolveDayWeather("rain")).toBe("rain");
    expect(resolveDayTime("2")).toBe(2);
    expect(resolveDayTime("4")).toBe(4);
  });
});
