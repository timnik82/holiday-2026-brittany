import Link from "next/link";
import type { EvidenceRecord } from "@/lib/content/evidence";
import styles from "./sources.module.css";

interface EvidenceCardProps {
  evidence: EvidenceRecord;
}

const KIND_LABELS: Record<EvidenceRecord["kind"], string> = {
  fact: "Fact",
  recommendation: "Recommendation",
  price: "Price",
  warning: "Warning",
  qualification: "Qualification",
};

/**
 * Displays a single English evidence record with its kind, text, qualifiers,
 * source-block links, and check date. Designed for server rendering — no
 * client-side state.
 */
export function EvidenceCard({ evidence }: EvidenceCardProps) {
  return (
    <article className={styles.evidenceCard} id={evidence.id}>
      <header className={styles.evidenceCardHeader}>
        <span className={`${styles.evidenceCardKind} ${styles[`kind${evidence.kind.charAt(0).toUpperCase()}${evidence.kind.slice(1)}`] ?? ""}`}>
          {KIND_LABELS[evidence.kind]}
        </span>
        {evidence.checkedAt && (
          <span className={styles.evidenceCardChecked}>
            Checked {evidence.checkedAt}
          </span>
        )}
      </header>

      <p className={styles.evidenceCardText}>{evidence.text}</p>

      {evidence.qualifiers.length > 0 && (
        <ul className={styles.evidenceCardQualifiers}>
          {evidence.qualifiers.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      )}

      {evidence.sourceBlockRefs.length > 0 && (
        <footer className={styles.evidenceCardSources}>
          <span>Source blocks: </span>
          {evidence.sourceBlockRefs.map((ref) => {
            const slug = ref.split(":")[0];
            return (
              <Link
                key={ref}
                href={`/sources/${slug}#block-${ref}`}
                className={styles.evidenceCardSourceLink}
              >
                {ref}
              </Link>
            );
          })}
        </footer>
      )}

      {evidence.sourceUrls.length > 0 && (
        <ul className={styles.evidenceCardUrls}>
          {evidence.sourceUrls.map((url) => (
            <li key={url}>
              <a href={url} rel="noopener noreferrer" target="_blank">
                {url}
              </a>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
