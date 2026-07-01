export const RANKING_DIMENSIONS = [
  "climate",
  "nature",
  "culture",
  "familyActivities",
  "logistics",
  "accommodation",
  "food",
] as const;

export type RankingDimension = (typeof RANKING_DIMENSIONS)[number];

export const FAMILY_WEIGHTS = {
  climate: 0.2,
  nature: 0.15,
  culture: 0.1,
  familyActivities: 0.15,
  logistics: 0.1,
  accommodation: 0.15,
  food: 0.15,
} as const satisfies Record<RankingDimension, number>;

export const RANKING_DIMENSION_LABELS: Record<RankingDimension, string> = {
  climate: "Climate",
  nature: "Nature",
  culture: "Culture",
  familyActivities: "Family activities",
  logistics: "Logistics",
  accommodation: "Accommodation",
  food: "Food",
};
