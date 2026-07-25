export interface RelatedPlace {
  slug: string;
  title: string;
  /** Short hint of the relationship, e.g. "Day trip · 1h drive". */
  note: string;
}

/**
 * Canonical display titles for places that belong to more than one base, so a
 * slug/title edit only happens here. `note` still varies per base, so callers
 * pass it explicitly via `place()`. Declared before RELATED_PLACES because the
 * map is built by calling `place()` at module init.
 */
const PLACE_TITLES: Record<string, string> = {
  "crozon-pen-hir": "Pen-Hir and Cap de la Chèvre",
  morgat: "Morgat beach and bay",
  "maison-des-mineraux": "Maison des Minéraux",
};

/** Build a RelatedPlace from a shared title, keeping the per-base note. */
function place(slug: string, note: string): RelatedPlace {
  return { slug, title: PLACE_TITLES[slug] ?? slug, note };
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
    { slug: "dinan", title: "Dinan medieval town", note: "~30–40 min · car" },
    { slug: "chateau-de-dinan", title: "Château de Dinan", note: "Indoor · Dinan day" },
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
  "brest-finistere": [
    { slug: "oceanopolis", title: "Océanopolis", note: "Rainy-day anchor" },
    { slug: "chateau-de-brest", title: "Château de Brest / Marine museum", note: "City culture" },
    place("crozon-pen-hir", "Day trip · car"),
    place("morgat", "Day trip · car"),
    place("maison-des-mineraux", "Family geology"),
    { slug: "morlaix-roscoff", title: "Morlaix and Roscoff", note: "Linked area" },
  ],
  "quimper-south-finistere": [
    { slug: "quimper", title: "Quimper historic centre", note: "On-site" },
    {
      slug: "musee-beaux-arts-quimper",
      title: "Musée des Beaux-Arts de Quimper",
      note: "Indoor · walkable",
    },
    { slug: "locronan", title: "Locronan", note: "~20–30 min · car" },
    { slug: "concarneau", title: "Concarneau & Filets Bleus", note: "~30 min · car" },
    { slug: "pont-aven", title: "Pont-Aven", note: "Day trip · car" },
    { slug: "benodet", title: "Bénodet and Glénan islands", note: "Beach + boat" },
    { slug: "haliotika", title: "Haliotika (Le Guilvinec)", note: "Rainy-day option" },
    { slug: "pointe-du-raz", title: "Pointe du Raz", note: "Wild headland · car" },
  ],
  "crozon-douarnenez": [
    place("crozon-pen-hir", "On-site"),
    place("morgat", "Sheltered swim"),
    place("maison-des-mineraux", "Family geology"),
  ],
  "vannes-carnac-morbihan": [
    { slug: "vannes", title: "Vannes medieval town", note: "Walkable hub" },
    { slug: "carnac-alignments", title: "Carnac megaliths", note: "On-site" },
    { slug: "ile-aux-moines", title: "Île-aux-Moines", note: "Boat trip" },
    { slug: "ile-d-arz", title: "Île d'Arz", note: "Boat trip" },
    { slug: "suscinio", title: "Château de Suscinio", note: "Day trip · car" },
    { slug: "quiberon", title: "Quiberon peninsula", note: "Day trip · car" },
    { slug: "branfere", title: "Parc de Branféré", note: "Family anchor" },
    { slug: "auray-saint-goustan", title: "Auray / Saint-Goustan", note: "Short detour" },
    { slug: "broceliande", title: "Brocéliande forest", note: "Inland · relaxed route" },
    { slug: "lac-de-tremelin", title: "Lac de Trémelin", note: "Inland · relaxed route" },
  ],
};

export function getRelatedPlaces(slug: string): RelatedPlace[] {
  return RELATED_PLACES[slug] ?? [];
}
