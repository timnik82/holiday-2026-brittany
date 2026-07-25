import Link from "next/link";
import {
  loadDayOptionPlaces,
  type DayOptionPlace,
} from "@/components/things-to-do/directory-data";
import { durationLabel, weatherFitLabel } from "@/components/things-to-do/labels";
import {
  DAY_TIME_VALUES,
  DAY_WEATHER_VALUES,
  rankDayOptions,
  type DayTimeHours,
  type DayWeather,
} from "@/lib/trip/day-options";
import styles from "./home.module.css";

const WEATHER_LABELS: Record<DayWeather, string> = {
  fair: "Fair",
  rain: "Rain",
};

const TIME_LABELS: Record<DayTimeHours, string> = {
  2: "2 hours",
  4: "Half day",
  8: "Full day",
};

const REACH_LABELS = {
  nearby: "Nearby",
  "day-trip": "Day trip",
} as const;

function conditionHref(params: {
  date: string;
  weather: DayWeather;
  time: DayTimeHours;
}): string {
  const search = new URLSearchParams({
    date: params.date,
    weather: params.weather,
    time: String(params.time),
  });
  return `/?${search.toString()}`;
}

/**
 * Day conditions and the ranked options for today's stay.
 *
 * Weather and free time live in the URL so a chosen combination can be shared
 * or bookmarked. Every place in reach stays on the list; demotions carry a
 * reason instead of disappearing.
 */
export function TodayOptions({
  date,
  stayId,
  weather,
  time,
}: {
  date: string;
  stayId: string;
  weather: DayWeather;
  time: DayTimeHours;
}) {
  const places = loadDayOptionPlaces(stayId);
  if (places.length === 0) return null;

  const bySlug = new Map(places.map((place) => [place.slug, place]));
  const ranked = rankDayOptions(places, weather, time);

  return (
    <section className={styles.options} aria-labelledby="options-heading">
      <h2 id="options-heading" className={styles.sectionHeading}>
        Options for today
      </h2>
      <p className={styles.sectionIntro}>
        Everything reachable from this stay, ordered for the weather and the
        time you have. Unsuitable options sink with a reason — nothing is
        hidden.
      </p>

      <div className={styles.conditions}>
        <ConditionGroup label="Weather">
          {DAY_WEATHER_VALUES.map((value) => (
            <ConditionLink
              key={value}
              href={conditionHref({ date, weather: value, time })}
              active={weather === value}
            >
              {WEATHER_LABELS[value]}
            </ConditionLink>
          ))}
        </ConditionGroup>
        <ConditionGroup label="Time free">
          {DAY_TIME_VALUES.map((value) => (
            <ConditionLink
              key={value}
              href={conditionHref({ date, weather, time: value })}
              active={time === value}
            >
              {TIME_LABELS[value]}
            </ConditionLink>
          ))}
        </ConditionGroup>
      </div>

      <ol className={styles.optionList}>
        {ranked.map((result) => {
          const place = bySlug.get(result.slug);
          if (!place) return null;
          return (
            <OptionRow
              key={result.slug}
              place={place}
              reason={result.reasons[0]}
            />
          );
        })}
      </ol>
    </section>
  );
}

function ConditionGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.conditionGroup}>
      <span className={styles.conditionLabel}>{label}</span>
      <p className={styles.conditionLinks}>{children}</p>
    </div>
  );
}

function ConditionLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={active ? styles.conditionActive : styles.conditionLink}
      aria-current={active ? "true" : undefined}
    >
      {children}
    </Link>
  );
}

function OptionRow({
  place,
  reason,
}: {
  place: DayOptionPlace;
  reason: string | undefined;
}) {
  const duration = durationLabel(place.durationHours);
  const weather = weatherFitLabel(place.weatherFit);

  return (
    <li className={styles.optionRow}>
      <h3 className={styles.optionTitle}>
        <Link href={`/things-to-do/${place.slug}`}>{place.title}</Link>
      </h3>
      <p className={styles.chips}>
        <span className={styles.chip}>{REACH_LABELS[place.reach]}</span>
        {duration && <span className={styles.chip}>{duration}</span>}
        {weather && <span className={styles.chip}>{weather}</span>}
      </p>
      {reason && <p className={styles.optionReason}>{reason}</p>}
    </li>
  );
}
