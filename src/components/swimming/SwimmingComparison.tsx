import Link from "next/link";
import { FreshnessLabel } from "@/components/content/FreshnessLabel";
import { getSourceBlockLinks } from "@/lib/content/evidence-links";
import type { BathingSuitabilityResult } from "@/lib/ranking/bathing";
import type { BathingLocation } from "@/lib/ranking/bathing-schema";
import {
  BATHING_DIMENSIONS,
  BATHING_DIMENSION_LABELS,
} from "@/lib/ranking/bathing-dimensions";
import type { EvidenceRecord } from "@/lib/content/evidence";
import { loadEvidenceRegistry } from "@/lib/content/sources-data";
import styles from "./swimming.module.css";

export interface SwimmingRow {
  location: BathingLocation;
  result: BathingSuitabilityResult;
}

export interface SwimmingComparisonProps {
  rows: SwimmingRow[];
  /** base slug → display name, resolved by the page/data layer. */
  baseNames: ReadonlyMap<string, string>;
}

const TYPE_LABELS: Record<BathingLocation["type"], string> = {
  sea: "Sea beach",
  lake: "Lake",
  "tidal-pool": "Tidal pool",
  pool: "Pool",
};

const WARNING_LABELS: Record<BathingLocation["warningStatus"], string> = {
  none: "No active warning",
  advisory: "Advisory in force",
  closure: "Closed",
  unknown: "Status unknown",
};

/**
 * Stacked-card comparison of bathing locations. Renders a server-side snapshot of
 * every spot with its total (or an explicit "insufficient data" notice), a
 * confidence bar, the six-dimension breakdown, the official water-quality status
 * and a freshness label. Loads the evidence registry once to resolve any
 * corpus-backed dimension rationales to their source.
 */
export function SwimmingComparison({ rows, baseNames }: SwimmingComparisonProps) {
  const evidence = loadEvidenceRegistry();
  const evidenceById = new Map(evidence.map((r) => [r.id, r]));

  return (
    <section aria-label="Bathing-suitability comparison">
      <ol className={styles.cards}>
        {rows.map(({ location, result }) => (
          <li className={styles.card} key={location.slug}>
            <header className={styles.cardHeader}>
              <div>
                <h2>{location.name}</h2>
                <p className={styles.typeRow}>
                  <span className={styles.typeBadge}>
                    {TYPE_LABELS[location.type]}
                  </span>
                  <span
                    className={`${styles.warningBadge} ${
                      styles[`warning_${location.warningStatus}`]
                    }`}
                  >
                    {WARNING_LABELS[location.warningStatus]}
                  </span>
                </p>
              </div>
              <div className={styles.totalBox}>
                {result.total === null ? (
                  <span className={styles.totalUnknown}>
                    Insufficient official water-quality data
                  </span>
                ) : (
                  <>
                    <span className={styles.totalNumber}>
                      {result.total.toFixed(2)}
                    </span>
                    <span className={styles.totalScale}>/ 10</span>
                  </>
                )}
              </div>
            </header>

            {result.waterQualityWarning && (
              <p className={styles.warningCallout} role="status">
                <span aria-hidden="true">⚠</span> No total shown — official
                water-quality data missing.
              </p>
            )}

            <p className={styles.confidenceRow}>
              <span>Confidence</span>
              <span
                className={styles.confidenceBar}
                role="meter"
                aria-valuenow={Math.round(result.confidence * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${Math.round(result.confidence * 100)} percent of dimensions scored`}
              >
                <span
                  className={styles.confidenceFill}
                  style={{ width: `${Math.round(result.confidence * 100)}%` }}
                />
              </span>
              <span className={styles.confidenceValue}>
                {Math.round(result.confidence * 100)}%
              </span>
            </p>

            <dl className={styles.dimensionList}>
              {BATHING_DIMENSIONS.map((dimension) => {
                const item = location.scores[dimension];
                const refs = item.evidenceRefs ?? [];
                const records = refs
                  .map((id) => evidenceById.get(id))
                  .filter((r): r is EvidenceRecord => Boolean(r));
                const sourceLinks = getSourceBlockLinks(records);

                return (
                  <div className={styles.dimension} key={dimension}>
                    <dt>
                      {BATHING_DIMENSION_LABELS[dimension]}
                      <span className={styles.dimensionScore}>
                        {item.score === null ? "—" : `${item.score}/10`}
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

            <footer className={styles.cardFooter}>
              <p className={styles.source}>
                <span className={styles.sourceLabel}>Official source:</span>{" "}
                <a href={location.sourceUrl}>{location.officialSource}</a>
                <span className={styles.freshness}>
                  <FreshnessLabel
                    checkedAt={location.checkedAt}
                    reviewWindowDays={location.reviewWindowDays}
                  />
                </span>
              </p>
              {location.notes && (
                <p className={styles.notes}>{location.notes}</p>
              )}
              {location.linkedBases.length > 0 && (
                <p className={styles.linkedBases}>
                  Linked base
                  {location.linkedBases.length > 1 ? "s" : ""}:{" "}
                  {location.linkedBases.map((slug, index) => (
                    <span key={slug}>
                      {index > 0 && ", "}
                      <Link href={`/bases/${slug}`}>
                        {baseNames.get(slug) ?? slug}
                      </Link>
                    </span>
                  ))}
                </p>
              )}
            </footer>
          </li>
        ))}
      </ol>
    </section>
  );
}
