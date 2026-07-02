import Link from "next/link";
import type { Metadata } from "next";
import { guideConfig } from "@/config/guide";
import {
  CoverageTable,
  type CoverageRow,
} from "@/components/sources/CoverageTable";
import styles from "@/components/sources/sources.module.css";
import type { CoverageOutcome, CoverageStatus } from "@/lib/content/coverage";
import {
  loadCoverage,
  loadEvidenceRegistry,
  loadSourceBlocks,
  loadSourceSlugs,
} from "@/lib/content/sources-data";

export const metadata: Metadata = {
  title: `Research coverage — ${guideConfig.shortTitle}`,
  description:
    "Coverage outcomes and English evidence for the original research documents.",
};

const COVERAGE_STATUSES: CoverageStatus[] = [
  "draft",
  "retained",
  "duplicate",
  "conflict",
];

function evidenceIds(outcome: CoverageOutcome): string[] {
  switch (outcome.status) {
    case "retained":
    case "conflict":
      return outcome.evidenceIds;
    case "duplicate":
      return [outcome.retainedEvidenceId];
    case "draft":
      return [];
  }
}

export default async function CoveragePage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string; outcome?: string }>;
}) {
  const params = await searchParams;
  const slugs = loadSourceSlugs();
  const source = slugs.includes(params.source ?? "") ? params.source : undefined;
  const outcome = COVERAGE_STATUSES.includes(params.outcome as CoverageStatus)
    ? (params.outcome as CoverageStatus)
    : undefined;
  const coverage = loadCoverage();
  const evidence = loadEvidenceRegistry();
  const evidenceById = new Map(evidence.map((record) => [record.id, record]));

  const rows: CoverageRow[] = (source ? [source] : slugs).flatMap((slug) =>
    loadSourceBlocks(slug).flatMap((block) => {
      const blockOutcome = coverage[block.id];
      if (!blockOutcome || (outcome && blockOutcome.status !== outcome)) return [];

      return [
        {
          blockId: block.id,
          slug,
          headingPath: block.headingPath,
          outcome: blockOutcome,
          evidence: evidenceIds(blockOutcome).flatMap((id) => {
            const record = evidenceById.get(id);
            return record ? [record] : [];
          }),
        },
      ];
    })
  );

  return (
    <div className={styles.coveragePage}>
      <div>
        <h1>Research coverage</h1>
        <p className={styles.sourcesIntro}>
          Each substantive source block has one outcome. Retained and conflicting
          claims show the concise English evidence used to build the guide.
        </p>
        <Link href="/sources">← Back to source documents</Link>
      </div>

      <form className={styles.coverageFilters} method="get">
        <label>
          Source
          <select name="source" defaultValue={source ?? ""}>
            <option value="">All sources</option>
            {slugs.map((slug) => (
              <option key={slug} value={slug}>
                {slug}
              </option>
            ))}
          </select>
        </label>
        <label>
          Outcome
          <select name="outcome" defaultValue={outcome ?? ""}>
            <option value="">All outcomes</option>
            {COVERAGE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <button className={styles.filterButton} type="submit">
          Apply filters
        </button>
      </form>

      <p className={styles.coverageSummary}>{rows.length} matching block(s)</p>
      <div className={styles.coverageTableWrap}>
        <CoverageTable rows={rows} />
      </div>
    </div>
  );
}
