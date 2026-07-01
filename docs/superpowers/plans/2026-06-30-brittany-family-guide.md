# Brittany Family Guide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a private, decision-first English family guide for choosing and planning an August 2026 Brittany holiday, with traceable research coverage and cached paragraph narration.

**Architecture:** A Next.js App Router application reads version-controlled Markdown and structured JSON at build time. A typed content compiler validates pages, English evidence records, citations, rankings, and source coverage; runtime server code is limited to password sessions, approved paragraph lookup, Rime Coda generation, and authenticated private Blob delivery.

**Tech Stack:** Next.js App Router, React, TypeScript, CSS Modules and CSS custom properties, Zod, Unified/Remark, React Markdown, Vitest, Testing Library, Playwright, `jose`, `bcryptjs`, Vercel Functions, private Vercel Blob, and Rime Coda.

---

## Implementation references

- [Next.js App Router](https://nextjs.org/docs/app)
- [Next.js authentication guide](https://nextjs.org/docs/app/guides/authentication)
- [Next.js Vitest guide](https://nextjs.org/docs/app/guides/testing/vitest)
- [Next.js Playwright guide](https://nextjs.org/docs/app/guides/testing/playwright)
- [Vercel private Blob storage](https://vercel.com/docs/vercel-blob/private-storage)
- [Rime Coda introduction and HTTP example](https://docs.rime.ai/docs/introduction)

The current Rime documentation exposes Coda HTTP audio as `audio/mpeg`. The implementation therefore stores 24 kHz MP3 instead of adding server-side WebM/Opus transcoding. This changes neither the playback controls nor browser speed adjustment.

## External-source verification rules

The four supplied Deep Research documents are the only source for destination judgment and narrative content. They are not re-verified or second-guessed. A small set of facts changes independently of that research and must instead be checked against live official sources before the relevant content slice ships: flight schedules, accommodation prices and availability for both date windows, attraction opening details and festival dates, and ARS/official water-quality status.

This live verification uses the One CLI, following its standard discovery-before-execution workflow:

```bash
one --agent connection list
one --agent actions search <platform> "<query>" -t execute
one --agent actions knowledge <platform> <actionId>
one --agent actions execute <platform> <actionId> <key> -d '{}'
```

- Accommodation, car hire, and activity prices/availability: Booking.com, via `one --agent`.
- General web and place lookups (ranking corroboration, business details, opening hours): EXA, Tavily/Perplexity, and Google Places, via `one --agent`.
- Official pages (tourist offices, SNCF, ARS, museums, festivals): direct EXA and Firecrawl.
- If a listed connector is no longer available when a PR runs, use the nearest equivalent surfaced by `one --agent connection list` and note the substitution next to the recorded fact.
- Every value obtained this way is written into the relevant `content/facts/*.json` file or evidence record together with its `checkedAt` date. It is recorded as a dated update alongside the original research claim, never as a silent replacement of it.

PR 7 Step 2 (the Porto flight claim) and PR 10 Step 5 (the time-sensitive refresh) apply these rules.

## Risk-based testing strategy

This is a personal information guide for one family. It will be used locally and for a small number of private deployed visits, not by a public or growing audience. Test count is not a delivery goal. This section overrides any generic blanket-TDD instruction to create a test merely because a file, page, or presentational component is new. Existing useful tests may remain when they are cheap and stable.

Add automated tests when a regression could silently corrupt information, calculations, privacy, paid integrations, or a stateful user interaction:

- content parsing, schemas, source checksums, stable identifiers, citations, coverage, links, and freshness rules;
- ranking and bathing calculations, including missing-evidence behavior;
- authentication, authorization, redirect safety, and protection of pages and APIs;
- TTS approval, cache keys, concurrency, private audio delivery, retry behavior, and player state;
- stateful filter parsing or URL serialization when that logic can be tested cheaply outside the browser;
- one end-to-end smoke journey for the whole application: sign in, open the guide, visit one attraction, and open one route.

Do not add automated tests solely for:

- static copy, headings, cards, layout wrappers, or presentational components;
- each regional content slice or each Markdown page when the shared compiler and template are already covered;
- separate browser journeys for Sources, filters, the home page, authentication, TTS, or individual content areas;
- the same behavior at unit, component, and browser levels;
- exhaustive viewport/page combinations better handled by a short representative manual check.

Choose the cheapest layer that proves the behavior. Prefer unit tests for pure transformations, security rules, TTS service behavior, and filter-state logic; use component tests only for the TTS player's meaningful state transitions. Playwright is limited to the single whole-application smoke journey. Content-only and presentational PRs run the existing regression suite and content validator but add no new test files. `npm run check` is a regression gate, not a requirement to manufacture new tests in every PR.

Where an already-created issue asks for broader test creation, this strategy and the narrower verification steps below take precedence.

## Pull-request map

This plan was converted into one GitHub issue per slice in [timnik82/holiday-2026-brittany](https://github.com/timnik82/holiday-2026-brittany/issues). During conversion, the original PR 9, PR 10, and PR 14 were each split into two independently-gravbable issues (routes vs. directory, swimming vs. practical guides, automated QA/CI vs. human-in-the-loop Preview setup). The table below reflects the issue numbering actually in use; PR sections later in this document keep their original numbers and note where they were split.

| # | Outcome | Depends on | Issue |
|---|---|---|---|
| 1 | Runnable Next.js application and test harness | — | [#1](https://github.com/timnik82/holiday-2026-brittany/issues/1) |
| 2 | Typed Markdown content compiler and paragraph manifest | 1 | [#2](https://github.com/timnik82/holiday-2026-brittany/issues/2) |
| 3 | Immutable source corpus, source-block inventory, and validation | 2 | [#3](https://github.com/timnik82/holiday-2026-brittany/issues/3) |
| 4 | English evidence registry, Sources archive, and coverage interface | 3 | [#4](https://github.com/timnik82/holiday-2026-brittany/issues/4) |
| 5 | Ranking engine, six-base dataset, and comparison page | 2, 4 | [#5](https://github.com/timnik82/holiday-2026-brittany/issues/5) |
| 6 | Northern Brittany content and evidence slice | 4, 5 | [#6](https://github.com/timnik82/holiday-2026-brittany/issues/6) |
| 7 | Western Brittany content and evidence slice | 4, 5 | [#7](https://github.com/timnik82/holiday-2026-brittany/issues/7) |
| 8 | Southern Brittany content and evidence slice | 4, 5 | [#8](https://github.com/timnik82/holiday-2026-brittany/issues/8) |
| 9a | Routes (cultural, nature, relaxed-family itineraries) | 6–8 | [#9](https://github.com/timnik82/holiday-2026-brittany/issues/9) |
| 9b | Things-to-do directory and filters | 6–8 | [#10](https://github.com/timnik82/holiday-2026-brittany/issues/10) |
| 10a | Swimming guide and bathing-suitability score | 6–8 | [#11](https://github.com/timnik82/holiday-2026-brittany/issues/11) |
| 10b | Plan-your-trip guides and time-sensitive refresh | 6–8 | [#12](https://github.com/timnik82/holiday-2026-brittany/issues/12) |
| 11 | Personalized decision-first home page | 5, 9a, 9b, 10a, 10b | [#13](https://github.com/timnik82/holiday-2026-brittany/issues/13) |
| 12 | Password authentication across pages and APIs | 1 | [#14](https://github.com/timnik82/holiday-2026-brittany/issues/14) |
| 13 | Rime TTS, private Blob cache, and accessible player | 2, 12 | [#15](https://github.com/timnik82/holiday-2026-brittany/issues/15) |
| 14a | Coverage closure, content consistency, responsive/print/a11y QA, and CI | 4–13 | [#16](https://github.com/timnik82/holiday-2026-brittany/issues/16) |
| 14b | Vercel Preview setup, production secrets, and paid TTS verification (HITL) | 14a | [#17](https://github.com/timnik82/holiday-2026-brittany/issues/17) |

PR 3 begins after PR 2. PR 12 can proceed independently after PR 1. PR 5 begins when PR 4 establishes the evidence contract, and PR 12 must merge before PR 13. PR 14b is the only human-in-the-loop slice — it needs real Vercel/Rime account access and a deliberate decision to spend money, so it cannot be picked up by an autonomous agent.

## Target file structure

```text
content/
  bases/*.md
  plan/*.md
  routes/*.md
  things-to-do/*.md
  swimming/locations.json
  rankings/bases.json
  facts/accommodation.json
  facts/transport.json
research/
  raw/*.md
  blocks/*.json
  evidence/*.json
  source-manifest.json
  block-decisions.json
  coverage.json
scripts/
  content/build-source-blocks.ts
  content/validate-content.ts
  auth/hash-password.ts
src/
  app/
  components/
  lib/auth/
  lib/content/
  lib/ranking/
  lib/tts/
tests/
  e2e/
```

Synthesized Markdown paragraphs use an explicit metadata comment immediately before each narrated paragraph:

```md
<!-- paragraph id="saint-malo-verdict" sources="evidence:saint-malo-balanced-base,evidence:saint-malo-logistics" -->
Saint-Malo is the strongest all-round base when history and easy logistics matter as much as beach time.
```

The compiler removes the comment from rendered output, applies the ID to the paragraph, validates every English evidence reference, and adds approved English text to the server-only narration manifest. Evidence records provide the link back to original-language source blocks.

## PR 1: Scaffold the application and quality gates

**Outcome:** The repository runs locally without replacing the existing research and planning documents.

**Files:**

- Create: `package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`
- Create: `vitest.config.mts`, `vitest.setup.ts`, `playwright.config.ts`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- Create: `src/components/SiteShell.tsx`, `src/components/SiteShell.module.css`
- Create: `src/components/SiteShell.test.tsx`, `tests/e2e/smoke.spec.ts`
- Modify: `.gitignore`, `README.md`

- [ ] **Step 1: Initialize the package without running a generator over the non-empty repository**

Run:

```bash
npm init -y
npm install next@latest react@latest react-dom@latest
npm install -D typescript @types/node @types/react @types/react-dom eslint eslint-config-next vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom vite-tsconfig-paths @playwright/test
```

Expected: `package.json` and `package-lock.json` are created; existing `README.md`, `docs/`, and `research/` remain unchanged.

- [ ] **Step 2: Add deterministic scripts and configuration**

Set the scripts in `package.json` to:

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint .",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:e2e": "playwright test",
  "check": "npm run lint && npm run typecheck && npm run test && npm run build"
}
```

Configure Vitest with `jsdom`, `vite-tsconfig-paths`, React, globals, and `vitest.setup.ts`. Configure Playwright for Chromium against `npm run dev -- --hostname 127.0.0.1` on port 3000 with `reuseExistingServer: !process.env.CI`.

- [ ] **Step 3: Write the first failing shell test**

```tsx
import { render, screen } from '@testing-library/react';
import { SiteShell } from './SiteShell';

it('exposes the primary planning destinations', () => {
  render(<SiteShell><p>Guide</p></SiteShell>);
  expect(screen.getByRole('link', { name: 'Compare bases' })).toHaveAttribute('href', '/bases');
  expect(screen.getByRole('link', { name: 'Routes' })).toHaveAttribute('href', '/routes');
  expect(screen.getByRole('link', { name: 'Swimming' })).toHaveAttribute('href', '/swimming');
});
```

Run `npm test -- src/components/SiteShell.test.tsx`. Expected: FAIL because `SiteShell` does not exist.

- [ ] **Step 4: Implement the accessible application shell and temporary real status page**

Create `SiteShell` with a skip link, semantic header/nav/main/footer, the agreed primary navigation, and `Sources` in utility navigation. The home page must say that the guide is being assembled from the supplied research; do not add invented destination content.

- [ ] **Step 5: Add a browser smoke test**

```ts
import { expect, test } from '@playwright/test';

test('home exposes the guide purpose and navigation', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Brittany');
  await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible();
});
```

Run `npx playwright install chromium`, then `npm run check` and `npm run test:e2e`. Expected: all commands pass.

- [ ] **Step 6: Commit PR 1**

```bash
git add package.json package-lock.json next.config.ts tsconfig.json eslint.config.mjs vitest.config.mts vitest.setup.ts playwright.config.ts src tests .gitignore README.md
git commit -m "feat: scaffold Brittany guide application"
```

## PR 2: Build the typed content compiler

**Outcome:** Trusted Markdown produces validated metadata, rendered articles, citations, static route params, and a server-only paragraph manifest.

**Files:**

- Create: `src/lib/content/schemas.ts`, `types.ts`, `files.ts`, `parse.ts`, `paragraphs.ts`, `registry.ts`
- Create: `src/lib/content/__tests__/parse.test.ts`, `registry.test.ts`
- Create: `src/components/content/MarkdownArticle.tsx`, `CitationLink.tsx`, `TableOfContents.tsx`
- Create: `content/plan/about-this-guide.md`
- Create: `scripts/content/validate-content.ts`
- Modify: `package.json`

- [ ] **Step 1: Install the content dependencies**

```bash
npm install zod gray-matter unified remark-parse remark-gfm react-markdown unist-util-visit mdast-util-to-string server-only
npm install -D tsx
```

Add `"validate:content": "tsx scripts/content/validate-content.ts"` before `build` in the `check` script.

- [ ] **Step 2: Define the shared page contract**

```ts
export const pageFrontmatterSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1),
  summary: z.string().min(1),
  updatedAt: z.iso.date(),
  status: z.enum(['draft', 'reviewed', 'verified']),
});

export type ParagraphRecord = {
  id: string;
  pageSlug: string;
  text: string;
  textHash: string;
  sourceRefs: string[];
};
```

Add specific schemas for bases, routes, things to do, and practical pages by extending the shared contract.

- [ ] **Step 3: Write parser tests before implementation**

Test that the compiler:

- removes the metadata comment;
- assigns the declared paragraph ID;
- extracts comma-separated English evidence references;
- hashes normalized text with SHA-256;
- rejects duplicate IDs, missing metadata, and narration paragraphs over Rime's 500-character request limit;
- ignores headings, lists, tables, captions, and non-English original source pages for narration.

Run `npm test -- src/lib/content/__tests__/parse.test.ts`. Expected: FAIL because the parser does not exist.

- [ ] **Step 4: Implement parsing and the server-only manifest**

Use Unified to inspect top-level Markdown nodes. Match only comments with this exact grammar:

```ts
const paragraphComment = /^<!-- paragraph id="([a-z0-9-]+)" sources="([a-z0-9:,.-]+)" -->$/;
```

The immediately following paragraph becomes narratable. `paragraphs.ts` imports `server-only`, and no client component may import it.

- [ ] **Step 5: Implement rendering and validation**

`MarkdownArticle` renders GFM through `react-markdown`, converts evidence references to links under `/sources/coverage`, and provides a generated table of contents. The validation script loads every content file and exits non-zero with file path plus reason for any schema, ID, link, or citation failure.

- [ ] **Step 6: Add one real explanatory content page**

`content/plan/about-this-guide.md` explains the decision-first method, ranking transparency, source preservation, and freshness labels. Every factual paragraph uses valid evidence references only after PR 4; until then this methodology page contains no destination claims and does not need citations.

- [ ] **Step 7: Verify and commit PR 2**

Run `npm run validate:content`, `npm test`, and `npm run build`. Expected: PASS and one generated practical page.

```bash
git add package.json package-lock.json src content scripts
git commit -m "feat: add typed Markdown content compiler"
```

## PR 3: Ingest and inventory the research corpus

**Outcome:** The four supplied research files are committed unchanged, divided into stable reviewable blocks, and protected by checksums.

**Files:**

- Add unchanged: `research/raw/ChatGPT.md`, `Gemini-Britany.md`, `OperaAI.md`, `Perplexity.md`
- Create: `research/source-manifest.json`, `research/block-decisions.json`, `research/blocks/*.json`
- Create: `src/lib/content/source-blocks.ts`, `source-validation.ts`
- Create: `src/lib/content/__tests__/source-blocks.test.ts`
- Create: `scripts/content/build-source-blocks.ts`
- Modify: `scripts/content/validate-content.ts`, `research/raw/README.md`, `package.json`

- [ ] **Step 1: Record immutable document metadata and checksums**

Each source entry must follow:

```json
{
  "slug": "chatgpt",
  "path": "research/raw/ChatGPT.md",
  "language": "ru",
  "sha256": "deb872d50b4b032713308fd21a33886403776be7bea77525f367390b58014742",
  "stopHeadings": ["Источники", "Works cited"]
}
```

Compute hashes with `shasum -a 256 research/raw/*.md`; paste the real values into the manifest. Validation fails if a raw source changes without a new revision entry.

- [ ] **Step 2: Write source-block extraction tests**

Fixtures must prove that headings establish context, top-level paragraphs/lists/tables become sequential IDs such as `chatgpt:b001`, footnote definitions and bibliographies are excluded, and source order is stable.

- [ ] **Step 3: Implement and run block extraction**

Add `"build:source-blocks": "tsx scripts/content/build-source-blocks.ts"`. The command writes deterministic JSON containing ID, heading path, node type, original Markdown, and source line range.

Run `npm run build:source-blocks` twice and then `git diff --exit-code research/blocks`. Expected: the second run makes no changes.

- [ ] **Step 4: Review substantive-block decisions**

`research/block-decisions.json` must contain an explicit decision for every extracted block:

```json
{
  "chatgpt:b001": { "substantive": true },
  "perplexity:b001": { "substantive": false, "reason": "Original user prompt" }
}
```

Only prompts, branding, source lists, and formatting-only blocks may be marked non-substantive. Validation rejects missing decisions and a non-substantive decision without a reason.

- [ ] **Step 5: Verify and commit PR 3**

Run `npm run validate:content`, `npm test`, and `git diff --check`. Expected: all four source hashes match and every block has a decision.

```bash
git add research src/lib/content scripts/content package.json
git commit -m "docs: ingest Brittany research corpus"
```

## PR 4: Build the English evidence registry and Sources archive

**Outcome:** Original documents remain unchanged in their own language, while concise English evidence records provide the auditable input for synthesis.

**Files:**

- Create: `research/evidence/registry.json`, `research/coverage.json`
- Create: `src/app/sources/page.tsx`, `src/app/sources/[slug]/page.tsx`, `src/app/sources/coverage/page.tsx`
- Create: `src/components/sources/EvidenceCard.tsx`, `CoverageTable.tsx`, styles
- Create: `src/lib/content/evidence.ts`, `coverage.ts`, tests

- [ ] **Step 1: Define and test the English evidence contract**

```ts
const evidenceSchema = z.object({
  id: z.string().regex(/^evidence:[a-z0-9-]+$/),
  text: z.string().min(1),
  kind: z.enum(['fact', 'recommendation', 'price', 'warning', 'qualification']),
  sourceBlockRefs: z.array(z.string()).min(1),
  sourceUrls: z.array(z.url()),
  qualifiers: z.array(z.string()),
  timeSensitive: z.boolean(),
  checkedAt: z.iso.date().optional(),
});
```

Require `checkedAt` when `timeSensitive` is true. Each record is written directly in English from one or more agreeing source blocks; it is not a block-by-block translation. Numeric values, dates, caveats, and supporting URLs must remain auditable.

- [ ] **Step 2: Define and test the coverage contract**

```ts
const outcomeSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('draft'), plannedArea: z.string().min(1) }),
  z.object({ status: z.literal('retained'), evidenceIds: z.array(z.string()).min(1), paragraphIds: z.array(z.string()).min(1) }),
  z.object({ status: z.literal('duplicate'), retainedEvidenceId: z.string().min(1) }),
  z.object({ status: z.literal('conflict'), conflictId: z.string(), evidenceIds: z.array(z.string()).min(2), paragraphIds: z.array(z.string()).min(1) }),
]);
```

Validation requires exactly one outcome for every substantive block. During content PRs, coverage can be incomplete only when `status` is explicitly `draft`; PR 14 removes this temporary allowance.

- [ ] **Step 3: Implement the source index and original-document pages**

The index shows document, original language, checksum, and substantive block count. A document page renders only the unchanged original Markdown in its supplied language while preserving headings, tables, lists, and links. It links each source block to the coverage view; it does not offer or imply a full English translation.

- [ ] **Step 4: Implement English evidence, coverage, and conflict views**

The table filters by source and outcome, displays the concise English evidence beside its original block link, connects retained evidence to guide paragraphs, links duplicates to retained evidence, and groups conflicting English claims with source dates and planning interpretation.

- [ ] **Step 5: Check one representative Sources path manually**

Keep contract and transformation coverage in `src/lib/content` tests. Manually open one original-language document, follow one source-block deep link, change the coverage filter, and confirm one representative conflict contains two English claims. Do not add browser or component render tests for these presentational views.

- [ ] **Step 6: Verify and commit PR 4**

Run `npm run check`, then perform the short manual Sources check above. Expected: archive and coverage routes render successfully.

```bash
git add research/evidence research/coverage.json src/app/sources src/components/sources src/lib/content
git commit -m "feat: add English evidence and source archive"
```

## PR 5: Implement rankings and the six-base comparison

**Outcome:** The agreed priorities produce an explainable, tested base ranking.

**Files:**

- Create: `content/rankings/bases.json`
- Create: `research/evidence/rankings.json`
- Create: `src/lib/ranking/weights.ts`, `calculate.ts`, tests
- Create: `src/app/bases/page.tsx`
- Create: `src/components/bases/BaseComparison.tsx`, `ScoreBreakdown.tsx`, styles

- [ ] **Step 1: Encode the approved weights**

```ts
export const FAMILY_WEIGHTS = {
  climate: 0.20,
  nature: 0.15,
  culture: 0.10,
  familyActivities: 0.15,
  logistics: 0.10,
  accommodation: 0.15,
  food: 0.15,
} as const;
```

The test must assert the weights sum to exactly 1 and must fail if a key is added without a weight.

- [ ] **Step 2: Write ranking behavior tests**

Test weighted totals, stable tie-breaking by slug, and missing evidence. A missing dimension yields `total: null` plus a confidence ratio; it is never treated as zero, average, or five. The comparison components are presentational and do not need separate unit tests.

- [ ] **Step 3: Extract and review ranking evidence**

Create English evidence records for every base and each of the seven ranking dimensions. Preserve disagreements between source rankings, retain source-block references, and use concise claims rather than translating surrounding prose.

- [ ] **Step 4: Add the six reviewed base records**

Create records for Saint-Malo/Dinan, Côte de Granit Rose, Brest/Finistère, Quimper/South Finistère, Vannes/Carnac/Morbihan, and Crozon/Douarnenez. Every component score requires rationale and English evidence references; those evidence records provide the links to original source blocks.

- [ ] **Step 5: Build the comparison interface**

Show the weighted total, seven component scores, confidence, “best for”, compromises, expected car need, and price band. On narrow screens use stacked cards; at wide widths use a comparison table without horizontal page overflow.

- [ ] **Step 6: Verify and commit PR 5**

Run `npm test -- src/lib/ranking`, `npm run validate:content`, and `npm run build`; manually spot-check the comparison once at narrow and wide widths. Expected: deterministic ranking and no missing score evidence.

```bash
git add content/rankings research/evidence/rankings.json src/lib/ranking src/app/bases src/components/bases
git commit -m "feat: add explainable base comparison"
```

## PR 6: Publish the northern Brittany content and evidence slice

**Outcome:** Audited English evidence produces two complete base pages and their northern day-trip content.

**Files:**

- Create: `content/bases/saint-malo-dinan.md`, `cote-de-granit-rose.md`
- Create: `content/things-to-do/{saint-malo-walls,bon-secours,grand-aquarium,dinan,cap-frehel-fort-la-latte,cancale,mont-saint-michel,ploumanach,sept-iles,parc-du-radome,paimpol-brehat}.md`
- Create: `research/evidence/northern.json`
- Create: `src/app/bases/[slug]/page.tsx`
- Create: `src/components/bases/BaseHero.tsx`, `BaseFacts.tsx`, `RelatedPlaces.tsx`
- Modify: `research/coverage.json`

- [ ] **Step 1: Add dynamic base routing from the content registry**

Use `generateStaticParams()` from reviewed base slugs and `notFound()` for unknown slugs. The template renders verdict, score breakdown, climate, swimming, transport, accommodation, food, rainy-day options, related places, routes, and citations.

- [ ] **Step 2: Extract and review northern English evidence**

Read all source blocks concerning Saint-Malo, Dinan, Côte de Granit Rose, Paimpol, Bréhat, and their linked places. Create concise English evidence records that preserve unique facts, numbers, qualifications, warnings, recommendations, and URLs. Consolidate agreeing blocks; keep conflicting claims as separate records under one `conflictId`.

- [ ] **Step 3: Synthesize Saint-Malo/Dinan**

Retain unique facts from all four research documents, expose disagreements about price and ranking, separate climate normals from forecast language, and include tide safety prominently.

- [ ] **Step 4: Synthesize Côte de Granit Rose**

Cover Perros-Guirec, Trégastel, Lannion access, Ploumanac'h, Sept-Îles, Parc du Radôme, beaches, car trade-offs, and science-family appeal.

- [ ] **Step 5: Add canonical northern Things to do pages**

Each page includes base links, visit duration, age fit, weather fit, booking, transport, safety, price/check date where relevant, and paragraph evidence references. Paimpol/Bréhat remains a linked area/day trip rather than a seventh base.

- [ ] **Step 6: Close coverage for the northern slice**

Map each northern substantive block to retained evidence and paragraphs, a documented duplicate, or a conflict. Run `npm run validate:content`; expected: no northern draft outcomes remain.

- [ ] **Step 7: Verify and commit PR 6**

Run `npm run validate:content` and `npm run check`; manually open one northern base and one linked place through the shared templates. Do not add a northern-specific Playwright test.

```bash
git add content/bases content/things-to-do src/app/bases src/components/bases research/evidence/northern.json research/coverage.json
git commit -m "feat: add northern Brittany guide content"
```

## PR 7: Publish the western Brittany content and evidence slice

**Outcome:** Audited English evidence produces complete Brest, Quimper, and Crozon pages, with Morlaix/Roscoff retained as linked area content.

**Files:**

- Create: `content/bases/brest-finistere.md`, `quimper-south-finistere.md`, `crozon-douarnenez.md`
- Create: `content/things-to-do/{oceanopolis,chateau-de-brest,crozon-pen-hir,morgat,maison-des-mineraux,quimper,locronan,concarneau,pont-aven,benodet,haliotika,pointe-du-raz,morlaix-roscoff}.md`
- Create: `research/evidence/western.json`
- Modify: `research/coverage.json`

- [ ] **Step 1: Extract and review western English evidence**

Create concise records for Brest, Finistère, Quimper, Crozon, Douarnenez, Morlaix, Roscoff, and linked places. Preserve source-block references, numbers, caveats, warnings, and URLs; consolidate only genuinely agreeing claims.

- [ ] **Step 2: Synthesize Brest/Finistère**

Cover the direct Porto flight claim with a fresh official check using the [external-source verification rules](#external-source-verification-rules), airport access, Océanopolis, maritime museum, city-without-car option, and car-dependent coastal extensions.

- [ ] **Step 3: Synthesize Quimper/South Finistère**

Cover cultural strengths, beach access, Locronan, Concarneau, Pont-Aven, Bénodet, family rainy-day options, and the relevant August 2026 festival only after checking its official dates.

- [ ] **Step 4: Synthesize Crozon/Douarnenez**

Cover wild-coast strengths, wind/rain trade-offs, Morgat, Pen-Hir, safe viewpoints, car dependency, and the restricted-access status of Plage de l'Île Vierge.

- [ ] **Step 5: Add canonical western Things to do pages**

Morlaix/Roscoff is represented as a linked area guide, not a base. Every changeable transport, opening, event, or safety claim has a checked date.

- [ ] **Step 6: Close coverage and commit PR 7**

Run `npm run validate:content` and `npm run check`; manually spot-check one western base and one linked place through the already-covered shared templates. Expected: no western draft outcomes. Do not add western-specific browser tests.

```bash
git add content/bases content/things-to-do research/evidence/western.json research/coverage.json
git commit -m "feat: add western Brittany guide content"
```

## PR 8: Publish the southern Brittany content and evidence slice

**Outcome:** Audited English evidence produces Vannes/Carnac/Morbihan and the relaxed-family supporting places.

**Files:**

- Create: `content/bases/vannes-carnac-morbihan.md`
- Create: `content/things-to-do/{carnac-alignments,vannes,ile-aux-moines,ile-d-arz,suscinio,quiberon,branfere,broceliande,lac-de-tremelin,auray-saint-goustan}.md`
- Create: `research/evidence/southern.json`
- Modify: `research/coverage.json`

- [ ] **Step 1: Extract and review southern English evidence**

Create concise records for Vannes, Carnac, Morbihan, Quiberon, islands, Brocéliande, Lac de Trémelin, and linked places. Preserve every unique fact, value, caveat, warning, and source URL while consolidating agreeing blocks.

- [ ] **Step 2: Synthesize the southern base**

Cover Vannes as the lower-car option, Carnac as the beach/megalith option, protected water, heat trade-off, islands, accommodation pressure, food strengths, and Nantes transfer logic.

- [ ] **Step 3: Add canonical southern Things to do pages**

Include family visit profiles, booking/transport needs, weather fit, safety, price/check date, and evidence references for every place.

- [ ] **Step 4: Preserve inland relaxed-route evidence**

Create Brocéliande and Lac de Trémelin pages so their research is not forced into the coastal base article. Link them to the relaxed route and relevant practical transport guidance.

- [ ] **Step 5: Close coverage and commit PR 8**

Run `npm run validate:content` and `npm run check`; manually spot-check the southern base through the already-covered shared template. Expected: no southern draft outcomes. Do not add a southern-specific browser test.

```bash
git add content/bases content/things-to-do research/evidence/southern.json research/coverage.json
git commit -m "feat: add southern Brittany guide content"
```

## PR 9: Add routes and the Things to do directory

> Split into two GitHub issues for tracking: routes ([#9](https://github.com/timnik82/holiday-2026-brittany/issues/9)) and the Things-to-do directory ([#10](https://github.com/timnik82/holiday-2026-brittany/issues/10)). Steps 1–3 and 6 (route evidence, authoring, route templates, route coverage) belong to #9; steps 4–5 (filter tests, directory/place templates) belong to #10. They have no dependency on each other beyond the shared #6–#8 prerequisite.

**Outcome:** Readers can choose a travel style and browse canonical activities without duplicated articles.

**Files:**

- Create: `content/routes/cultural.md`, `nature.md`, `relaxed-family.md`
- Create: `research/evidence/routes.json`
- Create: `src/app/routes/page.tsx`, `src/app/routes/[slug]/page.tsx`
- Create: `src/app/things-to-do/page.tsx`, `src/app/things-to-do/[slug]/page.tsx`
- Create: `src/components/routes/RouteTimeline.tsx`
- Create: `src/components/places/PlaceFilters.tsx`, `PlaceCard.tsx`; test only the stateful filter behavior
- Modify: `research/coverage.json`

- [ ] **Step 1: Extract and review cross-region route evidence**

Create English evidence records for travel sequencing, transfer times, recommended stay lengths, pace, and route-level trade-offs that are not already represented by the geographic evidence files. Link every record to original source blocks and consolidate duplicates.

- [ ] **Step 2: Author the three complete routes**

Use the approved shapes:

- cultural, 9 days: Saint-Malo/Dinan and Quimper;
- nature, 10 days: Côte de Granit Rose and Crozon;
- relaxed family swimming, 8 days: Vannes/Carnac and Brocéliande/Lac de Trémelin.

Each day specifies base, travel burden, main activity, weather alternative, linked place IDs, and evidence references.

- [ ] **Step 3: Build route templates and comparison**

Show duration, pace, number of accommodation changes, car requirement, best-fit statement, and day-by-day timeline. Links always target canonical base/place pages.

- [ ] **Step 4: Test only reusable filter-state logic**

If filter parsing and URL serialization are extracted as reusable logic, test valid and unknown values there. Do not add a browser suite or presentational card tests. Filters remain encoded in URL search parameters and usable without pointer input.

- [ ] **Step 5: Implement directory and place templates**

The directory renders all reviewed places. Unknown filters fall back to the unfiltered list with a visible correction message; unknown place slugs return not found.

- [ ] **Step 6: Close route/activity coverage and commit PR 9**

Run `npm run validate:content`, any focused filter-state tests, and `npm run build`. Manually try one directory filter and open one route through the shared template. Do not add feature-specific Playwright tests.

```bash
git add content/routes research/evidence/routes.json src/app/routes src/app/things-to-do src/components/routes src/components/places research/coverage.json
git commit -m "feat: add routes and activity directory"
```

## PR 10: Add Swimming and Plan your trip

> Split into two GitHub issues for tracking: Swimming ([#11](https://github.com/timnik82/holiday-2026-brittany/issues/11)) and Plan-your-trip ([#12](https://github.com/timnik82/holiday-2026-brittany/issues/12)). Steps 1, 3, and the water/safety portion of step 2 belong to #11; steps 4–5 and the transport/accommodation/food portion of step 2 belong to #12. Step 6 (freshness UI) is shared — `FreshnessLabel` lives in #12 and #11 reuses or locally duplicates it; see the issue bodies for the current split.

**Outcome:** Shared practical decisions and swimming safety are detailed, dated, and not duplicated across bases.

**Files:**

- Create: `content/swimming/locations.json`
- Create: `content/plan/getting-there.md`, `getting-around.md`, `weather.md`, `accommodation-budget.md`, `food.md`
- Create: `content/facts/accommodation.json`, `transport.json`
- Create: `research/evidence/practical.json`
- Create: `src/app/swimming/page.tsx`, `src/app/plan/[slug]/page.tsx`
- Create: `src/lib/ranking/bathing.ts`, tests
- Create: `src/components/swimming/SwimmingComparison.tsx`, `FreshnessLabel.tsx`
- Modify: `research/coverage.json`

- [ ] **Step 1: Define and test bathing scoring**

Use equal weight for temperature/shelter, tides, easy access, lifeguards, water quality, and alternatives. Missing official water-quality evidence produces no total and a visible confidence warning.

- [ ] **Step 2: Extract and review practical English evidence**

Create English evidence records for climate, water conditions, transport, accommodation, food, prices, and safety. Keep conflicting values separate, mark time-sensitive records, and retain original source-block references and URLs.

- [ ] **Step 3: Add swimming records**

Include Bon-Secours, Lac de Trémelin, Lac de Guerlédan, Lac au Duc, representative monitored coastal beaches, and any additional officially monitored location supported by the research. Every record has official-source URL, checked date, warning status, and linked bases.

- [ ] **Step 4: Author the five shared practical guides**

Separate climate normals from forecasts. Explain LIS/OPO access, car trade-offs, August packing, realistic accommodation thresholds, and family food. The food guide receives prominence equal to accommodation in links and summaries, matching the 15% ranking weight.

- [ ] **Step 5: Perform the time-sensitive refresh**

Using the [external-source verification rules](#external-source-verification-rules), verify official flight schedules, SNCF travel times, official attraction details, ARS/water-quality status, and live accommodation samples for both date windows. Record values and `checkedAt`; do not silently replace research claims.

- [ ] **Step 6: Build freshness UI and stale behavior**

Facts older than their configured review window render “Needs recheck” rather than disappearing. The build fails only for missing checked dates, not merely because time passes.

- [ ] **Step 7: Verify and commit PR 10**

Run bathing tests, `npm run validate:content`, `npm run check`, and a 390 px swimming-page browser check.

```bash
git add content/swimming content/plan content/facts research/evidence/practical.json src/app/swimming src/app/plan src/lib/ranking/bathing.ts src/components/swimming research/coverage.json
git commit -m "feat: add swimming and trip planning guides"
```

## PR 11: Build the personalized decision-first home page

**Outcome:** The home page answers the family's decision in the approved order and links into all deeper content.

**Files:**

- Modify: `src/app/page.tsx`
- Create: `src/components/home/Verdict.tsx`, `TopBases.tsx`, `DateWindows.tsx`, `RouteChoices.tsx`, `CriticalWarnings.tsx`

- [ ] **Step 1: Implement the approved answer order**

Render: suitability verdict, three leading bases, complete comparison link, date-window differences, three route choices, and material warnings. Each summary is computed from reviewed content and ranking data, not copied into a second data source.

- [ ] **Step 2: Add transparent personalization**

State family size, child age, origin airports, date windows, and budget assumptions. Provide an “About this recommendation” link rather than presenting the ranking as universal.

- [ ] **Step 3: Verify and commit PR 11**

Run `npm run check`, then inspect the home page once at narrow and wide widths and follow one recommendation link. The static home sections do not need component or feature-specific browser tests.

```bash
git add src/app/page.tsx src/components/home
git commit -m "feat: add personalized guide home"
```

## PR 12: Protect the application with password sessions

**Outcome:** Pages, RSC requests, source content, APIs, and later audio delivery share one stateless private-family session.

**Files:**

- Create: `src/lib/auth/session.ts`, `password.ts`, `require-session.ts`, tests
- Create: `src/app/login/page.tsx`, `actions.ts`, styles
- Create: `src/proxy.ts`
- Create: `scripts/auth/hash-password.ts`
- Create: `.env.example`
- Modify: `.gitignore`, `package.json`

- [ ] **Step 1: Install and test auth primitives**

```bash
npm install jose bcryptjs
npm install -D @types/bcryptjs
```

Tests cover valid/invalid bcrypt password, valid/expired/tampered JWT, constant cookie name, and missing environment variables.

- [ ] **Step 2: Implement the stateless session**

Use `AUTH_SECRET` with `jose` HS256 and payload `{ authenticated: true, expiresAt }`. Set `brittany_session` as `httpOnly`, `secure` in production, `sameSite: 'lax'`, `path: '/'`, with a 30-day expiry.

- [ ] **Step 3: Implement login and logout**

Compare submitted password only with `SITE_PASSWORD_HASH`. Return the same visible error for blank and incorrect passwords. Preserve a validated same-origin `next` path and reject external redirect targets.

- [ ] **Step 4: Add optimistic Proxy and secure route checks**

`src/proxy.ts` redirects unauthenticated page/RSC requests to `/login`. Every API route must also call `requireSession()`; Proxy is not treated as the sole security boundary.

- [ ] **Step 5: Test the security rules at the focused layer**

Focused tests cover blank/wrong password handling, safe same-origin redirects, rejection of external redirect targets, expired/tampered sessions, and direct API authorization through `requireSession()`. The final whole-application smoke journey proves successful browser login; do not add a separate authentication browser suite.

- [ ] **Step 6: Verify and commit PR 12**

Run focused auth tests with temporary local secrets and `npm run check`. Manually confirm login and logout once. Confirm `.env*` is ignored except `.env.example`.

```bash
git add src/lib/auth src/app/login src/proxy.ts scripts/auth .env.example .gitignore package.json package-lock.json tests
git commit -m "feat: protect private family guide"
```

## PR 13: Add cached paragraph narration

**Outcome:** Approved English paragraphs generate once through Rime Coda, live in private Blob, and play through one accessible global controller.

**Files:**

- Create: `src/lib/tts/config.ts`, `cache-key.ts`, `rime.ts`, `blob.ts`, `locks.ts`, `service.ts`, tests
- Create: `src/app/api/tts/route.ts`, `src/app/api/audio/[cacheKey]/route.ts`
- Create: `src/components/tts/AudioProvider.tsx`, `ListenButton.tsx`, styles and tests
- Modify: `src/app/layout.tsx`, `.env.example`, `package.json`

- [ ] **Step 1: Install Blob and write contract tests**

```bash
npm install @vercel/blob
```

Mock Rime and Blob at the service boundary. Test unauthenticated access, rejection of malformed or unknown paragraph requests, cache hit versus miss, changed text producing a new key, retryable upstream failure, and private audio authorization. Keep each behavior at one test layer rather than repeating route, service, and browser assertions for the same case.

- [ ] **Step 2: Implement deterministic cache keys**

```ts
const TTS_PROFILE = {
  modelId: 'coda',
  speaker: 'astra',
  language: 'en',
  samplingRate: 24000,
  contentType: 'audio/mpeg',
} as const;
```

Hash the serialized profile plus paragraph `textHash`. Store audio at `tts/<cacheKey>.mp3` with `access: 'private'`, `addRandomSuffix: false`, and no overwrite.

- [ ] **Step 3: Implement the Rime adapter**

POST to `https://users.rime.ai/v1/rime-tts` with bearer `RIME_API_KEY`, `Accept: audio/mpeg`, and body containing approved text, `modelId`, `speaker`, `language`, and `samplingRate`. Apply an abort timeout and map 401/403 to configuration failure, 429 to retryable quota/rate limit, and 5xx/network errors to retryable upstream failure.

- [ ] **Step 4: Prevent duplicate generation**

Acquire `tts-locks/<cacheKey>.json` using a deterministic private Blob pathname before calling Rime. A contender polls for the finished audio with bounded backoff. Locks contain creation time, expire after two minutes, and are deleted in `finally`; an expired lock may be removed and reacquired. If an audio `put` loses a race, return the existing object.

- [ ] **Step 5: Stream private audio through an authenticated route**

Use Vercel Blob `get(pathname, { access: 'private' })` and stream the complete short paragraph audio with `Content-Type: audio/mpeg`, `X-Content-Type-Options: nosniff`, and private cache headers. Range handling is deliberately excluded from the first release because paragraph files are small and are generated as complete audio objects.

- [ ] **Step 6: Implement the single global player**

`AudioProvider` owns one `HTMLAudioElement`. Each `ListenButton` exposes Listen, Generating, Pause, Resume, Replay, and Retry, with `aria-live` status. Starting another paragraph stops the previous one. Speeds 0.8×, 1×, 1.2×, and 1.5× modify `playbackRate` only.

- [ ] **Step 7: Verify and commit PR 13**

Run focused TTS service tests and one compact player-state component test covering generate, play, pause, replay, and retry. Manually confirm the player once with mocked adapters. Do not add a TTS browser suite or separate tests for every visible label, and do not make the paid real request until PR 14 Preview verification.

```bash
git add src/lib/tts src/app/api src/components/tts src/app/layout.tsx .env.example package.json package-lock.json
git commit -m "feat: add cached paragraph narration"
```

## PR 14: Close coverage, add CI, and verify Preview

> Split into two GitHub issues for tracking: automated QA/CI ([#16](https://github.com/timnik82/holiday-2026-brittany/issues/16)) and human-in-the-loop Preview/secrets/paid verification ([#17](https://github.com/timnik82/holiday-2026-brittany/issues/17)). Steps 1–4 and the non-Preview part of step 7 belong to #16; steps 5–6 and the Preview-dependent part of step 7 belong to #17, which is blocked by #16 and requires your Vercel/Rime account access.

**Outcome:** The guide meets the design acceptance criteria and is ready for private family use.

**Files:**

- Modify: all remaining draft entries in `research/coverage.json`
- Create: `src/app/print.css`
- Modify: `tests/e2e/smoke.spec.ts`
- Create: `.github/workflows/ci.yml`
- Modify: `src/app/globals.css`, relevant component styles, `README.md`

- [ ] **Step 1: Enforce complete coverage**

Remove the temporary draft outcome from the coverage schema. Run validation and resolve every remaining substantive block as retained, duplicate, or conflict. Expected final report: 0 missing, 0 draft, 100% accounted for.

- [ ] **Step 2: Perform content consistency review**

Check that ranking labels match the 20/15/10/15/10/15/15 weights everywhere; route durations and linked days agree; names and slugs are consistent; every price/water-quality/schedule fact has a checked date; climate normals are never called forecasts.

- [ ] **Step 3: Complete representative responsive, print, and accessibility checks**

Expand the existing smoke spec into the application's only end-to-end journey: sign in, open the guide, visit one attraction, and open one route. Keep it independent of real Rime and Blob credentials. Manually inspect the home page, comparison, one longest article, and coverage once at narrow and wide widths, plus one representative print preview. Check focus order, skip link, color contrast, reduced motion, print headings, URL visibility, and long-table behavior during that short review. Do not create separate feature journeys or a page-by-viewport matrix.

- [ ] **Step 4: Add CI**

The GitHub Actions workflow uses the current Node LTS, `npm ci`, Playwright Chromium cache/install, `npm run validate:content`, lint, typecheck, focused tests, build, and the single Chromium smoke journey. It does not require Rime, Blob, or production auth secrets because external adapters are mocked and environment access is lazy.

- [ ] **Step 5: Create and configure Vercel Preview resources**

Link the repository to Vercel, create a private Blob store, and set `SITE_PASSWORD_HASH`, `AUTH_SECRET`, and `RIME_API_KEY` as Preview/Production environment variables. Confirm `RIME_API_KEY` and auth secrets are absent from build output and client bundles.

- [ ] **Step 6: Run the one paid Preview TTS verification**

Authenticate on Preview, play one paragraph, confirm one Rime request and one private Blob object, replay it, and confirm the second request is a cache hit with no Rime call. Change the test paragraph in a temporary Preview-only branch or fixture, confirm a new cache key, then discard that temporary verification change.

- [ ] **Step 7: Run final acceptance and commit PR 14**

Run:

```bash
npm run validate:content
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Expected: all pass; coverage reports 100%; representative pages have no horizontal overflow; protected Preview rejects unauthenticated page, API, and audio requests.

```bash
git add research/coverage.json src tests .github README.md
git commit -m "chore: verify Brittany guide for release"
```

## Issue conversion rules

After the user approves this plan, create one GitHub issue per PR in the order above. Each issue must include:

- the PR outcome and dependency list;
- the exact files and checkbox steps from its plan section;
- verification commands and expected results;
- acceptance criteria;
- labels for `app`, `content`, `research`, `security`, `tts`, or `ci` as applicable;
- a final checkbox to update the issue with the resulting PR link.

Do not create a milestone, assign people, or start implementation unless the user separately requests it.
