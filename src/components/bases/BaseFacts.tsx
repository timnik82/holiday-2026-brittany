import { guideConfig } from "@/config/guide";
import type { EvidenceRecord } from "@/lib/content/evidence";
import type { BaseRecord } from "@/lib/ranking/schema";
import { ScoreBreakdown } from "./ScoreBreakdown";
import { CAR_NEED_LABELS, PRICE_BAND_LABELS } from "./labels";
import detailStyles from "./base-detail.module.css";
import sharedStyles from "./bases.module.css";

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
          <dd>{CAR_NEED_LABELS[base.carNeed]}</dd>
        </div>
        <div className={sharedStyles.scoreItem}>
          <dt>{guideConfig.seasonLabel} price band</dt>
          <dd>{PRICE_BAND_LABELS[base.priceBand]}</dd>
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
