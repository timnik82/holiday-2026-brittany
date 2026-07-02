import { loadContentPages, getBaseFrontmatter } from "@/lib/content/registry";
import { RELATED_PLACES } from "@/components/bases/related-places-data";
import type { ThingsToDoFrontmatter } from "@/lib/content/schemas";

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
 * Load every non-draft Things to do page, joined with its base relationship
 * (derived from `RELATED_PLACES`) and things-to-do-specific frontmatter.
 */
export function loadDirectoryPlaces(): DirectoryPlace[] {
  const entries = loadContentPages().filter(
    (e) => e.category === "things-to-do" && e.page.status !== "draft"
  );

  return entries.map((entry) => {
    const frontmatter = entry.frontmatter as ThingsToDoFrontmatter;
    const baseSlug = PLACE_TO_BASE.get(entry.page.slug);
    const baseFrontmatter = baseSlug
      ? getBaseFrontmatter(baseSlug)
      : undefined;

    return {
      slug: entry.page.slug,
      title: entry.page.title,
      summary: entry.page.summary,
      category: frontmatter.category,
      ageRange: frontmatter.ageRange,
      baseSlug,
      baseTitle: baseFrontmatter?.title,
      updatedAt: entry.page.updatedAt,
      status: entry.page.status,
    };
  });
}

/**
 * Derive the set of base filter options from the directory data, preserving
 * the insertion order of bases as they appear in `RELATED_PLACES` (which
 * groups places by base region).
 */
export function getBaseOptions(places: DirectoryPlace[]): FilterOption[] {
  const seen = new Map<string, string>();
  for (const place of places) {
    if (place.baseSlug && place.baseTitle && !seen.has(place.baseSlug)) {
      seen.set(place.baseSlug, place.baseTitle);
    }
  }
  return [...seen.entries()].map(([value, label]) => ({ value, label }));
}

/**
 * Derive the set of category filter options from the directory data, ordered
 * by frequency (most common first) so the most useful filters surface first.
 */
export function getCategoryOptions(places: DirectoryPlace[]): FilterOption[] {
  const counts = new Map<string, number>();
  for (const place of places) {
    counts.set(place.category, (counts.get(place.category) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([value]) => ({ value, label: value }));
}

/**
 * Derive the set of age-range filter options from the directory data. Places
 * without an explicit `ageRange` are not represented as a filter option but
 * remain visible when no age filter is active.
 */
export function getAgeOptions(places: DirectoryPlace[]): FilterOption[] {
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const place of places) {
    if (place.ageRange && !seen.has(place.ageRange)) {
      seen.add(place.ageRange);
      ordered.push(place.ageRange);
    }
  }
  return ordered.map((value) => ({ value, label: value }));
}
