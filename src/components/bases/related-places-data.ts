export interface RelatedPlace {
  slug: string;
  title: string;
  /** Short hint of the relationship, e.g. "Day trip · 1h drive". */
  note: string;
}

/**
 * Editorial mapping of each base to the linked Things to do pages that belong
 * to it but are not separate bases themselves (e.g. Paimpol/Bréhat, Cap Fréhel,
 * Cancale, Mont-Saint-Michel). Kept in a dedicated module so the base route
 * stays focused on rendering and the relationship data is easy to update
 * without touching page logic.
 *
 * `note` is a short hint of the relationship, shown beside the link.
 */
export const RELATED_PLACES: Record<string, RelatedPlace[]> = {
  "saint-malo-dinan": [
    { slug: "saint-malo-walls", title: "Saint-Malo walled city", note: "On-site" },
    { slug: "bon-secours", title: "Plage du Bon-Secours", note: "City beach" },
    { slug: "grand-aquarium", title: "Grand Aquarium", note: "Rainy-day anchor" },
    { slug: "dinan", title: "Dinan medieval town", note: "~40 min train" },
    { slug: "cancale", title: "Cancale oysters", note: "Day trip" },
    { slug: "cap-frehel-fort-la-latte", title: "Cap Fréhel & Fort La Latte", note: "Day trip · car" },
    { slug: "mont-saint-michel", title: "Mont-Saint-Michel", note: "Day trip · ~1h" },
  ],
  "cote-de-granit-rose": [
    { slug: "ploumanach", title: "Ploumanac'h and the pink rocks", note: "On-site" },
    { slug: "sept-iles", title: "Sept-Îles bird reserve", note: "Boat trip" },
    { slug: "parc-du-radome", title: "Parc du Radôme / Cité des Télécoms", note: "Rainy-day anchor" },
    { slug: "paimpol-brehat", title: "Paimpol and Bréhat island", note: "Linked area" },
  ],
};

export function getRelatedPlaces(slug: string): RelatedPlace[] {
  return RELATED_PLACES[slug] ?? [];
}
