import path from "node:path";
import { readContentFile, listContentFiles } from "./files";
import { pageFrontmatterSchema } from "./schemas";
import { parseContent } from "./parse";
import type { ContentPage } from "./types";
import type { ParsedContent } from "./types";

const CONTENT_ROOT = path.resolve(process.cwd(), "content");

export interface RegistryEntry {
  page: ContentPage;
  category: string;
}

/**
 * Load all content pages from the content directory.
 */
export function loadContentPages(): RegistryEntry[] {
  const entries: RegistryEntry[] = [];
  const categories = ["plan", "bases", "routes", "things-to-do", "practical"];

  for (const category of categories) {
    const dir = path.join(CONTENT_ROOT, category);
    const files = listContentFiles(dir);

    for (const filePath of files) {
      const { frontmatter, body } = readContentFile(filePath);

      const parsed = pageFrontmatterSchema.safeParse(frontmatter);
      if (!parsed.success) continue;

      const result = parseContent(body);
      if ("message" in result) continue;

      const content = result as ParsedContent;

      entries.push({
        category,
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
 * Find a specific content page by slug.
 */
export function getContentPage(slug: string): RegistryEntry | undefined {
  return loadContentPages().find((e) => e.page.slug === slug);
}
