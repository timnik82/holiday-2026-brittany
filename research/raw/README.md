# Deep Research source documents

Place all completed Deep Research documents in this directory **before application development begins**.

## Rules

1. Use Markdown files (`.md`).
2. Keep each original document unchanged after adding it. Corrections should be supplied as a new revision rather than silently rewriting the source.
3. Use descriptive filenames, for example `saint-malo-deep-research.md` or `brittany-swimming-options.md`.
4. Preserve headings, tables, lists, citations, links, numbers, and source notes.
5. Do not include passwords, API keys, access tokens, private account details, or unrelated personal information.

## What the application pipeline will do

- preserve the original Markdown;
- create concise English evidence records directly from substantive source blocks;
- merge all unique facts into comprehensive destination and topic pages;
- remove duplicated wording without discarding unique information;
- record conflicts and source attribution;
- map every substantive source block to its resulting page paragraphs;
- create stable paragraph identifiers for text-to-speech playback.

The source archive in the private application will expose each unchanged original document in its supplied language. A separate coverage view will show the concise English evidence derived from each substantive block; no full-document translation is required.

## Manifest, blocks, and decisions

Every file in this directory must have a matching entry in `research/source-manifest.json` (slug, path, language, SHA-256 checksum, and any `stopHeadings` such as "Works cited" or "Источники" sections to exclude). Checksums use the repository's canonical LF line endings so they remain stable on Windows, macOS, and Linux. If a source intentionally changes as a new revision, run `npm run validate:content` and copy its reported actual checksum into the new manifest entry; validation fails until the manifest records it.

Run `npm run build:source-blocks` to deterministically split each source into stable, reviewable blocks under `research/blocks/<slug>.json`. Running it twice must produce no diff. Every extracted block requires an explicit entry in `research/block-decisions.json` (`{ "substantive": true }` or `{ "substantive": false, "reason": "..." }`); `npm run validate:content` enforces both the checksums and the decision coverage.

