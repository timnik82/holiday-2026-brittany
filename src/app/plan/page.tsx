import Link from "next/link";
import type { Metadata } from "next";
import { guideConfig } from "@/config/guide";
import { loadContentPages } from "@/lib/content/registry";
import styles from "@/components/plan/plan.module.css";
import type { PracticalFrontmatter } from "@/lib/content/schemas";

export function generateMetadata(): Metadata {
  return {
    title: `Plan your trip — ${guideConfig.shortTitle}`,
    description: `Shared logistics decisions for a ${guideConfig.regionName} family trip in ${guideConfig.seasonLabel}: getting there, getting around, weather, accommodation, and food.`,
  };
}

interface PlanSummary {
  slug: string;
  title: string;
  summary: string;
  section: string;
}

/**
 * Load reviewed plan guides (status !== "draft"). The about-this-guide page
 * stays in draft and is intentionally excluded from the public index.
 */
function loadPlanSummaries(): PlanSummary[] {
  const guides: PlanSummary[] = [];
  for (const entry of loadContentPages()) {
    if (entry.category !== "plan" || entry.page.status === "draft") continue;
    const fm = entry.frontmatter as PracticalFrontmatter;
    guides.push({
      slug: entry.page.slug,
      title: entry.page.title,
      summary: entry.page.summary,
      section: fm.section,
    });
  }
  // Stable, editorial order regardless of filesystem ordering.
  const ORDER: Record<string, number> = {
    "getting-there": 0,
    "getting-around": 1,
    weather: 2,
    "accommodation-budget": 3,
    food: 4,
  };
  guides.sort((a, b) => (ORDER[a.section] ?? 99) - (ORDER[b.section] ?? 99));
  return guides;
}

export default function PlanPage() {
  const guides = loadPlanSummaries();

  return (
    <div className={styles.indexPage}>
      <header className={styles.indexHero}>
        <p className={styles.eyebrow}>Decision guide · {guideConfig.seasonLabel}</p>
        <h1>Plan your trip</h1>
        <p>
          The shared logistics that apply to every {guideConfig.regionName} base and
          route: how to get there, how to get around, what weather and what to pack,
          where to stay, and what to eat. Each guide is dated — facts older than
          their review window are flagged “Needs recheck” rather than left to drift.
        </p>
      </header>

      <ol className={styles.guideList}>
        {guides.map((guide) => (
          <li key={guide.slug}>
            <article className={styles.guideCard}>
              <h2 className={styles.guideCardTitle}>
                <Link href={`/plan/${guide.slug}`}>{guide.title}</Link>
              </h2>
              <p className={styles.guideCardSummary}>{guide.summary}</p>
            </article>
          </li>
        ))}
      </ol>
    </div>
  );
}
