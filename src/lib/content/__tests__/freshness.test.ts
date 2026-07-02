import { describe, expect, it } from "vitest";
import {
  DEFAULT_REVIEW_WINDOW_DAYS,
  getFreshness,
} from "../freshness";

describe("getFreshness", () => {
  // Fixed "today" so tests are deterministic regardless of when they run.
  const now = new Date("2026-07-02T10:00:00Z");

  it("is fresh when checked today", () => {
    expect(getFreshness("2026-07-02", DEFAULT_REVIEW_WINDOW_DAYS, now)).toEqual({
      fresh: true,
      ageDays: 0,
    });
  });

  it("is fresh when checked within the review window", () => {
    // 10 days ago, well within 30 days.
    expect(getFreshness("2026-06-22", DEFAULT_REVIEW_WINDOW_DAYS, now)).toEqual({
      fresh: true,
      ageDays: 10,
    });
  });

  it("is fresh exactly on the window boundary (age == window)", () => {
    // 30 days ago: age == window, boundary is inclusive (still fresh).
    expect(getFreshness("2026-06-02", DEFAULT_REVIEW_WINDOW_DAYS, now)).toEqual({
      fresh: true,
      ageDays: 30,
    });
  });

  it("is stale one day past the window boundary", () => {
    expect(getFreshness("2026-06-01", DEFAULT_REVIEW_WINDOW_DAYS, now)).toEqual({
      fresh: false,
      ageDays: 31,
    });
  });

  it("is stale when checked far in the past", () => {
    expect(getFreshness("2025-01-01", DEFAULT_REVIEW_WINDOW_DAYS, now)).toEqual({
      fresh: false,
      ageDays: 547,
    });
  });

  it("respects a custom review window", () => {
    // 7-day window: 10 days ago is stale.
    expect(getFreshness("2026-06-22", 7, now)).toEqual({
      fresh: false,
      ageDays: 10,
    });
    // 7-day window: 5 days ago is fresh.
    expect(getFreshness("2026-06-27", 7, now)).toEqual({
      fresh: true,
      ageDays: 5,
    });
  });

  it("is fresh with a negative age (checked date in the future)", () => {
    // A future checked date should not be flagged stale.
    expect(getFreshness("2026-07-05", DEFAULT_REVIEW_WINDOW_DAYS, now)).toEqual({
      fresh: true,
      ageDays: -3,
    });
  });

  it("treats a missing checkedAt as stale with NaN age", () => {
    expect(getFreshness(undefined, DEFAULT_REVIEW_WINDOW_DAYS, now)).toEqual({
      fresh: false,
      ageDays: Number.NaN,
    });
    expect(getFreshness("", DEFAULT_REVIEW_WINDOW_DAYS, now)).toEqual({
      fresh: false,
      ageDays: Number.NaN,
    });
  });

  it("treats an unparseable checkedAt as stale with NaN age", () => {
    expect(getFreshness("not-a-date", DEFAULT_REVIEW_WINDOW_DAYS, now)).toEqual({
      fresh: false,
      ageDays: Number.NaN,
    });
  });
});
