import Link from "next/link";

import { ageLabel, categoryLabel, durationLabel, weatherFitLabel } from "./labels";
import type { DirectoryPlace } from "./directory-data";
import styles from "./directory.module.css";

/**
 * A single place rendered as a card in the Things to do directory list.
 * Stateless and presentational — all data arrives via props.
 */
export function PlaceCard({ place }: { place: DirectoryPlace }) {
  // Both are optional: a page that states neither leaves its badges off rather
  // than showing a guess or an empty chip.
  const duration = durationLabel(place.durationHours);
  const weather = weatherFitLabel(place.weatherFit);

  return (
    <li className={styles.placeCard}>
      <h3 className={styles.placeCardTitle}>
        <Link href={`/things-to-do/${place.slug}`}>{place.title}</Link>
      </h3>
      <p className={styles.placeCardSummary}>{place.summary}</p>
      <p className={styles.placeCardMeta}>
        {place.baseSlug && place.baseTitle ? (
          <Link className={styles.placeCardBase} href={`/bases/${place.baseSlug}`}>
            {place.baseTitle}
          </Link>
        ) : (
          <span className={styles.placeCardBase}>Unassigned base</span>
        )}
        <span className={styles.placeCardBadge}>
          {categoryLabel(place.category)}
        </span>
        <span className={styles.placeCardBadge}>{ageLabel(place.ageRange)}</span>
        {duration && <span className={styles.placeCardBadge}>{duration}</span>}
        {weather && <span className={styles.placeCardBadge}>{weather}</span>}
      </p>
    </li>
  );
}
