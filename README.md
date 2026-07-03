# Holiday 2026 — Brittany Family Guide

This private repository will contain an English-language family travel guide for Brittany, France, for August 2026. The planned application combines detailed destination research, family itineraries, swimming options, travel logistics, accommodation guidance, and paragraph-level text-to-speech playback.

## Single-region template

The application is a reusable template for one region at a time, not a
multi-region platform. Shared application code reads the destination and trip
assumptions from [`src/config/guide.ts`](src/config/guide.ts); facts about
Brittany remain in the reviewed content and research data.

To adapt a clone for another region, replace the guide configuration together
with `research/raw/`, `research/source-manifest.json`, the evidence and coverage
records, rankings, and the files under `content/`. Shared components should not
introduce new hardcoded region, country, season, traveler, origin, date, or
budget assumptions.

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

## Authentication

The guide is private to the family. Every page, RSC request, and (later) API
route is protected by a single stateless session: a bcrypt password check that
issues an HS256 JWT stored in a `httpOnly`, `sameSite: "lax"` cookie.

To run or deploy the app you need two environment variables (see
[`.env.example`](.env.example)):

- `SITE_PASSWORD_HASH` — a bcrypt hash of the private family password. Generate
  it with the helper script:
  ```bash
  npx tsx scripts/auth/hash-password.ts "your-password"
  ```
- `AUTH_SECRET` — the JWT signing secret (a random 32+ byte string):
  ```bash
  openssl rand -base64 32
  ```

Set both in your local `.env` (gitignored) or as Vercel Environment Variables.

### How the boundary works

- `src/proxy.ts` (the Next.js 16 request-interception convention) optimistically
  redirects unauthenticated page/RSC requests to `/login`. It only uses the
  edge-safe `jose` library.
- The proxy is **not** the sole security boundary. Every future API route MUST
  call `requireApiSession()` (from `src/lib/auth/require-session.ts`), which
  throws a `401` for an invalid session, and any server component may call
  `requirePageSession()` for defense in depth.

The end-to-end smoke test signs in through the browser using a committed
test-only password and hash; real credentials are never committed.

