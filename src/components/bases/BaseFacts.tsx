import type { EvidenceRecord } from "@/lib/content/evidence";
import type { BaseRecord } from "@/lib/ranking/schema";
import { ScoreBreakdown } from "./ScoreBreakdown";
import detailStyles from "./base-detail.module.css";
import sharedStyles from "./bases.module.css";

const CAR_LABELS: Record<BaseRecord["carNeed"], string> = {
  optional: "Optional",
  helpful: "Helpful",
  recommended: "Recommended",
  essential: "Essential",
};

const PRICE_LABELS: Record<BaseRecord["priceBand"], string> = {
  budget: "Better value",
  moderate: "Moderate",
  high: "High",
};

/**
 * Renders the seven-dimension score breakdown plus the practical trade-offs
 * (car need, August price band, compromises) for a single base page. The
 * per-dimension rationales and their evidence links are shared with the
 * comparison page via ScoreBreakdown so a family sees identical reasoning
 * in both places.
 */
export function BaseFacts({
  base,
  evidenceById,
}: {
  base: BaseRecord;
  evidenceById: Map<string, EvidenceRecord>;
}) {
  return (
    <section
      className={detailStyles.scoreSection}
      aria-labelledby="facts-heading"
    >
      <h2 id="facts-heading" className={detailStyles.sectionHeading}>
        Scores and trade-offs
      </h2>
      <ScoreBreakdown scores={base.scores} evidenceById={evidenceById} />
      <dl className={sharedStyles.practicalDetails}>
        <div className={sharedStyles.scoreItem}>
          <dt>Car need</dt>
          <dd>{CAR_LABELS[base.carNeed]}</dd>
        </div>
        <div className={sharedStyles.scoreItem}>
          <dt>August price band</dt>
          <dd>{PRICE_LABELS[base.priceBand]}</dd>
        </div>
      </dl>
      <div>
        <h3 className={detailStyles.subheading}>Main compromises</h3>
        <ul>
          {base.compromises.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
