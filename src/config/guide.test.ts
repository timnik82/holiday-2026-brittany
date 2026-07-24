import { describe, expect, it } from "vitest";

import { guideConfig } from "./guide";

describe("guideConfig", () => {
  it("describes the current Brittany family guide", () => {
    expect(guideConfig.siteTitle).toBe(
      "Holiday 2026 — Brittany Family Guide"
    );
    expect(guideConfig.shortTitle).toBe("Brittany 2026");
    expect(guideConfig.siteDescription).toBe(
      "An English-language family travel guide for Brittany, France, August 2026."
    );
    expect(guideConfig.language).toBe("en");
    expect(guideConfig.locale).toBe("en-GB");
    expect(guideConfig.currency).toBe("EUR");
    expect(guideConfig.regionName).toBe("Brittany");
    expect(guideConfig.countryName).toBe("France");
    expect(guideConfig.tripYear).toBe(2026);
    expect(guideConfig.seasonLabel).toBe("August 2026");
    expect(guideConfig.travelers).toEqual({
      adults: 2,
      children: 1,
      childAgeRange: "9–10",
    });
    expect(guideConfig.origins).toEqual(["Lisbon", "Porto"]);
    expect(guideConfig.priorities).toHaveLength(7);
  });

  it("uses valid, ordered ISO dates for the booked trip", () => {
    const { start, end, stays } = guideConfig.trip;
    for (const date of [start, end, ...stays.flatMap((s) => [s.checkIn, s.checkOut])]) {
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Date.parse(date)).not.toBeNaN();
    }
    expect(Date.parse(start)).toBeLessThan(Date.parse(end));

    for (const stay of stays) {
      expect(Date.parse(stay.checkIn)).toBeLessThan(Date.parse(stay.checkOut));
    }
  });

  it("gives every stay a unique id", () => {
    const ids = guideConfig.trip.stays.map((stay) => stay.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps the target accommodation budget within the ceiling", () => {
    expect(guideConfig.accommodationBudget.targetNightly).toBeLessThanOrEqual(
      guideConfig.accommodationBudget.ceilingNightly
    );
  });
});
