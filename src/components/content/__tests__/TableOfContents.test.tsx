import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TableOfContents } from "../TableOfContents";

describe("TableOfContents", () => {
  it("extracts h2-h4 headings as anchor links", () => {
    const md = `## Section one\n### Sub\n#### Deep\n# Should be ignored`;
    render(<TableOfContents markdown={md} />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(3);
    expect(links[0]).toHaveAttribute("href", "#section-one");
  });

  it("skips heading markers that appear inside fenced code blocks", () => {
    const md = [
      "## Real heading",
      "",
      "```",
      "## Not a heading",
      "### Also not",
      "```",
      "",
      "## Another real heading",
    ].join("\n");
    render(<TableOfContents markdown={md} />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute("href", "#real-heading");
    expect(links[1]).toHaveAttribute("href", "#another-real-heading");
  });

  it("handles tilde fences and resumes scanning after them", () => {
    const md = ["## Before", "", "~~~", "## Hidden", "~~~", "", "## After"].join(
      "\n"
    );
    render(<TableOfContents markdown={md} />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
    expect(links[1]).toHaveAttribute("href", "#after");
  });

  it("strips inline markdown from the displayed heading text and anchor", () => {
    const md = "## **Bold** and `code` heading";
    render(<TableOfContents markdown={md} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "#bold-and-code-heading");
    expect(link).toHaveTextContent("Bold and code heading");
  });

  it("renders nothing when there are no headings", () => {
    const { container } = render(<TableOfContents markdown="Just text." />);
    expect(container.querySelector("nav")).toBeNull();
  });
});
