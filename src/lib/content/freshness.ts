/**
 * Freshness / staleness logic for time-sensitive facts.
 *
 * A fact is "fresh" while its `checkedAt` date is within the configured review
 * window (default 30 days, matching the promise in
 * `content/plan/about-this-guide.md`: "verify all published content within
 * thirty days of the travel date"). Once older than the window it renders
 * "Needs recheck" but never disappears — passing time alone never fails the
 * build (only a missing `checkedAt` does, enforced by the evidence schema).
 */

/** Default review window in days, matching the about-this-guide promise. */
export const DEFAULT_REVIEW_WINDOW_DAYS = 30;

/**
 * Midnight UTC of the given date, as a timestamp. Normalising to midnight makes
 * the day comparison stable regardless of the time of day this runs.
 */
function startOfDayUtc(date: Date): number {
  return Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  );
}

export interface FreshnessState {
  /** Whether the fact is still within its review window. */
  fresh: boolean;
  /** Days since `checkedAt` (0 if checked today). Negative if in the future. */
  ageDays: number;
}

/**
 * Strict calendar-date validation for a `YYYY-MM-DD` string. `new Date()` would
 * silently normalise impossible dates like `2026-02-31` to a real day, masking
 * malformed fact data. This rejects such inputs so they surface as stale
 * rather than getting an incorrect freshness status.
 */
function isValidCalendarDate(iso: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return false;
  const [, y, m, d] = match;
  const year = Number(y);
  const month = Number(m);
  const day = Number(d);
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  // Construct at UTC noon to dodge any DST edge, then confirm round-trip.
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/**
 * Compute the freshness state of a fact from its `checkedAt` ISO date string.
 *
 * @param checkedAt  ISO date (`YYYY-MM-DD`) the fact was last verified.
 * @param windowDays Review window in days (default 30). A fact exactly on the
 *                   boundary is still fresh.
 * @param now        Override "today" — used by tests. Defaults to `new Date()`.
 *
 * A missing/empty `checkedAt` is treated as stale (`fresh: false`,
 * `ageDays: NaN`) so callers render "Needs recheck"; note the evidence schema
 * separately requires `checkedAt` whenever `timeSensitive` is true, so this
 * path is a defensive guard rather than the normal case.
 */
export function getFreshness(
  checkedAt: string | undefined,
  windowDays: number = DEFAULT_REVIEW_WINDOW_DAYS,
  now: Date = new Date()
): FreshnessState {
  if (!checkedAt || !isValidCalendarDate(checkedAt)) {
    return { fresh: false, ageDays: Number.NaN };
  }

  const checked = startOfDayUtc(new Date(checkedAt));
  const today = startOfDayUtc(now);
  const ageDays = Math.round((today - checked) / (24 * 60 * 60 * 1000));
  return { fresh: ageDays <= windowDays, ageDays };
}
