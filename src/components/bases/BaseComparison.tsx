import type { EvidenceRecord } from "@/lib/content/evidence";
import { guideConfig } from "@/config/guide";
import { rankBases } from "@/lib/ranking/calculate";
import type { BaseRecord } from "@/lib/ranking/schema";
import { RANKING_DIMENSIONS } from "@/lib/ranking/weights";
import { ScoreBreakdown } from "./ScoreBreakdown";
import { CAR_NEED_LABELS, PRICE_BAND_LABELS } from "./labels";
import styles from "./bases.module.css";

export function BaseComparison({
  bases,
  evidence,
}: {
  bases: BaseRecord[];
  evidence: EvidenceRecord[];
}) {
  const evidenceById = new Map(evidence.map((record) => [record.id, record]));
  const ranked = rankBases(
    bases.map((base) => ({
      slug: base.slug,
      scores: Object.fromEntries(
        RANKING_DIMENSIONS.map((dimension) => [
          dimension,
          base.scores[dimension].score,
        ])
      ) as Record<(typeof RANKING_DIMENSIONS)[number], number | null>,
    }))
  );
  const baseBySlug = new Map(bases.map((base) => [base.slug, base]));
  const rows = ranked.map((result, index) => ({
    result,
    rank: index + 1,
    base: baseBySlug.get(result.slug)!,
  }));

  return (
    <>
      <ol className={styles.mobileCards}>
        {rows.map(({ base, rank, result }) => (
          <li className={styles.baseCard} key={base.slug}>
            <header className={styles.cardHeader}>
              <span className={styles.rank}>#{rank}</span>
              <div>
                <h2>{base.name}</h2>
                <p className={styles.totalScore}>
                  {formatTotal(result.total)} · {formatConfidence(result.confidence)} confidence
                </p>
              </div>
            </header>
            <p>{base.summary}</p>
            <p className={styles.bestFor}><strong>Best for:</strong> {base.bestFor}</p>
            <ScoreBreakdown scores={base.scores} evidenceById={evidenceById} />
            <PracticalDetails base={base} />
          </li>
        ))}
      </ol>

      <div className={styles.desktopComparison}>
        <table className={styles.comparisonTable}>
          <caption>Six bases ranked for this family's stated priorities</caption>
          <thead>
            <tr>
              <th scope="col">Base</th>
              <th scope="col">Weighted fit</th>
              <th scope="col">Why it fits</th>
              <th scope="col">Seven scores</th>
              <th scope="col">Practical trade-offs</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ base, rank, result }) => (
              <tr key={base.slug}>
                <th scope="row">
                  <span className={styles.tableRank}>#{rank}</span>
                  {base.name}
                </th>
                <td>
                  <strong className={styles.tableTotal}>{formatTotal(result.total)}</strong>
                  <span>{formatConfidence(result.confidence)} confidence</span>
                </td>
                <td>
                  <strong>{base.bestFor}</strong>
                  <span>{base.summary}</span>
                </td>
                <td>
                  <ScoreBreakdown scores={base.scores} evidenceById={evidenceById} />
                </td>
                <td><PracticalDetails base={base} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function PracticalDetails({ base }: { base: BaseRecord }) {
  return (
    <div className={styles.practicalDetails}>
      <p><strong>Car:</strong> {CAR_NEED_LABELS[base.carNeed]}</p>
      <p>
        <strong>{guideConfig.seasonLabel} price:</strong>{" "}
        {PRICE_BAND_LABELS[base.priceBand]}
      </p>
      <div>
        <strong>Compromises:</strong>
        <ul>
          {base.compromises.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </div>
    </div>
  );
}

function formatTotal(total: number | null): string {
  return total === null ? "Unknown" : `${total.toFixed(2)}/10`;
}

function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}
