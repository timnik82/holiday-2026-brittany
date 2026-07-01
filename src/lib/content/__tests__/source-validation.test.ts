import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  computeSha256,
  validateManifestChecksums,
  type SourceManifest,
} from "../source-validation";

const temporaryDirectories: string[] = [];

function createWorkspace(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "brittany-source-validation-"));
  temporaryDirectories.push(root);
  fs.mkdirSync(path.join(root, "research", "raw"), { recursive: true });
  return root;
}

function manifestFor(filePath: string, sha256: string): SourceManifest {
  return [
    {
      slug: "test-source",
      path: filePath,
      language: "en",
      sha256,
      stopHeadings: [],
    },
  ];
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

describe("source checksum validation", () => {
  it("computes the repository checksum consistently for LF and CRLF checkouts", () => {
    const root = createWorkspace();
    const lfPath = path.join(root, "research", "raw", "lf.md");
    const crlfPath = path.join(root, "research", "raw", "crlf.md");
    const lf = "# Source\n\nParagraph.\n";

    fs.writeFileSync(lfPath, lf, "utf8");
    fs.writeFileSync(crlfPath, lf.replace(/\n/g, "\r\n"), "utf8");

    const committedChecksum = createHash("sha256").update(lf).digest("hex");
    expect(computeSha256(lfPath)).toBe(committedChecksum);
    expect(computeSha256(crlfPath)).toBe(committedChecksum);
  });

  it("rejects manifest paths that escape research/raw", () => {
    const root = createWorkspace();
    const outsidePath = path.join(root, "private.txt");
    const content = "not a research source";
    fs.writeFileSync(outsidePath, content, "utf8");
    const checksum = createHash("sha256").update(content).digest("hex");

    const errors = validateManifestChecksums(
      manifestFor("research/raw/../../private.txt", checksum),
      root
    );

    expect(errors).toEqual([
      {
        message:
          'research/raw/../../private.txt: Source path for slug "test-source" must stay within research/raw.',
      },
    ]);
  });
});
