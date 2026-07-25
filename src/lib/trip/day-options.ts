import type { ThingsToDoFrontmatter } from "@/lib/content/schemas";
import type { ReachTag } from "@/lib/trip/reach";

/** Manual weather toggle — no forecast API. */
export type DayWeather = "fair" | "rain";

/** Free hours today. Short window (2) demotes day trips. */
export type DayTimeHours = 2 | 4 | 8;

export const DAY_WEATHER_VALUES = ["fair", "rain"] as const satisfies readonly DayWeather[];
export const DAY_TIME_VALUES = [2, 4, 8] as const satisfies readonly DayTimeHours[];

/** Hours at or below this demote day trips — a spare afternoon is not a drive out. */
const SHORT_WINDOW_HOURS: DayTimeHours = 2;

const BASE_SCORE = 100;
const WEATHER_PENALTY = 40;
const DURATION_PENALTY = 30;
const DAY_TRIP_PENALTY = 25;

export interface DayOptionInput {
  slug: string;
  weatherFit: ThingsToDoFrontmatter["weatherFit"];
  durationHours: ThingsToDoFrontmatter["durationHours"];
  reach: ReachTag;
}

export interface DayOptionResult {
  slug: string;
  score: number;
  /** Demotion reasons, most specific first. Empty when the place ranks neutrally. */
  reasons: string[];
}

/**
 * Score one place against day conditions. Missing weather/duration fields stay
 * neutral — unmarked pages neither rise nor sink for those axes.
 */
export function scoreDayOption(
  input: DayOptionInput,
  weather: DayWeather,
  availableHours: DayTimeHours
): DayOptionResult {
  const reasons: string[] = [];
  let score = BASE_SCORE;

  if (weather === "rain" && input.weatherFit === "outdoor") {
    score -= WEATHER_PENALTY;
    reasons.push("outdoor — less suited to rain");
  }

  if (
    input.durationHours !== undefined &&
    input.durationHours.min > availableHours
  ) {
    score -= DURATION_PENALTY;
    reasons.push(`does not fit ${availableHours} hours`);
  }

  if (input.reach === "day-trip" && availableHours <= SHORT_WINDOW_HOURS) {
    score -= DAY_TRIP_PENALTY;
    reasons.push("day trip");
  }

  return { slug: input.slug, score, reasons };
}

/**
 * Rank every place in reach. Nothing is dropped — unsuitable options sink with
 * a stated reason so the list degrades gracefully while fields are still sparse.
 *
 * Equal scores keep the input order (curated nearby-first from the reach list)
 * so day conditions only reorder places when their scores actually differ.
 */
export function rankDayOptions(
  inputs: DayOptionInput[],
  weather: DayWeather,
  availableHours: DayTimeHours
): DayOptionResult[] {
  return inputs
    .map((input, index) => ({
      result: scoreDayOption(input, weather, availableHours),
      index,
    }))
    .sort((left, right) => {
      if (left.result.score !== right.result.score) {
        return right.result.score - left.result.score;
      }
      return left.index - right.index;
    })
    .map(({ result }) => result);
}

/** Parse `?weather=` — unknown values fall back to fair. */
export function resolveDayWeather(raw: string | undefined): DayWeather {
  if (raw && (DAY_WEATHER_VALUES as readonly string[]).includes(raw)) {
    return raw as DayWeather;
  }
  return "fair";
}

/** Parse `?time=` — unknown values fall back to a full day (8). */
export function resolveDayTime(raw: string | undefined): DayTimeHours {
  if (!raw) return 8;
  const parsed = Number(raw);
  if ((DAY_TIME_VALUES as readonly number[]).includes(parsed)) {
    return parsed as DayTimeHours;
  }
  return 8;
}
