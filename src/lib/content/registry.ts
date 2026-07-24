import path from "node:path";
import { readContentFile, listContentFiles } from "./files";
import {
  pageFrontmatterSchema,
  SCHEMA_BY_CATEGORY,
  baseFrontmatterSchema,
  stayFrontmatterSchema,
  CONTENT_CATEGORIES,
} from "./schemas";
import type { BaseFrontmatter, PageFrontmatter, StayFrontmatter } from "./schemas";
import { parseContent } from "./parse";
import type { ContentPage } from "./types";

const CONTENT_ROOT = path.resolve(process.cwd(), "content");
const CATEGORIES = CONTENT_CATEGORIES;

export interface RegistryEntry {
  page: ContentPage;
  category: string;
  frontmatter: PageFrontmatter;
}

let cachedEntries: RegistryEntry[] | null = null;

/**
 * Load all content pages from the content directory. Validates each file's
 * frontmatter against its category-specific schema (matching the CLI
 * validator) and skips files that fail validation or parsing, logging a
 * warning so missing pages are noticed instead of silently disappearing.
 *
 * Results are cached in production to avoid re-reading and re-parsing every
 * content file on each call (this is invoked by both `getContentPage` and
 * `getStaticContentParams`). Development builds always re-read from disk so
 * content edits are picked up without a restart.
 */
export function loadContentPages(): RegistryEntry[] {
  if (cachedEntries && process.env.NODE_ENV === "production") {
    return cachedEntries;
  }

  const entries: RegistryEntry[] = [];

  for (const category of CATEGORIES) {
    const dir = path.join(CONTENT_ROOT, category);
    const files = listContentFiles(dir);

    for (const filePath of files) {
      const { frontmatter, body } = readContentFile(filePath);

      const schema = SCHEMA_BY_CATEGORY[category] ?? pageFrontmatterSchema;
      const parsed = schema.safeParse(frontmatter);
      if (!parsed.success) {
        console.warn(`Warning: Failed to parse frontmatter for ${filePath}. Skipping.`);
        continue;
      }

      const content = parseContent(body);

      entries.push({
        category,
        frontmatter: parsed.data,
        page: {
          slug: parsed.data.slug,
          title: parsed.data.title,
          summary: parsed.data.summary,
          updatedAt: parsed.data.updatedAt,
          status: parsed.data.status,
          content: content.strippedMarkdown,
          paragraphs: content.paragraphs,
        },
      });
    }
  }

  cachedEntries = entries;
  return entries;
}

/**
 * Get static route params for all content pages.
 */
export function getStaticContentParams(): { slug: string; category: string }[] {
  return loadContentPages().map((e) => ({
    slug: e.page.slug,
    category: e.category,
  }));
}

/**
 * Find a specific content page by slug. If `category` is provided, the
 * lookup is scoped to that category so that two categories sharing the same
 * slug can't return the wrong page; otherwise the first matching slug across
 * all categories is returned.
 */
export function getContentPage(
  slug: string,
  category?: string
): RegistryEntry | undefined {
  return loadContentPages().find(
    (e) => e.page.slug === slug && (category == null || e.category === category)
  );
}

/**
 * Read the full, category-specific frontmatter for a base page (including
 * `region` and `coordinates`) by slug. The registry's `ContentPage` only
 * carries the generic fields shared by every category, so base-specific
 * fields are re-read and re-validated here against `baseFrontmatterSchema`.
 * Returns undefined if the base page does not exist or fails validation.
 */
export function getBaseFrontmatter(slug: string): BaseFrontmatter | undefined {
  const entry = getContentPage(slug, "bases");
  if (!entry) return undefined;

  const parsed = baseFrontmatterSchema.safeParse(entry.frontmatter);
  return parsed.success ? parsed.data : undefined;
}

/**
 * The stay ids that have a reviewed page under `content/trip/`.
 *
 * Booked stays and written-up stays are not the same set: a stay exists as soon
 * as it is booked, but its page arrives when its research does. Callers use
 * this to link only where a page will actually resolve.
 */
export function getWrittenStayIds(): Set<string> {
  const ids = new Set<string>();
  for (const entry of loadContentPages()) {
    if (entry.category !== "trip" || entry.page.status === "draft") continue;
    const parsed = stayFrontmatterSchema.safeParse(entry.frontmatter);
    if (parsed.success) ids.add(parsed.data.stayId);
  }
  return ids;
}

/**
 * Read the full, stay-specific frontmatter (`stayId` and `carRequirement`) for
 * a trip stay page by slug. Mirrors getBaseFrontmatter: the registry's
 * ContentPage only carries generic fields, so the stay-specific fields are
 * re-validated here against stayFrontmatterSchema. Returns undefined if the
 * stay page does not exist or fails validation.
 */
export function getStayFrontmatter(slug: string): StayFrontmatter | undefined {
  const entry = getContentPage(slug, "trip");
  if (!entry) return undefined;

  const parsed = stayFrontmatterSchema.safeParse(entry.frontmatter);
  return parsed.success ? parsed.data : undefined;
}
