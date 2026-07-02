import Link from "next/link";
import type { Metadata } from "next";
import { guideConfig } from "@/config/guide";
import { loadContentPages } from "@/lib/content/registry";
import { RouteTimeline } from "@/components/routes/RouteTimeline";
import { carRequirementLabel, paceLabel } from "@/components/routes/labels";
import styles from "@/components/routes/routes.module.css";
import type { RouteFrontmatter } from "@/lib/content/schemas";

export function generateMetadata(): Metadata {
  return {
    title: `Routes — ${guideConfig.shortTitle}`,
    description: `Three evidence-backed ${guideConfig.regionName} routes for ${guideConfig.seasonLabel}: cultural, nature, and relaxed family.`,
  };
}

interface RouteSummary {
  slug: string;
  title: string;
  summary: string;
  durationDays: number;
  pace: string;
  carRequirement: string;
  bestFit: string;
  frontmatter: RouteFrontmatter;
}

interface RouteIndexData {
  routes: RouteSummary[];
  baseTitles: Map<string, string>;
}

/**
 * Load reviewed routes (status !== "draft") plus a baseSlug → baseTitle map
 * from a single registry load, mirroring the directory-data pattern. In dev
 * the registry cache is disabled, so building both from one `loadContentPages`
 * call avoids a repeat disk scan.
 */
function loadRouteIndex(): RouteIndexData {
  const allPages = loadContentPages();
  const baseTitles = new Map<string, string>();
  for (const entry of allPages) {
    if (entry.category === "bases") {
      baseTitles.set(entry.page.slug, entry.page.title);
    }
  }

  const routes: RouteSummary[] = [];
  for (const entry of allPages) {
    if (entry.category !== "routes" || entry.page.status === "draft") continue;
    const fm = entry.frontmatter as RouteFrontmatter;
    routes.push({
      slug: entry.page.slug,
      title: entry.page.title,
      summary: entry.page.summary,
      durationDays: fm.durationDays,
      pace: fm.pace,
      carRequirement: fm.carRequirement,
      bestFit: fm.bestFit,
      frontmatter: fm,
    });
  }
  // Stable, editorial order regardless of filesystem ordering.
  const ORDER: Record<string, number> = {
    cultural: 0,
    nature: 1,
    "relaxed-family": 2,
  };
  routes.sort((a, b) => (ORDER[a.slug] ?? 99) - (ORDER[b.slug] ?? 99));
  return { routes, baseTitles };
}

export default function RoutesPage() {
  const { routes, baseTitles } = loadRouteIndex();

  return (
    <div className={styles.indexPage}>
      <header className={styles.indexHero}>
        <p className={styles.eyebrow}>Decision guide · {guideConfig.seasonLabel}</p>
        <h1>Pick a travel style</h1>
        <p>
          Three complete routes for {guideConfig.regionName}, each with a day-by-day
          itinerary, weather alternatives, and links to the canonical base and
          place pages. Choose by what your family wants most.
        </p>
      </header>

      <ol className={styles.routeList}>
        {routes.map((route) => (
          <li key={route.slug}>
            <article className={styles.routeCard}>
              <h2 className={styles.routeCardTitle}>
                <Link href={`/routes/${route.slug}`}>{route.title}</Link>
              </h2>
              <p className={styles.routeCardSummary}>{route.summary}</p>
              <p className={styles.routeCardChips}>
                <span className={styles.chip}>{route.durationDays} days</span>
                <span className={styles.chip}>{paceLabel(route.pace)}</span>
                <span className={styles.chip}>{carRequirementLabel(route.carRequirement)}</span>
              </p>
              <RouteTimeline
                frontmatter={route.frontmatter}
                baseTitles={baseTitles}
                variant="compact"
              />
            </article>
          </li>
        ))}
      </ol>
    </div>
  );
}
