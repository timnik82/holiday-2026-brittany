import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { MarkdownArticle } from "../MarkdownArticle";

describe("MarkdownArticle heading anchors", () => {
  it("generates correct id for a plain heading", () => {
    const { container } = render(
      <MarkdownArticle content="## Getting there" paragraphs={[]} showToc={false} />
    );
    const h2 = container.querySelector("h2");
    expect(h2?.getAttribute("id")).toBe("getting-there");
  });

  it("generates correct id for a heading with bold text", () => {
    const { container } = render(
      <MarkdownArticle content="## **Bold** heading" paragraphs={[]} showToc={false} />
    );
    const h2 = container.querySelector("h2");
    expect(h2?.getAttribute("id")).toBe("bold-heading");
    expect(h2?.textContent).toBe("Bold heading");
  });

  it("generates correct id for a heading with italic and code", () => {
    const { container } = render(
      <MarkdownArticle
        content="## _Italic_ and `code` here"
        paragraphs={[]}
        showToc={false}
      />
    );
    const h2 = container.querySelector("h2");
    expect(h2?.getAttribute("id")).toBe("italic-and-code-here");
  });

  it("generates correct id for a heading containing a link", () => {
    const { container } = render(
      <MarkdownArticle
        content="## [Brittany](https://example.com) guide"
        paragraphs={[]}
        showToc={false}
      />
    );
    const h2 = container.querySelector("h2");
    expect(h2?.getAttribute("id")).toBe("brittany-guide");
  });

  it("uses matching anchors for h2, h3, and h4", () => {
    const { container } = render(
      <MarkdownArticle
        content={"## **A**\n### _B_\n#### `C`"}
        paragraphs={[]}
        showToc={false}
      />
    );
    expect(container.querySelector("h2")?.getAttribute("id")).toBe("a");
    expect(container.querySelector("h3")?.getAttribute("id")).toBe("b");
    expect(container.querySelector("h4")?.getAttribute("id")).toBe("c");
  });

  it("de-duplicates ids for repeated headings across levels", () => {
    const { container } = render(
      <MarkdownArticle
        content={"## Overview\n## Overview\n### Overview"}
        paragraphs={[]}
        showToc={false}
      />
    );
    const headings = container.querySelectorAll("h2, h3");
    const ids = Array.from(headings).map((h) => h.getAttribute("id"));
    expect(ids).toEqual(["overview", "overview-2", "overview-3"]);
  });

  it("generates a non-empty id for an image-only heading using alt text", () => {
    const { container } = render(
      <MarkdownArticle
        content="## ![Alt text](https://example.com/icon.png)"
        paragraphs={[]}
        showToc={false}
      />
    );
    const h2 = container.querySelector("h2");
    expect(h2?.getAttribute("id")).toBe("alt-text");
  });
});
