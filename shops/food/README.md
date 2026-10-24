# Forkful (food delivery) · port 3002

A fictional food-delivery shop. It ships honest, and manifests in `manifests/` mutate it without code changes.

Run it with `npm run dev -w shops/food`, then open http://localhost:3002/honest. Add `?reset=1` to any URL to clear the session.

## Pages (all under `/{variant}/`)
| Path | Step | What |
|---|---|---|
| `location` | location | Saved addresses (demo profile: Home, Work) and 10 Indian cities |
| `` (home) | home | Hero, cuisine carousel, filters (pure veg, rating 4.0+, under 30 min, offers), sort, 12 restaurants. `?q=` searches restaurants and dishes; `?offers=1` and `?cuisine=` preset filters |
| `restaurant/{id}` | restaurant | Header (rating, ETA, cost for two, every fee stated), offers, category nav, menu search, veg-only toggle, veg/non-veg markers, 16–23 dishes, reviews, cart drawer |
| (modal on restaurant) | restaurant | Customisation `<dialog>`: size, add-ons, spice level, quantity. Closes with the visible Close button, Escape or a backdrop click |
| `cart` | cart | Items with quantity steppers, coupon section, Forkful Pass card (optional, ₹99 one month, no auto-renew), full bill |
| `checkout` | checkout | Address ("Use saved address", saved list, validated new-address form), instruction chips and note, tip (default No tip), ₹3 donation (unticked), cutlery (off), marketing opt-in (unticked), bill |
| `payment` | payment | Core `PaymentPage` with a progress bar |
| `sandbox-complete` | complete | Core |
| `account` | account | Demo profile, Pass status, addresses, last sandbox order |
| `policies/{about,help,terms,refund,privacy,delivery}` | policies | Policy text that matches the honest flow |

## Flows and steps
- `config.steps`: location, home, restaurant, cart, checkout, account, policies, payment
- `config.flows.purchase`: cart → checkout → payment. The cart and checkout CTAs use `useFlow("purchase").next()`, so inserted steps work.

## Pricing (`shop.config.ts`)
All lines are `visibleFromStep: "cart"`:
- **Item lines:** (base + size + add-ons) × quantity.
- **Coupon discount:** WELCOME60, FEAST100 or TREAT15, when the item total and restaurant conditions are met.
- **Fees:** delivery (₹25–₹49 per restaurant), restaurant packaging (₹15–₹30), and a ₹6 platform fee.
- **GST:** 5% on food and packaging, plus 18% on the platform fee.
- **Optional lines (off by default):** `pass` ₹99, `tip-20`, `tip-30` and `tip-50`, and `donation` ₹3.

## Slots
88 ids. See `slots.ts` or `GET /api/slots`. Cart and checkout share a bill component (`{step}.bill.*`, `{step}.fees.{delivery,packaging,platform,gst}`). Other bill lines carry `data-dp="{step}.summary.line.{key}"`. Header and footer slots render on every page and are declared on `home`. Tip options are registered individually with `lineKey`s, so `setDefault` on `checkout.tip.option-30` pre-selects that tip through the engine.

## Happy path (clicks to payment)
1. `/honest/location?reset=1` → **Deliver here** on Home (`location.saved.home`)
2. Home → the **Tandoor Tales** card
3. **ADD** on Paneer Tikka (`restaurant.item.add`) → **Add item · ₹279** (`restaurant.customise.add`)
4. **View cart** (`restaurant.cart.cta`) → **No, thanks** on the Pass (optional) → **Proceed to checkout** (`cart.cta.checkout`)
5. **Use saved address** (`checkout.address.use-saved`) → **Proceed to payment** (`checkout.cta.payment`)
6. Payment total is **₹365.28**: 279 + 39 delivery + 25 packaging + 6 platform + 16.28 GST

## Tests
`npx playwright test -c shops/food/tests/playwright.config.ts`, with the shop running on 3002. The suite covers three things:
- The honest walk to payment: total equals the engine's, defaults are unticked, every registry id renders on its declared step, and there are no console errors.
- `_neutral-test`: every op is visible.
- 390px pages have no horizontal overflow.

## Known gaps
- A single restaurant per cart. Adding from another kitchen shows an inline warning in the dialog, and the button reads "Replace cart and add".
- Forkful Pass benefits (free delivery) are described but never applied, because they start "from your next order" and the sandbox has no next order. Account shows no active Pass even after a sandbox payment.
- Restaurant areas are derived from the chosen city. The same 12 kitchens appear in every city.
- `restaurant.info.fees` and home-card delivery fees read restaurant data rather than `usePrice`, so a manifest `setLine` on `delivery` changes the bill but not those labels. Cart and checkout always use the engine.
- `restaurant.item.add` is one id shared by every dish's Add button, so an override applies to all of them.
