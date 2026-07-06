# Final QA and CI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close all research coverage, add the one representative release journey and print safeguards, and make the existing quality gates run automatically in GitHub Actions.

**Architecture:** Keep the existing content/evidence model and replace only its temporary `draft` coverage outcome with final retained, duplicate, or conflict decisions. Keep one Playwright smoke journey and one CI workflow; use representative browser/print inspection for visual behavior rather than creating a page-by-viewport test matrix.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Zod, Vitest, Playwright Chromium, CSS Modules/global CSS, GitHub Actions.

---

### Task 1: Close the 32 temporary coverage outcomes

**Files:**
- Modify: `research/coverage.json`
- Read: `research/blocks/*.json`
- Read: `research/evidence/*.json`
- Read: `content/**/*.md`

- [ ] **Step 1: Print the unresolved source text and current candidate evidence**

Load the four `research/blocks/*.json` files, filter these IDs, and print their text and headings:

```text
chatgpt:b003,b004,b005,b038,b039,b040,b041,b042,b058,b059,b060,b061
gemini-britany:b001,b005,b006,b008,b010,b021,b022,b023,b024,b025,b033,b034
operaai:b026
perplexity:b009,b010,b011,b052,b053,b054,b068
```

For each block, search the evidence registry by its distinctive place, price, route, transport, or food terms with `rg`. This makes the classification traceable to repository evidence instead of guessing from the old `plannedArea` label.

- [ ] **Step 2: Replace each draft with a final outcome**

Use exactly one existing schema shape per block:

```json
{
  "status": "duplicate",
  "retainedEvidenceId": "evidence:existing-record-id"
}
```

when the whole block repeats one retained claim; or:

```json
{
  "status": "retained",
  "evidenceIds": ["evidence:existing-record-id"],
  "paragraphIds": ["existing-guide-paragraph-id"]
}
```

when it contributes a claim already represented in the guide. Use `conflict` only when the source value genuinely disagrees with another preserved claim. Do not create new evidence merely to preserve introductory prose, methodology narration, or a summary that only repeats detailed blocks.

- [ ] **Step 3: Verify coverage integrity**

Run:

```powershell
npm run validate:content
rg -n '"status": "draft"' research/coverage.json
```

Expected: content validation passes and `rg` returns no matches.

- [ ] **Step 4: Commit coverage closure**

```powershell
git add research/coverage.json
git -c user.name="Timur" -c user.email="206328117+timnik82@users.noreply.github.com" commit -m "content: close research coverage"
```

### Task 2: Remove draft from the final coverage contract

**Files:**
- Modify: `src/lib/content/__tests__/coverage.test.ts`
- Modify: `src/lib/content/coverage.ts`
- Modify: `src/app/sources/coverage/page.tsx`
- Modify: `src/components/sources/CoverageTable.tsx`
- Modify: `src/components/sources/sources.module.css`

- [ ] **Step 1: Write the failing final-schema test**

Replace the two draft-acceptance tests and draft map fixture with this rejection assertion and a retained fixture:

```ts
it("rejects the temporary draft outcome", () => {
  const result = coverageOutcomeSchema.safeParse({
    status: "draft",
    plannedArea: "climate",
  });
  expect(result.success).toBe(false);
});
```

- [ ] **Step 2: Run the focused test and confirm RED**

Run:

```powershell
npm test -- src/lib/content/__tests__/coverage.test.ts
```

Expected: FAIL because `coverageOutcomeSchema` still accepts `draft`.

- [ ] **Step 3: Remove draft from production code**

Delete the `draft` Zod branch and its documentation from `coverage.ts`. Remove `draft` from `COVERAGE_STATUSES` and the `evidenceIds` switch in the coverage page. Remove the draft label, badge, render branch, and obsolete CSS class from `CoverageTable.tsx` and `sources.module.css`.

The remaining status list is:

```ts
const COVERAGE_STATUSES: CoverageStatus[] = [
  "retained",
  "duplicate",
  "conflict",
];
```

- [ ] **Step 4: Run focused and content verification and confirm GREEN**

Run:

```powershell
npm test -- src/lib/content/__tests__/coverage.test.ts
npm run validate:content
```

Expected: both commands pass.

- [ ] **Step 5: Commit the final coverage contract**

```powershell
git add src/lib/content/__tests__/coverage.test.ts src/lib/content/coverage.ts src/app/sources/coverage/page.tsx src/components/sources/CoverageTable.tsx src/components/sources/sources.module.css
git -c user.name="Timur" -c user.email="206328117+timnik82@users.noreply.github.com" commit -m "refactor: finalize coverage outcomes"
```

### Task 3: Audit content consistency and template readiness

**Files:**
- Modify only when an inconsistency is found: `content/**/*.md`, `content/**/*.json`, `src/config/guide.ts`, `src/components/**/*.tsx`
- Read: `src/lib/ranking/weights.ts`
- Read: `research/evidence/*.json`

- [ ] **Step 1: Check ranking, route, date, and climate contracts**

Use `rg` and the content validator to compare every displayed ranking label with the canonical 20/15/10/15/10/15/15 weights; compare each route's declared duration with its numbered days and linked place IDs; scan price, water-quality, and schedule records for `checkedAt`; and find any use of “forecast” around climate-normal values.

Run:

```powershell
npm run validate:content
rg -n "forecast|normal|checkedAt|duration|weight" content src research/evidence
```

- [ ] **Step 2: Check the template guardrail**

Search shared application code for `Brittany`, region-specific dates, airports, party size, and scoring assumptions. Keep occurrences sourced from `guideConfig` or content; replace only avoidable hardcoded trip assumptions in shared code with the existing config value.

```powershell
rg -n "Brittany|2026-08|LIS|OPO|family of|10-year" src --glob '!src/config/guide.ts'
```

- [ ] **Step 3: Apply only evidenced corrections**

Edit the exact content/config/component files identified by Steps 1–2. Do not rewrite prose that is merely stylistically imperfect, add multi-region runtime support, or create tests for static copy.

- [ ] **Step 4: Verify and commit any corrections**

Run:

```powershell
npm run validate:content
npm run typecheck
```

Expected: both pass. If no defects were found, make no commit. Otherwise stage only the corrected paths and commit with `fix: align guide content contracts`.

### Task 4: Preserve the single end-to-end release journey

**Files:**
- Modify: `tests/e2e/smoke.spec.ts` only if the current journey is missing a required user-level action
- Read: `playwright.config.ts`

- [ ] **Step 1: Compare the existing smoke journey with acceptance**

Confirm it redirects an unauthenticated visitor to login, submits the committed test-only password, reaches the home guide, opens one attraction, and opens one route. Prefer clicking stable accessible links where that represents the actual user journey; keep direct navigation only when no canonical link exists.

- [ ] **Step 2: Run the existing journey before editing**

```powershell
npm run test:e2e
```

Expected: one Chromium test passes. If it already proves the complete acceptance journey, do not add another test. If a required user action is absent, adjust this one test and rerun it to green.

- [ ] **Step 3: Commit only if the journey changed**

```powershell
git add tests/e2e/smoke.spec.ts
git -c user.name="Timur" -c user.email="206328117+timnik82@users.noreply.github.com" commit -m "test: complete release smoke journey"
```

### Task 5: Add focused print behavior

**Files:**
- Create: `src/app/print.css`
- Modify: `src/app/layout.tsx`
- Modify only if inspection exposes a defect: relevant `*.module.css`

- [ ] **Step 1: Add and import the print stylesheet**

Import `./print.css` after `./globals.css` in `src/app/layout.tsx`. The stylesheet uses `@media print` to hide site navigation, skip links, forms, buttons, and audio controls; remove decorative shadows/backgrounds; avoid splitting headings and table rows; allow tables and long URLs to wrap; and append visible `http` link destinations without duplicating fragment/internal links.

- [ ] **Step 2: Build and inspect one representative print preview**

Run `npm run build`, start the app with Playwright test credentials, sign in, and inspect the longest representative content page in print emulation. Confirm headings, tables, citations, and URLs remain readable. This configuration/CSS task intentionally uses build plus manual print verification instead of a brittle screenshot test.

- [ ] **Step 3: Commit print behavior**

```powershell
git add src/app/print.css src/app/layout.tsx
git -c user.name="Timur" -c user.email="206328117+timnik82@users.noreply.github.com" commit -m "style: add readable print output"
```

### Task 6: Add GitHub Actions CI

**Files:**
- Create: `.github/workflows/ci.yml`
- Modify: `README.md`

- [ ] **Step 1: Create the workflow**

Configure `pull_request` and pushes to `main`, `permissions: contents: read`, concurrency cancellation, Node 24 with npm cache, `npm ci`, cached Playwright Chromium binaries, `npx playwright install --with-deps chromium`, then:

```text
npm run validate:content
npm run lint
npm run typecheck
npm test -- --run
npm run build
npm run test:e2e
```

Do not provide Rime, Blob, or production authentication secrets; `playwright.config.ts` supplies test-only auth values to its web server.

- [ ] **Step 2: Document the release checks**

Add a concise README section listing `npm run check` and `npm run test:e2e`, explaining that CI uses test-only auth and mocked/lazy external adapters.

- [ ] **Step 3: Validate configuration locally**

Run the same commands in the workflow order. Expected: every command exits 0 and the only browser test passes.

- [ ] **Step 4: Commit CI**

```powershell
git add .github/workflows/ci.yml README.md
git -c user.name="Timur" -c user.email="206328117+timnik82@users.noreply.github.com" commit -m "ci: add release verification workflow"
```

### Task 7: Representative responsive and accessibility QA

**Files:**
- Modify only if a defect is reproduced: `src/app/globals.css`, relevant `src/components/**/*.module.css`, relevant component file

- [ ] **Step 1: Inspect the representative page set**

With the local production server running, inspect the home page, `/bases`, one longest article, and `/sources/coverage` at 390 px and 1440 px. Check horizontal overflow, long-table scrolling, focus order, skip-link visibility, keyboard access, readable contrast, and reduced-motion behavior.

- [ ] **Step 2: Fix only reproduced release blockers**

For behavioral bugs, first add a focused failing component/unit test and confirm RED. For CSS-only overflow/contrast defects, apply the smallest CSS correction and verify it at both widths; do not add screenshot tests or widen the review matrix.

- [ ] **Step 3: Run complete local acceptance**

```powershell
npm run validate:content
npm run lint
npm run typecheck
npm test -- --run
npm run build
npm run test:e2e
git diff --check
```

Expected: all commands pass, coverage contains no drafts, and representative pages have no release-blocking narrow/wide/print defects.

- [ ] **Step 4: Commit any final QA fixes**

Stage only files changed by reproduced defects. If there are none, make no empty commit.

### Task 8: Publish the draft pull request

**Files:**
- No new repository files

- [ ] **Step 1: Push the feature branch**

```powershell
git push -u origin issue-16-final-qa
```

- [ ] **Step 2: Open the draft PR and link Issue #16**

Create a draft PR summarizing coverage closure, CI, the single smoke journey, print/responsive QA, and exact verification results. Include `Closes #16` and update Issue #16 with the PR link.

- [ ] **Step 3: Review live checks and substantive feedback**

Use `gh` to inspect checks and unresolved threads. Address blockers and regressions; skip non-useful nitpicks. Resolve processed bot threads without replying, per repository instructions.
