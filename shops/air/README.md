# Skyline Air (air) · port 3003

A fictional domestic airline flying 13 Indian cities. It is honest by default: all mandatory charges appear in the fare summary from the first flight you pick, nothing is pre-ticked, and seat selection can be skipped.

Run it with `npm run dev -w shops/air`, then open http://localhost:3003/honest. The slot registry is at `/api/slots`.

## Pages (`/{variant}/…`)
| Path | Step | What it is |
|---|---|---|
| `` | search | Search: one way or round trip, a clickable city picker (typing to filter is optional), native date inputs, adult and child counters, popular routes, FAQ |
| `results` | results | Outbound and return lists, a ±3-day date strip, sorting (cheapest, earliest, shortest), a non-stop filter, and Saver/Flexi/Plus prices per flight with an engine-computed all-in price |
| `fare` | fare | Fare-family comparison (baggage, change, cancellation, seats, meals) |
| `passengers` | passengers | Traveller forms with **Use saved traveller**, saved contact details, and a marketing opt-in (unticked) |
| `seats` | seats | A320-like 30-row 3-3 seat map, a priced legend, per-flight tabs, and **Skip seat selection** with the same weight as Continue |
| `addons` | addons | Saver→Flexi upgrade card, extra baggage, meal and insurance (all unadded, each with an equal-weight Add / No, thanks pair) |
| `review` | review | Full itinerary, seats, fare rules, add-ons and contact |
| `payment` | payment | Core `PaymentPage` |
| `account` | account | Demo profile, saved travellers, empty trips |
| `policies/{baggage,fare-rules,cancellation,terms,privacy}` | policies | Policy text that matches the flow |

## Flows and steps
- `steps`: search, results, fare, passengers, seats, addons, review, account, policies, payment
- `flows.purchase`: search → results → fare → passengers → seats → addons → review → payment. Every page navigates with `useFlow("purchase").next(step)`.

## Pricing (`shop.config.ts` `buildLines`)
All amounts come from the engine:
- Base fare per flight: `fare-out` and `fare-ret`.
- `taxes`: GST 5% on the base fare plus ₹450 airport charges per traveller per flight.
- `convenience`: ₹275 per traveller per flight.

All three are visible from `results`. Paid seats are `seat-{seg}-{i}`, visible from `seats`, and are added only when the user picks a paid seat. `baggage`, `meal` and `insurance` are optional and unselected, visible from `addons`.

Flights are generated deterministically by `lib/air.ts` `flightsFor(from, to, date)` using `prng(hashString(route@date))`. Every city pair works, giving 156 routes. Flight numbers use the invented `SK` prefix.

Seat bands: Extra legroom (rows 1, 12, 13) ₹1,450; Up front (rows 2–5) ₹650; Window & aisle (rows 6–15) ₹300; everything else is free. Flexi includes Window & aisle seats and Plus includes every seat. Occupied seats are seeded per flight id.

## Slots
See `slots.ts` or `GET /api/slots`. Fare-summary ids are generated for each step from results to review: `{step}.summary.panel`, `{step}.summary.total`, `{step}.fees.taxes` and `{step}.fees.convenience`. Other summary lines use `{step}.summary.line.{key}`. Each paid seat class has one id (`seats.map.xl|front|standard|free`), with the seat in `data-seat`.

## Happy path (clicks)
1. `/honest?reset=1`: click **From**, then **New Delhi**. Click **To**, then **Mumbai**. Click **Search flights**. The date defaults to tomorrow.
2. Results: click **Saver** on any flight, then **Continue**.
3. Fare: **Continue**.
4. Travellers: click **Use saved traveller** and pick a name, then **Use saved contact details**, then **Continue**.
5. Seats: **Skip seat selection**, or pick seats and click **Continue**.
6. Add-ons: **Continue**.
7. Review: **Continue to payment**. You reach `data-riptide-step="payment"`.

## Tests
`tests/smoke.spec.ts` covers:
- an honest walk with total checks against the engine and the summary lines;
- every registry id rendering on its step;
- every override in the neutral manifest being visible;
- a 390px mobile check;
- no console errors on any of the above.

To run it, start `npx next start -p 3003` in `shops/air`, then from the repo root run `npx playwright test -c shops/air/tests`. If Playwright's bundled browser revision is missing, set `PW_CHROMIUM=~/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome`.

## Known gaps
- Infants (under 2) can't be booked online. The search form says so.
- One fare family applies to the whole booking, including both flights of a round trip. The fare page states this.
- No multi-city trips, no manage-booking or cancel flow (bookings aren't stored), and no web check-in.
- Children pay the adult fare. The fare rules state this.
- The ±3-day date strip shows the lowest Saver base fare, before taxes.
