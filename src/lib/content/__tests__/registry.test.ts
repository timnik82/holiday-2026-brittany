import { describe, it, expect } from "vitest";
import { loadContentPages, getStaticContentParams, getContentPage } from "../registry";

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
});
