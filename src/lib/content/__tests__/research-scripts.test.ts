import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const projectRoot = process.cwd();
const tsxCli = path.join(projectRoot, "node_modules", "tsx", "dist", "cli.mjs");
const buildScript = path.join(
  projectRoot,
  "scripts",
  "content",
  "build-source-blocks.ts"
);
const validateScript = path.join(
  projectRoot,
  "scripts",
  "content",
  "validate-content.ts"
);
const temporaryDirectories: string[] = [];

function createWorkspace(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "brittany-research-script-"));
  temporaryDirectories.push(root);
  fs.mkdirSync(path.join(root, "research", "raw"), { recursive: true });
  return root;
}

function runScript(scriptPath: string, cwd: string) {
  return spawnSync(process.execPath, [tsxCli, scriptPath], {
    cwd,
    encoding: "utf8",
  });
}

function writeValidManifest(root: string): void {
  const markdown = "# Source\n\nParagraph.\n";
  const sourcePath = path.join(root, "research", "raw", "source.md");
  fs.writeFileSync(sourcePath, markdown, "utf8");
  fs.writeFileSync(
    path.join(root, "research", "source-manifest.json"),
    JSON.stringify([
      {
        slug: "source",
        path: "research/raw/source.md",
        language: "en",
        sha256: createHash("sha256").update(markdown).digest("hex"),
        stopHeadings: [],
      },
    ]),
    "utf8"
  );
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

describe("research scripts", () => {
  it("reports malformed manifest JSON without an uncaught exception", () => {
    const root = createWorkspace();
    fs.writeFileSync(
      path.join(root, "research", "source-manifest.json"),
      "{",
      "utf8"
    );

    const result = runScript(buildScript, root);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      "research/source-manifest.json: Invalid JSON"
    );
    expect(result.stderr).not.toContain("SyntaxError:");
  });

  it("aggregates invalid manifest schema errors in content validation", () => {
    const root = createWorkspace();
    fs.writeFileSync(
      path.join(root, "research", "source-manifest.json"),
      JSON.stringify([{ slug: "source" }]),
      "utf8"
    );

    const result = runScript(validateScript, root);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("research/source-manifest.json:");
    expect(result.stderr).toContain("sha256");
    expect(result.stderr).toContain("Content validation failed");
    expect(result.stderr).not.toContain("ZodError");
  });

  it("reports malformed block decisions JSON without an uncaught exception", () => {
    const root = createWorkspace();
    writeValidManifest(root);
    fs.writeFileSync(
      path.join(root, "research", "block-decisions.json"),
      "{",
      "utf8"
    );

    const result = runScript(validateScript, root);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      "research/block-decisions.json: Invalid JSON"
    );
    expect(result.stderr).toContain("Content validation failed");
    expect(result.stderr).not.toContain("SyntaxError:");
  });
});
