import { describe, expect, it } from "vitest";

import { guideConfig } from "@/config/guide";
import {
  destinationToday,
  getTripDay,
  listStays,
  resolveViewDate,
  stayNights,
} from "../stays";

describe("booked stays", () => {
  it("covers the whole trip with no gap or overlap", () => {
    const stays = guideConfig.trip.stays;
    expect(stays[0].checkIn).toBe(guideConfig.trip.start);
    expect(stays[stays.length - 1].checkOut).toBe(guideConfig.trip.end);

    for (let i = 1; i < stays.length; i++) {
      expect(stays[i].checkIn).toBe(stays[i - 1].checkOut);
    }
  });

  it("sums to the number of nights between arrival and departure", () => {
    const total = listStays().reduce((sum, entry) => sum + entry.nights, 0);
    expect(total).toBe(17);
  });

  it("links every base-backed stay to a real base", () => {
    const knownBases = new Set([
      "saint-malo-dinan",
      "cote-de-granit-rose",
      "brest-finistere",
      "crozon-douarnenez",
      "quimper-south-finistere",
      "vannes-carnac-morbihan",
    ]);

    for (const stay of guideConfig.trip.stays) {
      if (stay.baseSlug !== null) {
        expect(knownBases).toContain(stay.baseSlug);
      }
    }
  });

  it("counts nights, not calendar days", () => {
    const [nantesArrival] = guideConfig.trip.stays;
    expect(stayNights(nantesArrival)).toBe(3);
  });
});

describe("getTripDay", () => {
  it("reports the stay whose night is spent on that date", () => {
    expect(getTripDay("2026-08-07").stay?.id).toBe("nantes-arrival");
    expect(getTripDay("2026-08-10").stay?.id).toBe("vannes-carnac-morbihan");
    expect(getTripDay("2026-08-20").stay?.id).toBe("saint-malo-dinan");
  });

  it("gives a moving day to the stay slept in that evening", () => {
    const movingDay = getTripDay("2026-08-14");
    expect(movingDay.stay?.id).toBe("quimper-south-finistere");
    expect(movingDay.leaving?.id).toBe("vannes-carnac-morbihan");
    expect(movingDay.moving).toBe(true);
  });

  it("treats the final morning as a departure with no night", () => {
    const lastDay = getTripDay("2026-08-23");
    expect(lastDay.onTrip).toBe(true);
    expect(lastDay.stay).toBeNull();
    expect(lastDay.leaving?.id).toBe("nantes-departure");
    expect(lastDay.departure).toBe(true);
    expect(lastDay.moving).toBe(false);
  });

  it("flags the arrival day", () => {
    const firstDay = getTripDay("2026-08-06");
    expect(firstDay.arrival).toBe(true);
    expect(firstDay.stay?.id).toBe("nantes-arrival");
  });

  it("returns an empty day outside the trip", () => {
    for (const date of ["2026-08-05", "2026-08-24", "not-a-date"]) {
      const day = getTripDay(date);
      expect(day.onTrip).toBe(false);
      expect(day.stay).toBeNull();
    }
  });
});

describe("resolveViewDate", () => {
  it("prefers a valid requested date", () => {
    expect(resolveViewDate("2026-08-12")).toBe("2026-08-12");
  });

  it("falls back to the destination date when the request is unusable", () => {
    const now = new Date("2026-08-12T09:00:00Z");
    expect(resolveViewDate(undefined, now)).toBe("2026-08-12");
    expect(resolveViewDate("12/08/2026", now)).toBe("2026-08-12");
    expect(resolveViewDate("2026-02-31", now)).toBe("2026-08-12");
  });

  it("uses the destination timezone rather than the server's", () => {
    // 23:30 UTC is already the next day in Europe/Paris.
    expect(destinationToday(new Date("2026-08-12T23:30:00Z"))).toBe("2026-08-13");
  });
});
