import { createHash } from "node:crypto";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NarratableContent } from "./NarratableContent";
import type { ParagraphRecord } from "@/lib/content/types";

vi.mock("./ListenButton", () => ({
  ListenButton: ({ paragraphId }: { paragraphId: string }) => (
    <button data-paragraph-id={paragraphId}>Listen</button>
  ),
}));

const repeatedText =
  "This deliberately repeated paragraph is long enough to qualify for narration, and it appears twice so the renderer must preserve each paragraph record rather than overwriting the first identifier with the second one.";

function paragraph(id: string): ParagraphRecord {
  return {
    id,
    text: repeatedText,
    hash: createHash("sha256").update(repeatedText).digest("hex"),
    evidenceRefs: [],
    narratable: true,
  };
}

describe("NarratableContent", () => {
  it("matches repeated paragraph text to distinct IDs in document order", () => {
    render(
      <NarratableContent
        content={`${repeatedText}\n\n${repeatedText}`}
        paragraphs={[paragraph("first"), paragraph("second")]}
      />,
    );

    expect(
      screen.getAllByRole("button", { name: "Listen" }).map((button) =>
        button.getAttribute("data-paragraph-id"),
      ),
    ).toEqual(["first", "second"]);
  });
});
