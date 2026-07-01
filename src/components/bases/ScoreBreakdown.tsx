import Link from "next/link";
import type { EvidenceRecord } from "@/lib/content/evidence";
import {
  getSourceBlockLinks,
  requireEvidenceRecords,
} from "@/lib/content/evidence-links";
import type { BaseRecord } from "@/lib/ranking/schema";
import {
  RANKING_DIMENSIONS,
  RANKING_DIMENSION_LABELS,
} from "@/lib/ranking/weights";
import styles from "./bases.module.css";

export function ScoreBreakdown({
  scores,
  evidenceById,
}: {
  scores: BaseRecord["scores"];
  evidenceById: Map<string, EvidenceRecord>;
}) {
  return (
    <dl className={styles.scoreBreakdown}>
      {RANKING_DIMENSIONS.map((dimension) => {
        const item = scores[dimension];
        const evidence = requireEvidenceRecords(
          evidenceById,
          item.evidenceRefs,
          `${RANKING_DIMENSION_LABELS[dimension]} score`
        );
        const sourceLinks = getSourceBlockLinks(evidence);

        return (
          <div className={styles.scoreItem} key={dimension}>
            <dt>
              {RANKING_DIMENSION_LABELS[dimension]}
              <span className={styles.scoreValue}>
                {item.score === null ? "Unknown" : `${item.score}/10`}
              </span>
            </dt>
            <dd>
              <span>{item.rationale}</span>
              {sourceLinks.length > 0 && (
                <span className={styles.evidenceLinks}>
                  Evidence:{" "}
                  {sourceLinks.map((link, index) => (
                      <span key={`${link.ref}-${index}`}>
                        {index > 0 && ", "}
                        <Link href={link.href}>{link.ref}</Link>
                      </span>
                    ))}
                </span>
              )}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
