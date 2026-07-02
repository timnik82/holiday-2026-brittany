import { describe, expect, it } from "vitest";

import { CONTENT_STATUS_LABELS } from "./labels";

describe("CONTENT_STATUS_LABELS", () => {
  it("turns internal content states into reader-facing labels", () => {
    expect(CONTENT_STATUS_LABELS).toEqual({
      draft: "Draft",
      review: "In review",
      published: "Published",
    });
  });
});
