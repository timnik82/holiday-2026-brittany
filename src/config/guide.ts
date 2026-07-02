type DateWindow = {
  readonly label: string;
  readonly start: string;
  readonly end: string;
};

export type GuideConfig = {
  readonly siteTitle: string;
  readonly shortTitle: string;
  readonly siteDescription: string;
  readonly language: string;
  readonly locale: string;
  readonly currency: string;
  readonly regionName: string;
  readonly countryName: string;
  readonly tripYear: number;
  readonly seasonLabel: string;
  readonly travelers: {
    readonly adults: number;
    readonly children: number;
    readonly childAgeRange: string;
  };
  readonly origins: readonly string[];
  readonly dateWindows: readonly DateWindow[];
  readonly accommodationBudget: {
    readonly targetNightly: number;
    readonly ceilingNightly: number;
  };
  readonly priorities: readonly string[];
};

export const guideConfig = {
  siteTitle: "Holiday 2026 — Brittany Family Guide",
  shortTitle: "Brittany 2026",
  siteDescription:
    "An English-language family travel guide for Brittany, France, August 2026.",
  language: "en",
  locale: "en-GB",
  currency: "EUR",
  regionName: "Brittany",
  countryName: "France",
  tripYear: 2026,
  seasonLabel: "August 2026",
  travelers: {
    adults: 2,
    children: 1,
    childAgeRange: "9–10",
  },
  origins: ["Lisbon", "Porto"],
  dateWindows: [
    {
      label: "early August",
      start: "2026-08-08",
      end: "2026-08-17",
    },
    {
      label: "late August",
      start: "2026-08-22",
      end: "2026-08-31",
    },
  ],
  accommodationBudget: {
    targetNightly: 150,
    ceilingNightly: 180,
  },
  priorities: [
    "fresh climate without strong heat",
    "nature",
    "sea access",
    "historic towns",
    "castles and museums",
    "family activities",
    "good food",
  ],
} as const satisfies GuideConfig;
