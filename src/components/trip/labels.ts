import type { StayFrontmatter } from "@/lib/content/schemas";

type CarRequirement = StayFrontmatter["carRequirement"];

/**
 * Display labels for the stay summary cards. Keyed by the schema's own union
 * rather than by `string`, so adding a value to `stayFrontmatterSchema` fails
 * the typecheck here until it has a label.
 */
export const CAR_REQUIREMENT_LABELS: Record<CarRequirement, string> = {
  optional: "Car optional",
  recommended: "Car recommended",
  essential: "Car essential",
};

export function carRequirementLabel(value: CarRequirement): string {
  return CAR_REQUIREMENT_LABELS[value];
}
