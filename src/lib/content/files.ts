import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export interface RawContentFile {
  filePath: string;
  frontmatter: Record<string, unknown>;
  body: string;
}

/**
 * Read a markdown content file and split frontmatter from body.
 */
export function readContentFile(filePath: string): RawContentFile {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return { filePath, frontmatter: data, body: content };
}

/**
 * List all markdown files in a directory (non-recursive).
 */
export function listContentFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => path.join(dir, entry.name));
}
