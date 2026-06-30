import { describe, it, expect } from "vitest";
import { slugify, stripInlineMarkdown } from "../slug";

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
});
