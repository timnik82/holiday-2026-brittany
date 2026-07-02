import { describe, it, expect } from "vitest";
import {
  getBaseFrontmatter,
  getContentPage,
  getStaticContentParams,
  loadContentPages,
} from "../registry";

describe("registry", () => {
  it("loads content pages from the content directory", () => {
    const pages = loadContentPages();
    expect(pages.length).toBeGreaterThanOrEqual(1);
  });

  it("finds the about-this-guide page", () => {
    const page = getContentPage("about-this-guide");
    expect(page).toBeDefined();
    expect(page!.page.title).toBe("About this guide");
    expect(page!.category).toBe("plan");
  });

  it("generates static params for all pages", () => {
    const params = getStaticContentParams();
    expect(params.length).toBeGreaterThanOrEqual(1);
    expect(params.some((p) => p.slug === "about-this-guide")).toBe(true);
  });

  it("scopes lookup to the given category when provided", () => {
    const page = getContentPage("about-this-guide", "plan");
    expect(page).toBeDefined();
    expect(page!.category).toBe("plan");

    const wrongCategory = getContentPage("about-this-guide", "bases");
    expect(wrongCategory).toBeUndefined();
  });

  it("keeps validated base frontmatter addressable by its declared slug", () => {
    const entry = getContentPage("cote-de-granit-rose", "bases");

    expect(entry?.frontmatter).toMatchObject({
      slug: "cote-de-granit-rose",
      region: "North Brittany — Côtes-d'Armor",
    });
    expect(getBaseFrontmatter("cote-de-granit-rose")?.region).toBe(
      "North Brittany — Côtes-d'Armor"
    );
  });
});
