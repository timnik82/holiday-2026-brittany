import Link from "next/link";
import type { EvidenceRecord } from "@/lib/content/evidence";
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
        const evidence = item.evidenceRefs.flatMap((id) => {
          const record = evidenceById.get(id);
          return record ? [record] : [];
        });

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
              {evidence.length > 0 && (
                <span className={styles.evidenceLinks}>
                  Evidence:{" "}
                  {evidence.map((record, index) => {
                    const ref = record.sourceBlockRefs[0];
                    const sourceSlug = ref.split(":")[0];
                    return (
                      <span key={record.id}>
                        {index > 0 && ", "}
                        <Link href={`/sources/${sourceSlug}#block-${ref}`}>
                          {record.id.replace("evidence:ranking-", "")}
                        </Link>
                      </span>
                    );
                  })}
                </span>
              )}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
