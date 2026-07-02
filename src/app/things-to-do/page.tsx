import type { Metadata } from "next";
import { guideConfig } from "@/config/guide";
import {
  loadDirectoryPlaces,
  getBaseOptions,
  getCategoryOptions,
  getAgeOptions,
  type DirectoryPlace,
  type FilterOption,
} from "@/components/things-to-do/directory-data";
import { PlaceCard } from "@/components/things-to-do/PlaceCard";
import styles from "@/components/things-to-do/directory.module.css";

export function generateMetadata(): Metadata {
  const placeCount = loadDirectoryPlaces().length;
  return {
    title: `Things to do — ${guideConfig.shortTitle}`,
    description: `Browse ${placeCount} reviewed ${guideConfig.regionName} activities for this family's ${guideConfig.seasonLabel} trip.`,
  };
}

interface DirectoryFilters {
  base?: string;
  category?: string;
  age?: string;
}

/**
 * Validate a raw search-param value against the known filter options. Returns
 * the value when valid, otherwise `undefined` and pushes a correction note so
 * the page can tell the reader the filter was ignored rather than silently
 * dropping it into an empty result.
 */
function validateFilter(
  raw: string | undefined,
  options: FilterOption[],
  label: string,
  labelPlural: string,
  corrections: string[]
): string | undefined {
  if (!raw) return undefined;
  if (options.some((o) => o.value === raw)) return raw;
  corrections.push(`Unknown ${label} "${raw}" — showing all ${labelPlural}.`);
  return undefined;
}

function filterPlaces(
  places: DirectoryPlace[],
  filters: DirectoryFilters
): DirectoryPlace[] {
  return places.filter((place) => {
    if (filters.base && place.baseSlug !== filters.base) return false;
    if (filters.category && place.category !== filters.category) return false;
    if (filters.age && place.ageRange !== filters.age) return false;
    return true;
  });
}

export default async function ThingsToDoDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<DirectoryFilters>;
}) {
  const params = await searchParams;
  const places = loadDirectoryPlaces();

  const baseOptions = getBaseOptions(places);
  const categoryOptions = getCategoryOptions(places);
  const ageOptions = getAgeOptions(places);

  const corrections: string[] = [];
  const base = validateFilter(params.base, baseOptions, "base", "bases", corrections);
  const category = validateFilter(
    params.category,
    categoryOptions,
    "category",
    "categories",
    corrections
  );
  const age = validateFilter(params.age, ageOptions, "age", "ages", corrections);

  const filters: DirectoryFilters = { base, category, age };
  const filtered = filterPlaces(places, filters);

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Browse · {guideConfig.seasonLabel}</p>
        <h1>Things to do</h1>
        <p className={styles.heroIntro}>
          Every reviewed activity links back to its canonical page — no
          duplicated descriptions. Filter by base, category, or age range to
          narrow the list.
        </p>
      </header>

      <form className={styles.filters} method="get">
        <label>
          Base
          <select name="base" defaultValue={base ?? ""}>
            <option value="">All bases</option>
            {baseOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Category
          <select name="category" defaultValue={category ?? ""}>
            <option value="">All categories</option>
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Age
          <select name="age" defaultValue={age ?? ""}>
            <option value="">All ages</option>
            {ageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <button className={styles.filterButton} type="submit">
          Apply filters
        </button>
      </form>

      {corrections.length > 0 && (
        <ul className={styles.correction} role="status">
          {corrections.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      )}

      <p className={styles.summary}>
        {filtered.length} of {places.length} activit{filtered.length === 1 ? "y" : "ies"}
      </p>

      {filtered.length > 0 ? (
        <ol className={styles.places}>
          {filtered.map((place) => (
            <PlaceCard key={place.slug} place={place} />
          ))}
        </ol>
      ) : (
        <p className={styles.emptyState}>
          No activities match these filters. Try clearing one of the filters
          above.
        </p>
      )}
    </div>
  );
}
