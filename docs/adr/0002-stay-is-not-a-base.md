# A stay is a separate concept from a base

The six bases are candidate regions produced by the pre-booking comparison. The booked trip has five
stays, and they do not line up: three stays sit on a base, and Nantes — three nights on arrival and
one before the flight home — is not a candidate region at all, it is the airport city. Modelling
Nantes as a seventh base would have dropped it into a ranking it never competed in and given it a
score against family priorities it was never judged on.

So stays live in `src/config/guide.ts` as trip facts with their own dates, and reference a base only
when one applies (`baseSlug` is nullable). A stay owns the nights between check-in and check-out,
which makes a moving day unambiguous: it belongs to the place slept in that evening.

## Consequences

The existing place→base relation is no longer sufficient for "what can we do today". Places attached
to bases the family never sleeps in — Crozon, for instance — are still reachable as day trips from
the stays that were booked, so reach is curated per stay rather than derived from the base.
