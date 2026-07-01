import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it, expect, afterEach } from "vitest";
import { listContentFiles } from "../files";

describe("listContentFiles", () => {
  let tmpDir: string | undefined;

  afterEach(() => {
    if (tmpDir) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
      tmpDir = undefined;
    }
  });

  it("lists markdown files in a directory", () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "content-test-"));
    fs.writeFileSync(path.join(tmpDir, "a.md"), "# A");
    fs.writeFileSync(path.join(tmpDir, "b.txt"), "not markdown");

    const files = listContentFiles(tmpDir);
    expect(files).toHaveLength(1);
    expect(files[0]).toContain("a.md");
  });

  it("ignores directories that end in .md", () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "content-test-"));
    fs.mkdirSync(path.join(tmpDir, "not-a-file.md"));
    fs.writeFileSync(path.join(tmpDir, "real.md"), "# Real");

    const files = listContentFiles(tmpDir);
    expect(files).toHaveLength(1);
    expect(files[0]).toContain("real.md");
  });

  it("returns an empty array for a missing directory", () => {
    expect(listContentFiles(path.join(os.tmpdir(), "does-not-exist-xyz"))).toEqual([]);
  });
});
