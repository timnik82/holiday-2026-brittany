import { guideConfig } from "@/config/guide";

/**
 * Date formatting for trip dates.
 *
 * Trip dates are calendar dates, not instants, so every format runs in UTC —
 * rendering "9 August" as "8 August" for a reader west of Greenwich would be a
 * real bug on a page whose whole job is telling you which day it is.
 */
function asUtcDate(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

// Formatters are built once at module scope. Construction costs far more than
// formatting, and these three shapes are used on every trip-facing render.
const FULL_DATE = new Intl.DateTimeFormat(guideConfig.locale, {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

const DAY_WITH_MONTH = new Intl.DateTimeFormat(guideConfig.locale, {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

const DAY_ONLY = new Intl.DateTimeFormat(guideConfig.locale, {
  day: "numeric",
  timeZone: "UTC",
});

/** "Friday 14 August" — used where the day needs to be recognisable at a glance. */
export function formatFullDate(iso: string): string {
  return FULL_DATE.format(asUtcDate(iso));
}

/** "14" or "14 August", depending on whether the month still needs saying. */
export function formatDay(iso: string, withMonth: boolean): string {
  return (withMonth ? DAY_WITH_MONTH : DAY_ONLY).format(asUtcDate(iso));
}

/** "9 – 14 August", dropping the repeated month when both dates share one. */
export function formatDateRange(from: string, to: string): string {
  const sameMonth = from.slice(0, 7) === to.slice(0, 7);
  return `${formatDay(from, !sameMonth)} – ${formatDay(to, true)}`;
}
