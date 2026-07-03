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

## Deployment (Vercel)

The guide deploys as a standard Next.js App Router project on Vercel. The
TTS feature requires a private Blob store and three environment variables.

### Step-by-step

1. **Link the repository** — In Vercel, "Add New → Project", import the
   GitHub repo. Accept the default framework preset (Next.js).

2. **Create a private Blob store** — In the Vercel dashboard go to
   "Storage → Create Database → Blob", then link it to the project. This
   provisions `BLOB_READ_WRITE_TOKEN` automatically in the deployment
   environment.

3. **Set environment variables** (Settings → Environment Variables, for
   at least Preview and Production):
   - `SITE_PASSWORD_HASH` — bcrypt hash of your chosen family password:
     ```bash
     npx tsx scripts/auth/hash-password.ts "your-password"
     ```
   - `AUTH_SECRET` — random 32+ byte JWT signing secret:
     ```bash
     openssl rand -base64 32
     ```
   - `RIME_API_KEY` — your Rime API key from https://app.rime.ai

4. **Deploy** — Push to `main` or trigger a Preview deployment. The proxy
   (`src/proxy.ts`) protects every page; API routes call
   `requireApiSession()` for defense in depth.

5. **Verify TTS** — On the Preview deployment: sign in, open any base page
   (e.g. `/bases/saint-malo-dinan`), click "Listen" on a paragraph. Confirm
   audio plays. Click "Listen" on the same paragraph again — it should be
   a cache hit (instant playback, no Rime call).

6. **Verify unauthenticated rejection** — In a private browser window,
   visit the Preview URL. You should be redirected to `/login`. Try
   `curl -X POST <preview-url>/api/tts` — it should return `401`.

### Secret safety

All three secrets are read lazily via `requireEnv()` inside `server-only`
modules and API routes (Node runtime). They never appear in the client
bundle — verified by grepping `.next/static/` after build.

