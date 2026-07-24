/**
 * One booked accommodation: where we sleep and between which dates.
 *
 * A stay is not a base. A *base* is one of the candidate regions the selection
 * exercise compared (see `content/rankings/bases.json`); a *stay* is actual
 * booked accommodation on this trip. Most stays sit on a base, but Nantes does
 * not — it is a city bookend, never a candidate. `baseSlug` is therefore
 * nullable, and places reachable from a stay are not limited to that base.
 */
export type Stay = {
  /** Stable identifier; unique even when the same place is stayed in twice. */
  readonly id: string;
  /** Human-readable place name, used when there is no base page to name it. */
  readonly place: string;
  /** The base this stay sits on, or `null` for a stay outside the candidates. */
  readonly baseSlug: string | null;
  /** ISO date of the first night. */
  readonly checkIn: string;
  /** ISO date of the morning we leave; no night is spent on this date. */
  readonly checkOut: string;
  /** Optional one-line context (arrival time, departure, purpose). */
  readonly note?: string;
};

type Trip = {
  readonly start: string;
  readonly end: string;
  /** Local arrival time on the first day, `HH:MM`. */
  readonly arrivalTime: string;
  readonly stays: readonly Stay[];
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
  /** IANA zone of the destination — "today" is resolved there, not on the server. */
  readonly timeZone: string;
  readonly trip: Trip;
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
  timeZone: "Europe/Paris",
  trip: {
    start: "2026-08-06",
    end: "2026-08-23",
    arrivalTime: "20:05",
    stays: [
      {
        id: "nantes-arrival",
        place: "Nantes",
        baseSlug: null,
        checkIn: "2026-08-06",
        checkOut: "2026-08-09",
        note: "Lands at 20:05 — no programme on the first evening.",
      },
      {
        id: "vannes-carnac-morbihan",
        place: "Vannes / Carnac / Morbihan",
        baseSlug: "vannes-carnac-morbihan",
        checkIn: "2026-08-09",
        checkOut: "2026-08-14",
      },
      {
        id: "quimper-south-finistere",
        place: "Quimper / South Finistère",
        baseSlug: "quimper-south-finistere",
        checkIn: "2026-08-14",
        checkOut: "2026-08-18",
      },
      {
        id: "saint-malo-dinan",
        place: "Saint-Malo / Dinan",
        baseSlug: "saint-malo-dinan",
        checkIn: "2026-08-18",
        checkOut: "2026-08-22",
      },
      {
        id: "nantes-departure",
        place: "Nantes",
        baseSlug: null,
        checkIn: "2026-08-22",
        checkOut: "2026-08-23",
        note: "One night before the flight home.",
      },
    ],
  },
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
