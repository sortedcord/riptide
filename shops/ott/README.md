# Reelbox (ott)

Fictional streaming service for Riptide Arena. Next.js 16, port 3005: `npm run dev -w shops/ott`, then `http://localhost:3005/honest`.

## Pages (all under `/{variant}`)

| Path | `data-riptide-step` | What |
|---|---|---|
| `/` | `home` | Logged-out landing: hero + email "Get started", "Continue as demo user", plan teaser (prices incl. GST), feature tiles, FAQs, empty promo slot |
| `/plans` | `plans` | Mobile / Basic / Standard / Premium cards (quality, resolution, screens, downloads, devices, audio, price + GST). Nothing pre-selected. Breakdown, renewal statement, comparison table |
| `/signup` | `signup-email` | Email (or "Use demo email"), validation messages |
| `/signup/password` | `signup-password` | Mock password, pre-filled read-only; "Continue as demo user". No OTP/verification |
| `/signup/plan` | `signup-plan` | Review: chosen plan + Change link, optional "Extra member slot" (Add / No, thanks), marketing opt-in (unticked), itemised breakdown, renewal terms |
| `/payment` | `payment` | Core `PaymentPage` with sign-up progress |
| `/browse` | `browse` | Featured title hero, Continue watching (demo account), My List, Top rated, 8 genre rails |
| `/title/{id}` | `title` | Synopsis, fictional cast/creator, rating, maturity, seasons + episodes, My List, more like this |
| `/search?q=&genre=&kind=` | `search` | Search by title/cast/genre/language, genre + type filters, empty state |
| `/account` | `account` | Membership (demo account: active Standard), next billing date + amount, change plan, billing history, Cancel membership link |
| `/account/cancel` | `cancel` | Access-end statement, optional reason, "Keep membership" / "Cancel membership" (equal weight) |
| `/policies/{help,terms,cancellation,privacy}` | `policies` | Policy text matching the honest flow |
| `/sandbox-complete` | `complete` | Core sandbox receipt |

## Flows (`shop.config.ts`)

- `purchase`: `plans` → `signup-email` → `signup-password` → `signup-plan` → `payment`. Every forward button uses `useFlow("purchase").next(step)`; the landing "Get started" goes to the flow's first step.
- `cancel`: `account` → `cancel`. The confirm button (`account.cancel.confirm`) sets the membership to cancelled and returns to Account, which shows "access until 11 Nov 2026" and a Restart button.

Steps (for `visibleFromStep`): `home, browse, search, title, policies, account, cancel, plans, signup-email, signup-password, signup-plan, payment`.

## Pricing

Plan prices exclude GST; `buildLines` adds `plan` (item) and `gst` (18%, tax), both visible from `plans`, and the optional `extra-member` add-on (₹100 + ₹18 GST = ₹118, unselected, visible from `signup-plan`). Plan cards, the teaser and the account page quote each plan through the engine (`computePrice` with that plan), so manifest `addLine`/`setLine` show everywhere. Standard with no extras = ₹531.

Dates come from a fixed reference date, 24 Oct 2026 (`lib/plans.ts`): sign-ups renew 24 Nov 2026; the demo membership bills on the 12th (next 12 Nov 2026, access ends 11 Nov 2026 if cancelled).

## Slots

See `slots.ts` or `GET /api/slots`. 60 ids including the 6 core payment slots. Footer slots are declared on `home` but render on every page.

## Happy path (to payment)

1. `/honest/plans?reset=1` → click **Select Standard** → **Continue**
2. **Use demo email** → **Continue**
3. **Continue as demo user**
4. Review (leave the add-on and opt-in alone) → **Continue to payment**
5. Payment shows ₹531 (Standard ₹450 + GST ₹81).

Cancel: `/honest/account` → **Cancel membership** (1 click) → `account.cancel.confirm` is on screen (click 2 would confirm).

## Manifests

`manifests/honest.json` (empty) and `manifests/_neutral-test.json`, which uses every op: reworded hero, demo button variant, card tab default on payment, title attr on plans Continue, hidden kids feature tile, reordered footer links, ₹0 "Account setup (free)" line, relabelled GST, info banner in `home.promo.banner`, "Profile setup" step after `signup-password`, `setHead` meta.

## Tests

`tests/ott.spec.ts`: honest path to payment (total = engine total, never increases, nothing pre-selected, equal-weight add/decline), every registry id seen on its declared step, cancel flow (never clicks confirm), neutral manifest overrides, no console errors or 4xx responses. Run with the server up: `npx playwright test -c shops/ott/tests`.

## Known gaps

- Playback is not implemented (Play shows a toast).
- The demo account is always "signed in"; there's no sign-out. Sign-up doesn't create a separate account: the account page always shows the demo membership.
- Switching plan on Account changes the displayed plan immediately (the copy says it applies from the next billing date); billing history always shows the Standard plan.
- The cancel reason isn't stored.
- `/account/cancelled` doesn't exist: after confirming, Account shows the cancelled state, so no registered slot appears only after cancelling.
