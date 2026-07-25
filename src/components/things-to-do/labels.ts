/**
 * Display labels for the Things to do directory. The content schema leaves
 * `category` and `ageRange` as free-form strings (see
 * `thingsToDoFrontmatterSchema`), so the filter option lists are derived
 * dynamically from the loaded content in `directory-data.ts`. These maps only
 * provide human-readable text for the values currently in use; an unknown
 * value falls back to the raw string.
 */
export const CATEGORY_LABELS: Record<string, string> = {
  nature: "Nature",
  history: "History",
  museum: "Museum",
  food: "Food",
  family: "Family",
  culture: "Culture",
  beach: "Beach",
};

export const AGE_LABELS: Record<string, string> = {
  all: "All ages",
  "4+": "4+",
  "5+": "5+",
  "6+": "6+",
};

/**
 * Resolve a category value to its display label, falling back to the raw
 * value so free-form entries stay visible instead of disappearing.
 */
export function categoryLabel(value: string): string {
  return CATEGORY_LABELS[value] ?? value;
}

/**
 * Resolve an age-range value to its display label, falling back to the raw
 * value when unset or unknown.
 */
export function ageLabel(value: string | undefined): string {
  if (!value) return "—";
  return AGE_LABELS[value] ?? value;
}

/**
 * Weather fit, worded for a reader deciding what to do in the rain.
 *
 * `mixed` deliberately does not say "indoor": it means part of the place has a
 * roof, not that the whole visit is sheltered. Only two places in the corpus
 * are genuinely indoor, so overstating the middle value would send a family out
 * to a castle courtyard expecting a museum.
 */
export const WEATHER_FIT_LABELS: Record<string, string> = {
  indoor: "Indoor",
  mixed: "Some shelter",
  outdoor: "Outdoor",
};

export function weatherFitLabel(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return WEATHER_FIT_LABELS[value] ?? value;
}

/** "2–4 h", or a single figure when the range has no spread. */
export function durationLabel(
  value: { min: number; max: number } | undefined
): string | undefined {
  if (!value) return undefined;
  return value.min === value.max ? `${value.min} h` : `${value.min}–${value.max} h`;
}
