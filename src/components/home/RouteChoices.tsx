import Link from "next/link";
import { loadContentPages } from "@/lib/content/registry";
import type { RouteFrontmatter } from "@/lib/content/schemas";
import {
  carRequirementLabel,
  paceLabel,
} from "@/components/routes/labels";
import styles from "./home.module.css";

interface RouteChoice {
  slug: string;
  title: string;
  summary: string;
  durationDays: number;
  pace: string;
  carRequirement: string;
  bestFit: string;
}

/**
 * Load the three reviewed routes (status !== "draft") in editorial order,
 * mirroring the single-pass `loadRouteIndex` pattern from the routes index
 * page. The home page only needs the summary fields, so the base-title map is
 * dropped here.
 */
function loadRouteChoices(): RouteChoice[] {
  const allPages = loadContentPages();
  const routes: RouteChoice[] = [];
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
    });
  }
  // Stable, editorial order regardless of filesystem ordering.
  const ORDER: Record<string, number> = {
    cultural: 0,
    nature: 1,
    "relaxed-family": 2,
  };
  routes.sort((a, b) => (ORDER[a.slug] ?? 99) - (ORDER[b.slug] ?? 99));
  return routes;
}

/**
 * Compact summary of the three route styles (cultural, nature, relaxed family),
 * each linking to its day-by-day itinerary. Helps the reader pick a travel
 * style by pace and intent without leaving the home page.
 */
export function RouteChoices() {
  const routes = loadRouteChoices();

  return (
    <section aria-labelledby="routes-heading">
      <h2 id="routes-heading" className={styles.sectionHeading}>
        Pick a travel style
      </h2>
      <p className={styles.sectionIntro}>
        Three complete day-by-day itineraries, each built around a different
        pace and priority. Choose by what your family wants most.
      </p>
      <ol className={styles.routeList}>
        {routes.map((route) => (
          <li key={route.slug} className={styles.routeCard}>
            <h3>
              <Link href={`/routes/${route.slug}`}>{route.title}</Link>
            </h3>
            <p className={styles.chips}>
              <span className={styles.chip}>{route.durationDays} days</span>
              <span className={styles.chip}>{paceLabel(route.pace)}</span>
              <span className={styles.chip}>
                {carRequirementLabel(route.carRequirement)}
              </span>
            </p>
            <p>{route.bestFit}</p>
          </li>
        ))}
      </ol>
      <p>
        <Link href="/routes">Browse all routes →</Link>
      </p>
    </section>
  );
}
