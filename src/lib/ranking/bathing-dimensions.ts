/**
 * Bathing-suitability dimensions for the swimming guide.
 *
 * Unlike the base-ranking weights (which reflect this family's stated
 * priorities and are therefore unequal), bathing suitability is scored with
 * EQUAL weight across these six dimensions. A missing water-quality score is
 * treated specially by the engine: it forces an unknown total regardless of
 * the other scores, because publishing a number without official water-quality
 * evidence would mislead.
 */
export const BATHING_DIMENSIONS = [
  "temperatureShelter",
  "tides",
  "easyAccess",
  "lifeguards",
  "waterQuality",
  "alternatives",
] as const;

export type BathingDimension = (typeof BATHING_DIMENSIONS)[number];

export const BATHING_WEIGHTS = {
  temperatureShelter: 1 / 6,
  tides: 1 / 6,
  easyAccess: 1 / 6,
  lifeguards: 1 / 6,
  waterQuality: 1 / 6,
  alternatives: 1 / 6,
} as const satisfies Record<BathingDimension, number>;

export const BATHING_DIMENSION_LABELS: Record<BathingDimension, string> = {
  temperatureShelter: "Temperature & shelter",
  tides: "Tidal exposure",
  easyAccess: "Easy access",
  lifeguards: "Lifeguards",
  waterQuality: "Water quality",
  alternatives: "Nearby alternatives",
};
