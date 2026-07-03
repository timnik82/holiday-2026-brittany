import Link from "next/link";
import { guideConfig } from "@/config/guide";
import styles from "./home.module.css";

/**
 * Both candidate date windows, shown side by side.
 *
 * Base rankings are window-agnostic — they reflect stable August attributes
 * (climate, nature, culture, logistics), not week-specific forecasts — so the
 * recommendation itself does not change between windows. What shifts is
 * crowds, accommodation pressure, and weather variability, all documented in
 * the plan-your-trip guides linked below. This states that plainly rather than
 * inventing per-window scores that the data model does not hold.
 */
export function DateWindows() {
  return (
    <section aria-labelledby="windows-heading">
      <h2 id="windows-heading" className={styles.sectionHeading}>
        Does the recommendation change between date windows?
      </h2>
      <p className={styles.sectionIntro}>
        No — the base ranking reflects stable August attributes, so it holds for
        both windows. What changes is pressure and conditions, summarised under
        each window below.
      </p>
      <div className={styles.windows}>
        {guideConfig.dateWindows.map((window) => (
          <article key={window.label} className={styles.windowCard}>
            <span className={styles.windowLabel}>
              {window.label.charAt(0).toUpperCase() + window.label.slice(1)}
            </span>
            <span className={styles.windowDates}>
              <time dateTime={window.start}>{window.start}</time>{" "}
              {"–"} <time dateTime={window.end}>{window.end}</time>
            </span>
            <p className={styles.windowNote}>
              {window.label === guideConfig.dateWindows[0].label
                ? "Peak August crowds and the highest accommodation rates; book well ahead."
                : "Crowds and prices ease as French schools return; slightly more changeable weather."}
            </p>
          </article>
        ))}
      </div>
      <p>
        For what drives these differences see the{" "}
        <Link href="/plan/weather">weather guide</Link> and the{" "}
        <Link href="/plan/accommodation-budget">accommodation budget</Link> page.
      </p>
    </section>
  );
}
