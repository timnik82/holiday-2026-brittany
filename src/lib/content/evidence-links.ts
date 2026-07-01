import type { EvidenceRecord } from "./evidence";

export interface SourceBlockLink {
  ref: string;
  sourceSlug: string;
  href: string;
}

export function requireEvidenceRecords(
  evidenceById: Map<string, EvidenceRecord>,
  ids: readonly string[],
  context: string
): EvidenceRecord[] {
  return ids.map((id) => {
    const record = evidenceById.get(id);
    if (!record) {
      throw new Error(`${context} references missing evidence "${id}".`);
    }
    return record;
  });
}

export function getSourceBlockLinks(
  records: EvidenceRecord[]
): SourceBlockLink[] {
  return records.flatMap((record) =>
    record.sourceBlockRefs.map((ref) => {
      const separatorIndex = ref.indexOf(":");
      if (separatorIndex <= 0) {
        throw new Error(`${record.id} has an invalid source block reference "${ref}".`);
      }

      const sourceSlug = ref.slice(0, separatorIndex);
      return {
        ref,
        sourceSlug,
        href: `/sources/${sourceSlug}#block-${ref}`,
      };
    })
  );
}
