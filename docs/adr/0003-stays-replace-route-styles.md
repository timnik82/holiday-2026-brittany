# Stay pages replace the three route styles

The guide carried three alternative route styles — cultural, nature and relaxed family — each with
its own day-by-day itinerary and its own "why choose this one" argument. They existed to answer a
question that the booking has since closed. Keeping them would have left the site offering a choice
the family cannot make, alongside the trip they actually take.

The three routes are folded into stay pages under `content/trip/`, one per booked stay. The
day-by-day material is not rewritten from scratch: the relaxed itinerary becomes the Vannes stay,
the cultural itinerary becomes Saint-Malo / Dinan, and the Crozon half of the nature route becomes
day trips from Quimper, because that is where those places are reachable from. Days that assumed a
region we never visit — the Côte de Granit Rose — are dropped from the itinerary, and the evidence
behind them is re-cited on that region's base page, which survives as part of the "how we chose"
archive.

A stay page holds almost nothing in its frontmatter. Dates, nights, place and base come from
`guideConfig.trip` through a `stayId`, so a changed booking updates every stay page at once and
cannot leave a stale date behind in prose. Only the car judgement is editorial.

## Consequences

Moving paragraphs between pages breaks the coverage report, which references paragraph IDs that
nothing validated. Six references were already dangling before this change — the report had been
quietly claiming connections that no longer existed. The validator now checks every coverage
paragraph reference against the content, so the next move fails the build instead of lying.

The evidence records keep their `routes-*` ids. Renaming them would touch every citation and every
coverage entry for no gain, and the names remain accurate: the sources really did argue in terms of
route styles, even though the guide no longer presents them that way.
