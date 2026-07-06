# Final QA and CI Design

## Goal

Finish the automatable release-readiness work in GitHub Issue #16 without expanding the test suite or product beyond what this occasional-use family guide needs.

## Scope

This work ships as one focused pull request. It will:

- classify every remaining `draft` coverage entry as retained, duplicate, or conflict using the existing research and published guide content;
- remove `draft` as an allowed final coverage outcome;
- check ranking weights, route durations and links, names and slugs, checked dates, and climate terminology for consistency;
- expand the existing Playwright smoke test into one login-to-content journey covering the guide home, one attraction, and one route;
- add readable print behavior and fix only accessibility or responsive defects found by representative review;
- add GitHub Actions CI for content validation, linting, type checking, unit tests, build, and the Chromium smoke journey;
- document the local and CI verification commands.

Issue #17 remains responsible for Vercel secrets, production configuration, and the paid Rime/Blob verification.

## Coverage Closure

Draft entries will be reviewed against their original source blocks, canonical evidence records, and published paragraphs. Existing evidence will be reused wherever it already represents the claim. New travel research is out of scope unless a draft exposes a genuine substantive gap that cannot honestly be classified from the repository's existing material.

The validator will reject `draft` after closure. The final report must show zero missing and zero draft entries, with every source block accounted for.

## Automated Verification

The existing smoke specification remains the application's only end-to-end journey. It will sign in with test-only credentials, open the guide, visit one canonical attraction, and open one route. Real Rime and Vercel Blob credentials are not required.

GitHub Actions will use the current Node LTS and a single Chromium environment. It will install dependencies from the lockfile, install/cache Chromium as appropriate, and run the repository's existing validation gates plus the smoke journey. No additional page journeys, viewport matrices, or presentational component tests will be added.

## Representative Manual QA

The home page, comparison page, one long article, and coverage page will be inspected once at approximately 390 px and 1440 px. One representative print preview will be checked. Review covers horizontal overflow, long tables, focus order, the skip link, reduced motion, readable contrast, print headings, and visible source URLs.

Any fixes will be limited to defects observed during these checks. This is not a broad visual redesign.

## Template Guardrail

Shared application code will be scanned for avoidable hardcoded Brittany trip assumptions. Brittany-specific content, evidence, rankings, and research remain intentionally specific. This does not add multi-region runtime support.

## Success Criteria

- Coverage validation reports 100% accounted for with no draft or missing outcomes.
- All existing checks and the single Chromium smoke journey pass locally and in CI without production secrets.
- Representative narrow, wide, and print checks reveal no release-blocking usability problems.
- Print output preserves readable headings, tables, and source references.
- No unnecessary test expansion or unrelated cleanup enters the pull request.
