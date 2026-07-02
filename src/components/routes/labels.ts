/**
 * Display labels for the route summary cards. The route frontmatter uses
 * enum values for `pace` and `carRequirement` (see `routeFrontmatterSchema`),
 * so these maps are exhaustive over the allowed values.
 */
export const PACE_LABELS: Record<string, string> = {
  relaxed: "Relaxed",
  moderate: "Moderate",
  active: "Active",
};

export const CAR_REQUIREMENT_LABELS: Record<string, string> = {
  optional: "Car optional",
  recommended: "Car recommended",
  essential: "Car essential",
};

export function paceLabel(value: string): string {
  return PACE_LABELS[value] ?? value;
}

export function carRequirementLabel(value: string): string {
  return CAR_REQUIREMENT_LABELS[value] ?? value;
}
