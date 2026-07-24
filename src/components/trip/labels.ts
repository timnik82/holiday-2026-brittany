/**
 * Display labels for the stay summary cards. `carRequirement` is an enum in
 * `stayFrontmatterSchema`, so this map is exhaustive over the allowed values.
 */
export const CAR_REQUIREMENT_LABELS: Record<string, string> = {
  optional: "Car optional",
  recommended: "Car recommended",
  essential: "Car essential",
};

export function carRequirementLabel(value: string): string {
  return CAR_REQUIREMENT_LABELS[value] ?? value;
}
