import type { BaseRecord } from "@/lib/ranking/schema";

/**
 * Human-readable labels for a base's practical fields, shared by the
 * comparison page and the per-base detail components so wording stays in
 * one place. The short forms ("Optional", "Moderate", …) match the
 * already-shipped comparison table.
 */
export const CAR_NEED_LABELS: Record<BaseRecord["carNeed"], string> = {
  optional: "Optional",
  helpful: "Helpful",
  recommended: "Recommended",
  essential: "Essential",
};

export const PRICE_BAND_LABELS: Record<BaseRecord["priceBand"], string> = {
  budget: "Better value",
  moderate: "Moderate",
  high: "High",
};
