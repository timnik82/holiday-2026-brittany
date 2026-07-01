import { describe, it, expect } from "vitest";
import { slugify, stripInlineMarkdown, createSlugger } from "../slug";

describe("slugify", () => {
  it("produces lowercase kebab-case ids", () => {
    expect(slugify("Getting There")).toBe("getting-there");
  });

  it("trims leading and trailing separators", () => {
    expect(slugify("  Hello  ")).toBe("hello");
  });

  it("collapses non-alphanumeric runs into a single dash", () => {
    expect(slugify("A -- B!! C")).toBe("a-b-c");
  });

  it("strips accents from Latin characters", () => {
    expect(slugify("Café à Vannes")).toBe("cafe-a-vannes");
  });

  it("preserves non-Latin letters instead of producing an empty id", () => {
    expect(slugify("東京")).toBe("東京");
  });
});

describe("stripInlineMarkdown", () => {
  it("removes bold markers", () => {
    expect(stripInlineMarkdown("**Bold** Heading")).toBe("Bold Heading");
  });

  it("removes italic markers", () => {
    expect(stripInlineMarkdown("*Italic* text")).toBe("Italic text");
  });

  it("removes inline code markers but keeps contents", () => {
    expect(stripInlineMarkdown("Use `npm test`")).toBe("Use npm test");
  });

  it("keeps link text and drops the url", () => {
    expect(stripInlineMarkdown("[Brittany](https://example.com) guide")).toBe(
      "Brittany guide"
    );
  });

  it("keeps image alt text and drops the url", () => {
    expect(stripInlineMarkdown("![Map of Brittany](./map.png)")).toBe(
      "Map of Brittany"
    );
  });

  it("does not mangle underscores inside words", () => {
    expect(stripInlineMarkdown("Use `some_word` here")).toBe(
      "Use some_word here"
    );
  });
});

describe("createSlugger", () => {
  it("returns the base slug for the first occurrence", () => {
    const nextId = createSlugger();
    expect(nextId("Overview")).toBe("overview");
  });

  it("de-duplicates repeated headings with numeric suffixes", () => {
    const nextId = createSlugger();
    expect(nextId("Overview")).toBe("overview");
    expect(nextId("Overview")).toBe("overview-2");
    expect(nextId("Overview")).toBe("overview-3");
  });
});
