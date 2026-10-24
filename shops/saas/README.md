# Prism Studio (saas)

Fictional creative-software subscription shop. Next.js 16 app on port **3004**: `npm run dev -w shops/saas`.
Six apps (Lumen photo, Contour vector, Framewise video, Tessera layout, Quire PDF, Kern fonts), three plans
(Single app / All Apps / Team) × three billing terms (Monthly / Annual, billed monthly / Annual, prepaid), 14-day free trial.
GST (18%) is shown next to every price. All dates are relative to a fixed "today", `TODAY = 2026-10-24` in `catalog.ts`.

## Pages (`/{variant}/…`)
| Path | Step | What |
|---|---|---|
| `/` | home | Suite showcase, app grid, FAQ |
| `/apps/[id]` | app | App page (features, specs, reviews, price incl. GST) |
| `/search?q=` | search | App search |
| `/policies/{terms,cancellation,privacy,help,about}` | policies | Policies (describe the honest flow) |
| `/pricing` | plans | Term selector, 3 plan cards with per-month price, GST, billing/commitment/early-termination terms and trial terms; trial or buy |
| `/signup` | signup | One-click "Continue as demo user" |
| `/review` | review | Plan + terms, optional storage add-on (Add / No, thanks), marketing opt-in, price breakdown |
| `/payment` | payment | Core `PaymentPage` |
| `/account` | account | Seeded demo plan (All Apps, monthly, since 14 Jun 2026), next payment, billing history, manage plan (switch from next billing date), Cancel plan link |
| `/account/cancel` | cancel | Optional reason + refund/fee statement + equal-weight Keep plan / Cancel plan (`account.cancel.confirm`) |
| `/account/cancelled` | cancelled | Confirmation, restart from Account |

## Flows (`shop.config.ts`)
- `purchase`: plans (`pricing`) → signup → review → payment
- `cancel`: account → cancel (`account/cancel`) → cancelled (`account/cancelled`)

Steps: `home, search, app, policies, account, cancel, cancelled, plans, signup, review, payment`. All pricing lines are `visibleFromStep: "plans"`.
Pricing lines: `plan` (item), `gst` (tax), `storage` (optional add-on, buy mode only, GST included in its amount), `trial` (discount that zeroes today's charge in trial mode).

Slots: see `slots.ts` or `GET /api/slots` (75 ids incl. core payment slots).

## Happy path (clicks)
1. `/honest/pricing?reset=1` → click **Buy now** on All Apps (`plans.all.buy`), monthly is the default term.
2. **Continue as demo user** (`signup.demo.continue`).
3. **Continue to payment** (`review.cta.continue`) → payment total ₹3,538.82 (₹2,999 + ₹539.82 GST).

Trial: same, but **Start 14-day free trial** → payment total ₹0, first charge on 7 Nov 2026.
Cancel: `/honest/account` → **Cancel plan** (`account.plan.cancel`) → **Cancel plan** (`account.cancel.confirm`). 2 clicks.

## Tests
`tests/smoke.spec.ts` (start the server first: `npx next start -p 3004` in this folder, then `npx playwright test` here; `playwright.config.ts` points at the cached Chromium 1234, override with `PW_CHROMIUM`).
Covers the buy flow total, trial total, every registry id rendering on its step, ≤2-click cancel (never clicks confirm), every `_neutral-test` override, no console errors, and no horizontal scroll at 390px.

## Known gaps
- Buying in the purchase flow doesn't change the seeded demo subscription on Account (the review page says the existing plan stays separate).
- Add-ons can't be managed from Account yet; storage is only offered in buy mode (trial mode explains it can be added later).
- Billing history assumes the current price for every past invoice.
- Favicon is `app/icon.svg`.
- Header search goes to a results page; there's no autocomplete.
