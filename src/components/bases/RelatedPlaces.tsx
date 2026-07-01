import Link from "next/link";
import styles from "./base-detail.module.css";

export interface RelatedPlace {
  slug: string;
  title: string;
  /** Short hint of the relationship, e.g. "Day trip · 1h drive". */
  note: string;
}

/**
 * Renders links to nearby Things to do pages that belong to a base but are
 * not separate bases themselves. Paimpol/Bréhat, Cap Fréhel, Cancale and
 * Mont-Saint-Michel are linked area content, never promoted to bases.
 */
export function RelatedPlaces({
  places,
}: {
  places: RelatedPlace[];
}) {
  if (places.length === 0) return null;

  return (
    <section className={styles.relatedSection} aria-labelledby="related-heading">
      <h2 id="related-heading" className={styles.sectionHeading}>
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
