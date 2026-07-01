import Link from "next/link";
import { EvidenceCard } from "./EvidenceCard";
import type { CoverageOutcome } from "@/lib/content/coverage";
import type { EvidenceRecord } from "@/lib/content/evidence";
import styles from "./sources.module.css";

export interface CoverageRow {
  blockId: string;
  slug: string;
  headingPath: string[];
  outcome: CoverageOutcome;
  evidence: EvidenceRecord[];
}

const OUTCOME_LABELS: Record<CoverageOutcome["status"], string> = {
  draft: "Draft",
  retained: "Retained",
  duplicate: "Duplicate",
  conflict: "Conflict",
};

const BADGE_CLASSES: Record<CoverageOutcome["status"], string> = {
  draft: styles.badgeDraft,
  retained: styles.badgeRetained,
  duplicate: styles.badgeDuplicate,
  conflict: styles.badgeConflict,
};

/**
 * Renders a filterable table of source-block coverage. Each row links back to
 * the original-language block and shows the English evidence (for retained and
 * conflict outcomes), duplicate links, or the planned area (for draft).
 */
export function CoverageTable({ rows }: { rows: CoverageRow[] }) {
  if (rows.length === 0) {
    return <p className={styles.coverageTableEmpty}>No blocks match the current filters.</p>;
  }

  return (
    <table className={styles.coverageTable}>
      <thead>
        <tr>
          <th scope="col">Block</th>
          <th scope="col">Outcome</th>
          <th scope="col">English evidence</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.blockId} id={`block-${row.blockId}`}>
            <th scope="row" className={styles.coverageTableBlock}>
              <Link href={`/sources/${row.slug}#block-${row.blockId}`}>
                {row.blockId}
              </Link>
              {row.headingPath.length > 0 && (
                <span className={styles.coverageTableHeading}>
                  {row.headingPath[row.headingPath.length - 1]}
                </span>
              )}
            </th>
            <td>
              <span className={`${styles.coverageTableBadge} ${BADGE_CLASSES[row.outcome.status]}`}>
                {OUTCOME_LABELS[row.outcome.status]}
              </span>
            </td>
            <td>
              <CoverageCell row={row} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CoverageCell({ row }: { row: CoverageRow }) {
  const { outcome } = row;

  if (outcome.status === "draft") {
    return <span className={styles.coverageTableDraft}>{outcome.plannedArea}</span>;
  }

  if (outcome.status === "duplicate") {
    const target = row.evidence.find((e) => e.id === outcome.retainedEvidenceId);
    return (
      <span>
        Duplicate of{" "}
        {target ? (
          <a href={`#${outcome.retainedEvidenceId}`}>{outcome.retainedEvidenceId}</a>
        ) : (
          outcome.retainedEvidenceId
        )}
      </span>
    );
  }

  if (outcome.status === "retained") {
    return (
      <div className={styles.coverageTableRetained}>
        {row.evidence.map((e) => (
          <EvidenceCard key={e.id} evidence={e} />
        ))}
        <p className={styles.coverageTableParagraphs}>
          Guide paragraphs: {outcome.paragraphIds.join(", ")}
        </p>
      </div>
    );
  }

  // conflict
  return (
    <div className={styles.coverageTableConflict}>
      <p className={styles.coverageTableConflictLabel}>
        Conflict ({outcome.conflictId}) — {outcome.evidenceIds.length} claims
      </p>
      {row.evidence.map((e) => (
        <EvidenceCard key={e.id} evidence={e} />
      ))}
      {outcome.interpretation && (
        <p className={styles.coverageTableInterpretation}>
          <strong>Planning interpretation:</strong> {outcome.interpretation}
        </p>
      )}
      <p className={styles.coverageTableParagraphs}>
        Guide paragraphs: {outcome.paragraphIds.join(", ")}
      </p>
    </div>
  );
}
