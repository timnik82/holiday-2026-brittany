/**
 * The booked trip, resolved by date.
 *
 * The guide used to describe two candidate date windows because the trip was
 * still being chosen. It is now booked, so the question changed from "which
 * window and which base?" to "where are we today, and what can we do?". This
 * module answers the second question from `guideConfig.trip`.
 *
 * A stay owns the *nights* between its check-in and check-out, so a moving day
 * belongs to the stay we sleep in that evening, not the one we wake up in. The
 * final morning has no night at all and is reported as a departure day on the
 * stay being left.
 */

import { guideConfig, type Stay } from "@/config/guide";

export type { Stay };

export interface StaySummary {
  readonly stay: Stay;
  /** Nights actually slept, derived from the two dates. */
  readonly nights: number;
  readonly index: number;
}

export interface TripDay {
  /** The ISO date this describes. */
  readonly date: string;
  /** Whether the date falls inside the booked trip at all. */
  readonly onTrip: boolean;
  /** Where tonight is spent, or `null` on the departure day and off-trip. */
  readonly stay: Stay | null;
  /** The stay being checked out of today, if any. */
  readonly leaving: Stay | null;
  /** True when one stay ends and another begins on this date. */
  readonly moving: boolean;
  readonly arrival: boolean;
  readonly departure: boolean;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Midnight UTC for an ISO date. Using UTC throughout keeps day arithmetic free
 * of DST edges — these are calendar dates, not instants.
 */
function toUtcDay(iso: string): number {
  return Date.parse(`${iso}T00:00:00Z`);
}

/**
 * Strict calendar validation. `Date.parse` silently rolls impossible dates over
 * ("2026-02-31" becomes 3 March), so a round-trip check is required to reject
 * a hand-edited URL rather than quietly showing the wrong day.
 */
export function isIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return false;
  return parsed.toISOString().slice(0, 10) === value;
}

/** Whole days from one ISO date to another; negative when `to` is earlier. */
export function daysBetween(from: string, to: string): number {
  return Math.round((toUtcDay(to) - toUtcDay(from)) / MS_PER_DAY);
}

/** Nights slept in a stay: the gap between check-in and check-out. */
export function stayNights(stay: Stay): number {
  return daysBetween(stay.checkIn, stay.checkOut);
}

/** Every stay in travel order, with its night count and position. */
export function listStays(): StaySummary[] {
  return guideConfig.trip.stays.map((stay, index) => ({
    stay,
    nights: stayNights(stay),
    index,
  }));
}

/**
 * Today's date in the destination's timezone. Rendering happens on a UTC
 * server, so using the process date would flip the day at the wrong moment for
 * a traveller standing in France.
 */
export function destinationToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: guideConfig.timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/**
 * Resolve one calendar date against the booked trip.
 *
 * Off-trip dates return an empty day rather than throwing: the guide is read
 * before departure and after the return, and both are legitimate.
 */
export function getTripDay(date: string): TripDay {
  const empty: TripDay = {
    date,
    onTrip: false,
    stay: null,
    leaving: null,
    moving: false,
    arrival: false,
    departure: false,
  };

  if (!isIsoDate(date)) return empty;

  const day = toUtcDay(date);
  const { start, end, stays } = guideConfig.trip;
  if (day < toUtcDay(start) || day > toUtcDay(end)) return empty;

  const stay =
    stays.find(
      (candidate) =>
        day >= toUtcDay(candidate.checkIn) && day < toUtcDay(candidate.checkOut)
    ) ?? null;
  const leaving = stays.find((candidate) => toUtcDay(candidate.checkOut) === day) ?? null;

  return {
    date,
    onTrip: true,
    stay,
    leaving,
    moving: stay !== null && leaving !== null,
    arrival: day === toUtcDay(start),
    departure: day === toUtcDay(end),
  };
}

/**
 * The date the guide should present. An explicit `?date=` wins so the trip can
 * be previewed before departure and revisited afterwards; anything unparseable
 * falls back to the real date rather than erroring.
 */
export function resolveViewDate(requested: string | undefined, now: Date = new Date()): string {
  if (requested && isIsoDate(requested)) return requested;
  return destinationToday(now);
}
