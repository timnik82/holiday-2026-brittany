# Holiday 2026 — Brittany Family Guide

This private repository will contain an English-language family travel guide for Brittany, France, for August 2026. The planned application combines detailed destination research, family itineraries, swimming options, travel logistics, accommodation guidance, and paragraph-level text-to-speech playback.

## Current status

The project is in the planning and research-ingestion phase. Application development has not started yet.

The approved information architecture is saved in [the design specification](docs/superpowers/specs/2026-06-30-brittany-family-guide-design.md). The implementation sequence is saved in [the implementation plan](docs/superpowers/plans/2026-06-30-brittany-family-guide.md).

## Before coding starts

Provide all completed Deep Research documents as Markdown files and place them in [`research/raw/`](research/raw/). These files must be reviewed before the application structure and content pages are implemented, because they determine:

- the final destination and attraction page hierarchy;
- the amount and structure of long-form content;
- English evidence extraction and source-attribution requirements;
- paragraph identifiers used by the text-to-speech system.

See [`research/raw/README.md`](research/raw/README.md) for the ingestion rules.

## Secrets

Do not commit Rime, Vercel, GitHub, or other API keys. Local credentials belong in ignored environment files; the eventual deployment will use Vercel Environment Variables.
