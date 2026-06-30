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
  // bold (**, __) and italic (*, _) markers
  out = out.replace(/\*\*|__|\*|_/g, "");
  return out.trim();
}

/**
 * Convert heading text into a URL-safe anchor id. Shared between the rendered
 * article and the table of contents so anchor links always match.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
