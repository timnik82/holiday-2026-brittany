import "server-only";

import type { ParagraphRecord } from "./types";

/**
 * Server-only paragraph manifest.
 * This module must not be imported by any client component.
 */
const paragraphManifest = new Map<string, ParagraphRecord[]>();

export function setParagraphs(slug: string, records: ParagraphRecord[]): void {
  paragraphManifest.set(slug, records);
}

export function getParagraphs(slug: string): ParagraphRecord[] {
  return paragraphManifest.get(slug) ?? [];
}

export function getAllParagraphs(): Map<string, ParagraphRecord[]> {
  return paragraphManifest;
}
