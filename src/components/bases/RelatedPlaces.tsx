import Link from "next/link";
import type { RelatedPlace } from "./related-places-data";
import styles from "./base-detail.module.css";

/**
 * Renders links to nearby Things to do pages that belong to a base but are
 * not separate bases themselves. Paimpol/Bréhat, Cap Fréhel, Cancale and
 * Mont-Saint-Michel are linked area content, never promoted to bases.
 *
 * `idBase` keeps the heading id unique per base page so the component could
 * be rendered more than once without producing duplicate ids (which would
 * break the aria-labelledby relationship for assistive technology).
 */
export function RelatedPlaces({
  places,
  idBase = "related",
}: {
  places: RelatedPlace[];
  idBase?: string;
}) {
  if (places.length === 0) return null;

  const headingId = `${idBase}-heading`;

  return (
    <section className={styles.relatedSection} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.sectionHeading}>
        Linked places and day trips
      </h2>
      <ul className={styles.relatedGrid}>
        {places.map((place) => (
          <li key={place.slug}>
            <Link href={`/things-to-do/${place.slug}`}>{place.title}</Link>{" "}
            <span className={styles.updated}>{place.note}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
