import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// vitest does not enable globals by default, so @testing-library/react's
// automatic cleanup never runs. Register it explicitly to keep the DOM clean
// between rendered component tests.
afterEach(() => {
  cleanup();
});
