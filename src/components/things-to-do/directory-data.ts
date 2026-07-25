import { loadContentPages } from "@/lib/content/registry";
import { RELATED_PLACES } from "@/components/bases/related-places-data";
import type { ThingsToDoFrontmatter } from "@/lib/content/schemas";
import { reachForStay, type ReachTag } from "@/lib/trip/reach";
import { ageLabel, categoryLabel } from "./labels";

/**
 * A Things to do entry flattened into the fields the directory needs. The
 * registry's `ContentPage` only carries generic fields, so the
 * things-to-do-specific `category`/`ageRange` and the base relationship are
 * joined here.
 */
export interface DirectoryPlace {
  slug: string;
  title: string;
  summary: string;
  category: string;
  ageRange: string | undefined;
  baseSlug: string | undefined;
  baseTitle: string | undefined;
  /** Undefined where the page states no weather fit; ranks neutral. */
  weatherFit: ThingsToDoFrontmatter["weatherFit"];
  /** Undefined where the page states no duration; ranks neutral. */
  durationHours: ThingsToDoFrontmatter["durationHours"];
  updatedAt: string;
  status: string;
}

export interface FilterOption {
  value: string;
  label: string;
}

/**
 * Invert `RELATED_PLACES` (base → places) into place → base. A place linked
 * from more than one base (e.g. crozon-pen-hir appears under both
 * `brest-finistere` and `crozon-douarnenez`) keeps the first base encountered,
 * which `RELATED_PLACES` orders as the primary one. Built once at module init.
 */
function buildPlaceToBaseMap(): Map<string, string> {
  const map = new Map<string, string>();
  for (const [baseSlug, places] of Object.entries(RELATED_PLACES)) {
    for (const place of places) {
      if (!map.has(place.slug)) {
        map.set(place.slug, baseSlug);
      }
    }
  }
  return map;
}

const PLACE_TO_BASE = buildPlaceToBaseMap();

/**
 * Build a baseSlug → baseTitle lookup from a single registry load, so the
 * directory never triggers a per-place content scan. `getBaseFrontmatter`
 * re-reads the registry on every call, which in development (cache disabled)
 * means a full disk scan per place.
 */
function buildBaseTitleMap(allPages: ReturnType<typeof loadContentPages>): Map<string, string> {
  const titles = new Map<string, string>();
  for (const entry of allPages) {
    if (entry.category === "bases") {
      titles.set(entry.page.slug, entry.page.title);
    }
  }
  return titles;
}

/**
 * Load every non-draft Things to do page, joined with its base relationship
 * (derived from `RELATED_PLACES`) and things-to-do-specific frontmatter. Base
 * titles are resolved from the same single registry load rather than per place.
 */
export function loadDirectoryPlaces(): DirectoryPlace[] {
  const allPages = loadContentPages();
  const baseTitles = buildBaseTitleMap(allPages);

  return allPages
    .filter((e) => e.category === "things-to-do" && e.page.status !== "draft")
    .map((entry) => {
      const frontmatter = entry.frontmatter as ThingsToDoFrontmatter;
      const baseSlug = PLACE_TO_BASE.get(entry.page.slug);

      return {
        slug: entry.page.slug,
        title: entry.page.title,
        summary: entry.page.summary,
        category: frontmatter.category,
        ageRange: frontmatter.ageRange,
        baseSlug,
        baseTitle: baseSlug ? baseTitles.get(baseSlug) : undefined,
        weatherFit: frontmatter.weatherFit,
        durationHours: frontmatter.durationHours,
        updatedAt: entry.page.updatedAt,
        status: entry.page.status,
      };
    });
}

/**
 * A directory place joined with how it is reached from a given stay. Built
 * only for the day selector — the directory listing itself does not need
 * reach, and an unread field on `DirectoryPlace` would invite callers to
 * trust data nothing exercises.
 */
export interface DayOptionPlace extends DirectoryPlace {
  reach: ReachTag;
}

/**
 * Places reachable from a stay, in reach-list order, joined to directory
 * records. Reach entries whose place is missing or still draft are dropped
 * (the content validator already guards against that in CI).
 */
export function loadDayOptionPlaces(stayId: string): DayOptionPlace[] {
  const reach = reachForStay(stayId);
  // Nantes / unknown stays have no curated reach — skip the directory scan.
  if (reach.length === 0) return [];

  const bySlug = new Map(loadDirectoryPlaces().map((place) => [place.slug, place]));
  const options: DayOptionPlace[] = [];
  for (const entry of reach) {
    const place = bySlug.get(entry.place);
    if (!place) continue;
    options.push({ ...place, reach: entry.reach });
  }
  return options;
}

/**
 * Derive the set of base filter options in the editorial order defined by
 * `RELATED_PLACES`, restricted to bases that actually have loaded places. This
 * keeps the dropdown deterministic regardless of content-file ordering.
 */
export function getBaseOptions(places: DirectoryPlace[]): FilterOption[] {
  const placeBaseSlugs = new Set(
    places.map((p) => p.baseSlug).filter((s): s is string => Boolean(s))
  );
  const baseTitles = new Map<string, string>();
  for (const place of places) {
    if (place.baseSlug && place.baseTitle && !baseTitles.has(place.baseSlug)) {
      baseTitles.set(place.baseSlug, place.baseTitle);
    }
  }
  return Object.keys(RELATED_PLACES)
    .filter((baseSlug) => placeBaseSlugs.has(baseSlug))
    .map((baseSlug) => ({
      value: baseSlug,
      label: baseTitles.get(baseSlug) ?? baseSlug,
    }));
}

/**
 * Derive the set of category filter options from the directory data, ordered
 * by frequency (most common first) so the most useful filters surface first.
 * Labels are human-readable via `categoryLabel`.
 */
export function getCategoryOptions(places: DirectoryPlace[]): FilterOption[] {
  const counts = new Map<string, number>();
  for (const place of places) {
    counts.set(place.category, (counts.get(place.category) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([value]) => ({ value, label: categoryLabel(value) }));
}

/** Canonical ascending age order for the Age dropdown. */
const AGE_ORDER = ["all", "4+", "5+", "6+"];

/**
 * Derive the set of age-range filter options in canonical ascending order
 * (`all` first, then ascending numeric thresholds) rather than content-discovery
 * order. Labels are human-readable via `ageLabel`. Unknown values sort after
 * the known ones, alphabetically. Places without an explicit `ageRange` are not
 * represented as a filter option but remain visible when no age filter is active.
 */
export function getAgeOptions(places: DirectoryPlace[]): FilterOption[] {
  const seen = new Set<string>();
  for (const place of places) {
    if (place.ageRange && !seen.has(place.ageRange)) {
      seen.add(place.ageRange);
    }
  }
  return [...seen]
    .sort((a, b) => {
      const idxA = AGE_ORDER.indexOf(a);
      const idxB = AGE_ORDER.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    })
    .map((value) => ({ value, label: ageLabel(value) }));
}
