import type { PageFrontmatter } from "./schemas";

export interface ParagraphRecord {
  /** Unique paragraph identifier from the metadata comment */
  id: string;
  /** The plain text content of the paragraph */
  text: string;
  /** SHA-256 hash of the normalized text */
  hash: string;
  /** Evidence reference keys extracted from the sources attribute */
  evidenceRefs: string[];
  /** Whether this paragraph is narratable (suitable for TTS) */
  narratable: boolean;
}

export interface ParsedContent {
  /** Markdown with paragraph metadata comments stripped */
  strippedMarkdown: string;
  /** Extracted paragraph records */
  paragraphs: ParagraphRecord[];
}

export interface ContentPage {
  slug: string;
  title: string;
  summary: string;
  updatedAt: string;
  status: PageFrontmatter["status"];
  content: string;
  paragraphs: ParagraphRecord[];
}
