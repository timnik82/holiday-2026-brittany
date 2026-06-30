import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { SiteShell } from "./SiteShell";

afterEach(cleanup);

describe("SiteShell", () => {
  it("renders the skip link", () => {
    render(<SiteShell>content</SiteShell>);
    expect(screen.getByText("Skip to main content")).toBeInTheDocument();
  });

  it("renders primary navigation with all items", () => {
    render(<SiteShell>content</SiteShell>);
    const nav = screen.getByRole("navigation", { name: /primary/i });
    expect(nav).toBeInTheDocument();

    const expectedItems = [
      "Compare bases",
      "Routes",
      "Things to do",
      "Swimming",
      "Plan your trip",
    ];
    for (const item of expectedItems) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
  });

  it("renders utility navigation with Sources link", () => {
    render(<SiteShell>content</SiteShell>);
    const nav = screen.getByRole("navigation", { name: /utility/i });
    expect(nav).toBeInTheDocument();
    expect(screen.getByText("Sources")).toBeInTheDocument();
  });

  it("renders semantic header, main, and footer", () => {
    render(<SiteShell>content</SiteShell>);
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("renders children in the main area", () => {
    render(<SiteShell><p>Test content</p></SiteShell>);
    const main = screen.getByRole("main");
    expect(main).toHaveTextContent("Test content");
  });
});
