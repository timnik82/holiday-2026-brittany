/**
 * What can be reached from each booked stay.
 *
 * Reach is deliberately not derived from the place→base relation. Half the
 * places worth visiting belong to bases we never sleep in — Crozon and Brest
 * are day trips from Quimper, Brocéliande is one from Vannes — while some
 * places on our own base are still a drive away. The base answers "which region
 * is this place in"; reach answers "can we get there from where we are
 * tonight", which is the only question the trip companion asks.
 *
 * Curated by hand, and grounded in each place page's own "Transport" line
 * rather than in invented travel times: the research corpus does not contain
 * door-to-door durations and will not be made to.
 *
 * `nearby` means the page describes it as walkable, or a short hop from the
 * town we sleep in — something a spare afternoon absorbs. `day-trip` means a
 * deliberate drive out. Nothing in between: a finer scale would be guesswork.
 */

export type ReachTag = "nearby" | "day-trip";

export interface ReachEntry {
  /** Slug of a page under `content/things-to-do/`. */
  readonly place: string;
  readonly reach: ReachTag;
}

/**
 * Stay id → the places reachable from it, most local first.
 *
 * The two Nantes stays are absent rather than empty-listed: their places arrive
 * with the Nantes research, and an empty list would read as "nothing to do
 * here" instead of "not written up yet".
 */
const REACH: Record<string, readonly ReachEntry[]> = {
  "vannes-carnac-morbihan": [
    { place: "vannes", reach: "nearby" },
    { place: "auray-saint-goustan", reach: "nearby" },
    { place: "carnac-alignments", reach: "day-trip" },
    { place: "suscinio", reach: "day-trip" },
    { place: "ile-aux-moines", reach: "day-trip" },
    { place: "ile-d-arz", reach: "day-trip" },
    { place: "quiberon", reach: "day-trip" },
    { place: "branfere", reach: "day-trip" },
    // Inland, and flagged in the research as a lower-confidence extension.
    { place: "broceliande", reach: "day-trip" },
    { place: "lac-de-tremelin", reach: "day-trip" },
  ],
  "quimper-south-finistere": [
    { place: "quimper", reach: "nearby" },
    { place: "locronan", reach: "day-trip" },
    { place: "benodet", reach: "day-trip" },
    { place: "pont-aven", reach: "day-trip" },
    { place: "concarneau", reach: "day-trip" },
    { place: "haliotika", reach: "day-trip" },
    { place: "pointe-du-raz", reach: "day-trip" },
    // The Crozon peninsula and Brest belong to other bases entirely. The
    // sources put a Crozon day and an Océanopolis day on a Quimper base, which
    // is exactly the case reach exists to express.
    { place: "crozon-pen-hir", reach: "day-trip" },
    { place: "morgat", reach: "day-trip" },
    { place: "maison-des-mineraux", reach: "day-trip" },
    { place: "oceanopolis", reach: "day-trip" },
    { place: "chateau-de-brest", reach: "day-trip" },
  ],
  "saint-malo-dinan": [
    { place: "saint-malo-walls", reach: "nearby" },
    { place: "bon-secours", reach: "nearby" },
    { place: "grand-aquarium", reach: "nearby" },
    { place: "cancale", reach: "day-trip" },
    { place: "dinan", reach: "day-trip" },
    { place: "cap-frehel-fort-la-latte", reach: "day-trip" },
    { place: "mont-saint-michel", reach: "day-trip" },
  ],
};

/**
 * Places reachable from a stay, most local first. Unknown stay ids (including
 * the two Nantes stays, whose places arrive later) return an empty list rather
 * than throwing — the day selector treats empty as "nothing curated yet".
 */
export function reachForStay(stayId: string): readonly ReachEntry[] {
  return REACH[stayId] ?? [];
}

/**
 * Every (stayId, place, reach) triple, for validation and inverse lookups.
 */
export function allReachEntries(): { stayId: string; entry: ReachEntry }[] {
  return Object.entries(REACH).flatMap(([stayId, entries]) =>
    entries.map((entry) => ({ stayId, entry }))
  );
}
