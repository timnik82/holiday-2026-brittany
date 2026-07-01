/**
 * Strip inline markdown formatting (bold, italic, code, links, images) from a
 * raw markdown string, leaving only the plain text. Used so that headings which
 * contain formatting produce clean display text and stable anchor ids.
 */
export function stripInlineMarkdown(text: string): string {
  let out = text;
  // images: ![alt](url) -> alt
  out = out.replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1");
  // links: [text](url) -> text
  out = out.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
  // inline code: `code` -> code
  out = out.replace(/`([^`]+)`/g, "$1");
  // bold (**, __) markers used as emphasis wrappers
  out = out.replace(/\*\*([^*]+)\*\*/g, "$1");
  out = out.replace(/__([^_]+)__/g, "$1");
  // italic (*, _) markers, only when used as word-boundary wrappers so that
  // underscores inside identifiers/words (e.g. `some_word`) are preserved
  out = out.replace(
    /(?:^|\s)\*([^*]+)\*(?=\s|$)/g,
    (match, p1) => (match.startsWith(" ") ? " " + p1 : p1)
  );
  out = out.replace(
    /(?:^|\s)_([^_]+)_(?=\s|$)/g,
    (match, p1) => (match.startsWith(" ") ? " " + p1 : p1)
  );
  return out.trim();
}

/**
 * Convert heading text into a URL-safe anchor id. Shared between the rendered
 * article and the table of contents so anchor links always match. Unicode
 * text is normalized (NFKD) and combining diacritics are stripped so accented
 * Latin characters (e.g. "é" -> "e") produce stable ASCII ids, while other
 * Unicode letters/numbers (e.g. CJK) are preserved rather than dropped so
 * non-Latin headings don't collapse to an empty or "#" anchor.
 */
export function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Creates a function that slugifies heading text and de-duplicates the
 * result against previously seen slugs (appending `-2`, `-3`, etc.) so that
 * repeated headings don't collide on the same anchor id. A single instance
 * must be shared across all headings of a document (in document order) so
 * that the rendered article and its table of contents agree on the same ids.
 */
export function createSlugger(): (text: string) => string {
  const counts = new Map<string, number>();
  return (text: string) => {
    const base = slugify(text) || "section";
    const seen = counts.get(base) ?? 0;
    counts.set(base, seen + 1);
    return seen === 0 ? base : `${base}-${seen + 1}`;
  };
}
