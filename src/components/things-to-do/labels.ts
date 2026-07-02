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
