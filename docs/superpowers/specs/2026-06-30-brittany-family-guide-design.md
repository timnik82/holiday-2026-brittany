# Brittany Family Guide Design

**Status:** Approved in conversation on 2026-06-30

## Purpose

Build a private English-language guide that helps one family choose and plan an August 2026 Brittany holiday. The guide must answer the practical question “Which base and route fit us best?” before exposing the full depth of the supplied research.

The default planning context is:

- two adults and one child aged 9–10;
- travel from Lisbon or Porto;
- candidate stays of 8–17 August 2026 and 22–31 August 2026;
- a target accommodation price of €150 per night and a compromise ceiling of €180;
- preference for a fresh climate, nature, sea access, history, museums, castles, and family activities.

Destination and attraction pages remain useful as a general Brittany reference, but the home page and recommendations are explicitly personalized for this trip.

## Information Architecture

The product uses a decision-first structure rather than an encyclopedia-first structure. Broad geography provides context, but the main comparison unit is a practical accommodation base.

```text
Home
├── Compare bases
│   ├── Saint-Malo / Dinan
│   ├── Côte de Granit Rose
│   ├── Brest / Finistère
│   ├── Quimper / South Finistère
│   ├── Vannes / Carnac / Morbihan
│   └── Crozon / Douarnenez
├── Routes
│   ├── Cultural
│   ├── Nature
│   └── Relaxed family
├── Things to do
├── Swimming
├── Plan your trip
│   ├── Getting there
│   ├── Getting around
│   ├── Weather
│   ├── Accommodation and budget
│   └── Food
└── Sources
    ├── Originals and translations
    └── Coverage and conflicts
```

The primary routes are:

- `/` — personalized verdict, shortlist, comparison, date-window guidance, route summaries, and critical warnings;
- `/bases` and `/bases/[slug]` — base comparison and comprehensive base guides;
- `/routes` and `/routes/[slug]` — complete day-by-day itineraries;
- `/things-to-do` and `/things-to-do/[slug]` — filterable directory and individual place guides;
- `/swimming` — sea, tidal pools, lakes, safety, water temperature, and water quality;
- `/plan/[slug]` — shared practical guidance that would otherwise be duplicated across bases;
- `/sources` and `/sources/[slug]` — source archive with original/English toggle;
- `/sources/coverage` — source-block coverage and conflict register.

`Sources` is a secondary utility destination rather than part of the main trip-planning journey. It remains accessible from citations, the footer, and a compact utility navigation.

## Home Page Decision Flow

The home page answers questions in this order:

1. Is Brittany a good fit for this family in August 2026?
2. Which three bases currently fit best, and why?
3. How do all six bases compare using the agreed criteria?
4. Does the recommendation change between the two candidate date windows?
5. Which of the cultural, nature, or relaxed routes best matches the desired pace?
6. What could materially change the decision: weather, cold water, tides, driving, availability, or price?

The page gives concise conclusions and links to deeper pages. It does not repeat complete base, attraction, or logistics articles.

## Content Types and Page Responsibilities

### Base

A base is the primary decision object. Each base page contains:

- an answer-first summary and “best for” statement;
- strengths, compromises, and confidence notes;
- weighted family score and bathing-suitability score;
- climate and swimming summary;
- arrival and local transport summary;
- realistic accommodation guidance for both date windows;
- best family activities and a rainy-day fallback;
- recommended length of stay;
- linked routes, swimming locations, and things to do;
- paragraph-level citations and last-checked dates for changeable facts.

Regional geography is descriptive metadata on a base, not a competing top-level content hierarchy.

### Route

A route is a complete trip option that may link multiple bases. Each route page contains:

- the travel style, duration, pace, and transport assumptions;
- arrival and departure logic;
- a day-by-day itinerary;
- estimated driving or transfer burden;
- weather alternatives;
- linked bases and things to do;
- a concise “choose this route if” conclusion.

The initial routes are cultural, nature, and relaxed family swimming. Route content is not duplicated inside base pages.

### Thing to do

Each place or activity has one canonical page, even when it appears in several bases or routes. Its structured family profile includes:

- category and location;
- closest bases;
- suitable age and family appeal;
- typical visit duration;
- indoor, outdoor, or mixed weather suitability;
- booking and transport requirements;
- accessibility or safety constraints when known;
- price and last-checked date when relevant;
- linked routes and source evidence.

The directory supports filters for base, category, weather suitability, and child age. It uses the reader-facing label “Things to do” consistently.

### Swimming location

Swimming locations are structured entries rendered within the dedicated swimming guide. Each entry covers:

- sea, tidal pool, lake, or other freshwater type;
- typical August water conditions;
- shelter, waves, tides, and shallow access;
- lifeguard information;
- official water-quality source and last-checked date;
- cyanobacteria or other official warning status where applicable;
- linked bases and practical alternatives.

### Practical guide

Shared logistics live under `Plan your trip`. Base pages show only the local conclusion and link to the detailed shared explanation. Changeable facts such as flight schedules, accommodation availability, and prices are dated.

## Ranking Model

The overall family score uses the approved weighting:

- climate: 20%;
- nature: 15%;
- culture: 10%;
- family activities: 15%;
- logistics: 10%;
- accommodation: 15%;
- food: 15%.

Each dimension is scored on the same documented scale. The interface shows both the total and the component scores so the recommendation can be understood rather than treated as a black box.

The separate bathing-suitability score gives equal weight to six dimensions:

- water temperature and shelter;
- tide conditions;
- shallow or easy access;
- lifeguard coverage;
- official water quality;
- freshwater or pool alternatives.

Missing evidence is shown as unknown and lowers confidence; it is not silently converted to a neutral or positive score.

## Source Preservation, Translation, and Synthesis

Every file in `research/raw/` is immutable source material after ingestion. Corrections arrive as new revisions rather than edits to the original.

For every non-English source, the repository contains a complete reviewable English translation that preserves headings, lists, tables, links, numbers, and notes. An English original serves as its own English reading version and is not translated redundantly.

Each document is divided into substantive source blocks. A source block receives a stable identifier derived from its document identity and position. Synthesized English content is authored in reviewable Markdown. Each substantive synthesized paragraph records the source-block identifiers that support it.

The coverage register assigns every substantive source block one of three outcomes:

- retained, with links to the resulting synthesized paragraph or paragraphs;
- duplicate, with a link to the retained equivalent;
- conflict, with links to every conflicting version and the pages where the conflict is disclosed.

Conflicting claims are never silently blended. The guide presents both claims with their source and checked date, then gives a clearly labeled planning interpretation when one is needed.

## Freshness Rules

Climate normals are labeled as historical norms, never forecasts. Prices, flight schedules, attraction opening details, accommodation availability, lifeguard coverage, and water-quality information display a last-checked date.

Time-sensitive values are stored separately from long-form prose where practical. This allows a refresh to update a dated fact without rewriting the surrounding destination article. If a value is no longer verified, the interface displays it as stale or unavailable rather than continuing to present it as current.

## Content and Application Boundaries

The long-form guide is built from version-controlled Markdown and structured metadata. Pages should be available without a runtime content database. Server-side behavior is limited to authentication, approved paragraph lookup, TTS generation, and private audio delivery.

This boundary keeps reading fast and makes editorial changes reviewable in pull requests. It also prevents the build from depending on live third-party research or booking services.

The first release does not include booking, user accounts, collaborative editing, a general-purpose CMS, live itinerary optimization, or arbitrary AI-generated recommendations.

## Paragraph-Level TTS

The build produces a server-only manifest of approved English paragraphs:

```ts
type ParagraphRecord = {
  id: string;
  pageSlug: string;
  text: string;
  textHash: string;
  sourceRefs: string[];
};
```

`POST /api/tts` accepts only `{ paragraphId }`. The server resolves the approved text and never accepts arbitrary narration text. The cache key includes the Rime model, voice, language, output format, and SHA-256 text hash.

On a cache hit, the server returns the existing private audio without calling Rime. On a miss, it generates the complete paragraph once through Rime Coda using the English `astra` voice, 24 kHz audio, and WebM/Opus output, stores it in private Blob storage, and returns authenticated playback access.

The browser offers `Listen`, `Generating…`, `Pause`, `Resume`, `Replay`, and `Retry` states plus 0.8×, 1×, 1.2×, and 1.5× playback. Only one paragraph plays at a time. Changing speed uses browser playback rate and does not create more audio files.

Synthesized English pages and English translations receive narration. Non-English originals do not.

## Privacy and Security

The entire application is private. A password page verifies against `SITE_PASSWORD_HASH` and sets a signed HTTP-only session cookie using `AUTH_SECRET`. The same authorization check protects pages, source documents, TTS endpoints, and audio delivery.

`RIME_API_KEY`, Blob credentials, and authentication secrets remain server-only Vercel environment variables. Unknown paragraph identifiers, arbitrary text payloads, unauthenticated requests, and unauthorized audio access are rejected.

## Error Handling

- Missing content produces a useful not-found page with a path back to the relevant directory.
- A source block without a coverage outcome fails content validation rather than disappearing silently.
- Invalid cross-links, duplicate stable identifiers, missing translations, and malformed metadata fail the build with a file-specific message.
- Stale changeable facts remain readable but are visibly labeled as stale.
- Rime errors and quota failures return a retryable state without removing the paragraph text.
- Concurrent requests for the same uncached paragraph must not create duplicate audio objects.
- An unavailable private audio object triggers regeneration only when the approved manifest still contains the paragraph.

## Verification and Acceptance

Content verification must demonstrate:

- 100% of substantive source blocks have retained, duplicate, or conflict outcomes;
- every synthesized factual paragraph has at least one valid source reference;
- all internal links, citations, filters, and table-of-contents anchors resolve;
- every changeable fact type displays its checked date;
- ranking totals match the documented weights;
- missing ranking evidence is visibly represented.

Application verification must demonstrate:

- the decision journey works from home to a base, route, place, and practical guide;
- layouts remain usable at 390 px and 1440 px, with long tables and long articles;
- print output keeps headings, tables, and source references readable;
- authentication protects HTML pages, API requests, and private audio;
- unknown paragraph IDs and arbitrary text are rejected;
- one cache miss creates one audio object and subsequent playback is a cache hit;
- changed text produces a new cache key;
- TTS failures can be retried;
- keyboard and screen-reader users can operate every playback state;
- starting a new paragraph stops the previous one;
- playback-speed changes work without generating duplicate audio.

On a protected Vercel Preview deployment, verification includes one real Rime request followed by a confirmed cache hit for the same paragraph.

## Delivery Principle

Implementation is divided into small pull requests. Each pull request must leave the repository in a coherent, testable state and must avoid mixing unrelated infrastructure, content ingestion, interface, authentication, and TTS work. The detailed pull-request sequence belongs in the implementation plan created after this design is reviewed.
