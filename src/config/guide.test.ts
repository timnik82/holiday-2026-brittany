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

  it("uses valid, ordered ISO date windows", () => {
    for (const window of guideConfig.dateWindows) {
      expect(window.start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(window.end).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Date.parse(window.start)).not.toBeNaN();
      expect(Date.parse(window.end)).not.toBeNaN();
      expect(Date.parse(window.start)).toBeLessThanOrEqual(
        Date.parse(window.end)
      );
    }
  });

  it("keeps the target accommodation budget within the ceiling", () => {
    expect(guideConfig.accommodationBudget.targetNightly).toBeLessThanOrEqual(
      guideConfig.accommodationBudget.ceilingNightly
    );
  });
});
