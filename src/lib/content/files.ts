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
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => path.join(dir, f));
}
