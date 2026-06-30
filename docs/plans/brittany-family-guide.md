# Brittany Family Guide Application Plan

## Summary

Create a private English-language application on Next.js and Vercel rather than a single static HTML file. It will combine:

- a detailed Brittany travel report;
- comprehensive region and attraction pages;
- routes, climate, swimming, prices, and logistics;
- a complete synthesis of supplied Deep Research Markdown files;
- an original-language source archive with traceable English evidence;
- on-demand paragraph-level narration through Rime.

Primary stack: Next.js App Router, TypeScript, Markdown/Remark, Vercel Functions, private Vercel Blob, and Rime Coda.

## Content and Deep Research

- Accept every Markdown source from `research/raw/` and preserve it unchanged.
- Divide every source into stable substantive blocks and create concise, reviewable English evidence records directly from those blocks. Preserve every source reference, number, date, caveat, and URL needed to audit each claim.
- Merge documents by topic, removing duplicated wording while retaining every unique fact, example, argument, price, warning, and recommendation.
- Do not impose a length limit. Every attraction or major subject receives its own comprehensive page with a table of contents.
- Do not silently resolve conflicting information: show both versions with their dates and sources.
- Create a coverage table that maps every substantive source block to English evidence and resulting paragraphs, or marks it as a duplicate or conflict with a link to where the information was retained.
- The Sources archive displays the unchanged original Markdown in its supplied language. The coverage view displays the corresponding concise English evidence; it does not present a full-document translation.
- Narration is available for synthesized English guide pages. Source originals and the evidence audit view do not receive TTS.

Primary application routes:

- `/` — answer-first overview, ranking, and key conclusions;
- `/regions/[slug]` — comprehensive regional pages;
- `/attractions/[slug]` — individual attractions;
- `/routes/[slug]` — three detailed itineraries;
- `/swimming` — sea bathing, tidal pools, lakes, and water quality;
- `/sources/[slug]` — unchanged original research document; `/sources/coverage` — English evidence and source mapping.

## Brittany travel research

- Compare Saint-Malo/Dinan, Côte de Granit Rose, Paimpol/Bréhat, Brest/Crozon, Quimper/Cornouaille, Carnac/Vannes/Morbihan, and Morlaix/Roscoff.
- Use the balanced family ranking: climate 25%, nature 20%, culture 15%, family activities 15%, logistics 10%, accommodation 10%, and food 5%.
- Add a separate bathing-suitability score covering water temperature and shelter, tides, shallow access, lifeguards, water quality, and freshwater alternatives.
- Evaluate Bon-Secours, Lac de Trémelin, Lac de Guerlédan, Lac au Duc, and other officially monitored swimming areas. Check ARS warnings for cyanobacteria.
- Use `one --agent` with EXA, Tavily/Perplexity, and Google Places; use direct EXA and Firecrawl for official pages; use Booking.com for accommodation, cars, and activities.
- Compare departures from LIS and OPO, accommodation for 8–17 and 22–31 August 2026, a target of €150 per night, and a compromise ceiling of €180.
- Produce these two-base itineraries:
  - cultural, 9 days: Saint-Malo/Dinan and Quimper;
  - nature, 10 days: Côte de Granit Rose and Crozon;
  - relaxed family swimming, 8 days: Vannes/Carnac and Brocéliande/Lac de Trémelin.

## TTS and security

- Use Rime Coda with the English `astra` voice, language `en`, 24 kHz sampling, and WebM/Opus output.
- During the build, create a server-only paragraph manifest:

```ts
type ParagraphRecord = {
  id: string;
  pageSlug: string;
  text: string;
  textHash: string;
  sourceRefs: string[];
};
```

- `POST /api/tts` accepts only `{ paragraphId }`; it must not accept arbitrary text.
- The server resolves approved English text, checks private Blob storage, and calls Rime only when the audio is missing.
- Build the cache key from the model, voice, language, and SHA-256 text hash. A changed paragraph therefore receives new audio automatically.
- Generate the complete paragraph audio after the first click, save it, and then return an authenticated playback URL. Repeat playback must not call Rime again.
- Provide 0.8×, 1×, 1.2×, and 1.5× playback through the browser's `playbackRate`, avoiding duplicate audio files.
- Every narrated paragraph provides `Listen`, `Generating…`, `Pause`, `Resume`, `Replay`, and `Retry` states. Only one paragraph may play at a time.
- Protect the private application with a login page, `SITE_PASSWORD_HASH`, a signed HTTP-only cookie, and `AUTH_SECRET`. Apply the same protection to pages, TTS endpoints, and audio files.
- Store `RIME_API_KEY` only in Vercel Environment Variables.

## Verification and acceptance criteria

- The coverage table accounts for 100% of substantive Deep Research blocks.
- All synthesized application pages are in English; original-language documents and their English evidence mappings are available in Sources.
- Reject unknown paragraph IDs, arbitrary text, and unauthenticated requests.
- A cache hit never calls Rime; a cache miss creates one file; changing source text invalidates the cached audio.
- Rime errors and quota failures produce a clear retryable state.
- Verify TTS controls with keyboard navigation and a screen reader, including previous-paragraph stopping and playback-speed changes.
- Verify the interface at 390 px and 1440 px, print output, long pages, tables, links, and overflow behavior.
- On Vercel Preview, perform one real TTS request and confirm the second playback comes from the cache.
- Display the date checked beside prices and water-quality information; do not present climate normals as a forecast.

## Assumptions

- All Deep Research Markdown files will be supplied before content implementation begins.
- The application and synthesized content are fully English-language.
- Rime is the only TTS provider in the first release; ElevenLabs is not connected.
- Audio is generated only after a user clicks and is not pre-generated.
- The application is intended for private family use.
