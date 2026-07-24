import Link from "next/link";
import { guideConfig } from "@/config/guide";
import styles from "./SiteShell.module.css";

const PRIMARY_NAV_ITEMS = [
  { label: "Compare bases", href: "/bases" },
  { label: "The trip", href: "/trip" },
  { label: "Things to do", href: "/things-to-do" },
  { label: "Swimming", href: "/swimming" },
  { label: "Plan your trip", href: "/plan" },
] as const;

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a className={styles.skipLink} href="#main-content" data-print-hidden>
        Skip to main content
      </a>

      <header className={styles.header} data-print-hidden>
        <div className={styles.headerInner}>
          <span className={styles.siteTitle}>{guideConfig.shortTitle}</span>

          <nav aria-label="Primary" className={styles.primaryNav}>
            <ul>
              {PRIMARY_NAV_ITEMS.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href}>{label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Utility" className={styles.utilityNav}>
            <Link href="/sources">Sources</Link>
          </nav>
        </div>
      </header>

      <main id="main-content" className={styles.main}>
        {children}
      </main>

      <footer className={styles.footer} data-print-hidden>
        <p>
          Family trip planning — {guideConfig.regionName},{" "}
          {guideConfig.countryName}, {guideConfig.seasonLabel}
        </p>
      </footer>
    </>
  );
}
