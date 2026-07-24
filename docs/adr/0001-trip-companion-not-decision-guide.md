# The guide is a trip companion, not a decision guide

The application was built to answer "which Brittany base should this family pick, in which August
window?" — the home page led with a verdict, a ranked top three, and two candidate date windows. That
question closed when the trip was booked: 6–23 August 2026, five stays, three of the six candidate
bases. Continuing to open on a recommendation would mean answering a question nobody is asking, on a
phone, in the rain, somewhere in Finistère.

The home page now opens on the booked trip and the current stay. The ranking machinery, the weighted
dimensions and the verdict are kept and moved to `/bases` as the record of how the destination was
chosen — deleting them would throw away the reasoning that still explains what each base is good at,
and the evidence and coverage records that hang off it.

## Considered options

Keeping the verdict as the front page and adding a separate "today" section was rejected: the first
screen is the scarce resource, and a decision already made does not deserve it. Removing the ranking
entirely was rejected because roughly a third of the evidence corpus exists to support it.
