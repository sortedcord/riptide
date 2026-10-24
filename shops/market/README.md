# Cartwheel (market)

A general marketplace for the Riptide sandbox. Next.js 16, port 3001. Run with `npm run dev -w shops/market`, then open `http://localhost:3001/honest`.

## Pages (all under `/{variant}`)

| Path | Step | What it is |
|---|---|---|
| `/` | home | Hero carousel (3 slides, manual, no autoplay), trust strip, 6 category tiles, deals rail, recommended rail, Plus info card, kitchen rail |
| `/search?q=&cat=&brand=&min=&max=&rating=&speed=&sort=&page=` | search | Listing/category page. Filters (category, price, brand, rating, delivery speed) are a GET form; sort and pagination (12/page) are links |
| `/product/[id]` | product | Gallery (2–4 views), variant chips, price/MRP/discount, fee note from the engine, offers, PIN check, warranty accept/decline, gift wrap, add/buy, seller, specs, reviews, Q&A, similar rail |
| `/cart` | cart | Quantity stepper, save for later, remove, optional extras (warranty, gift wrap), coupon field, itemised price breakdown |
| `/checkout` | checkout | Saved address ("Use saved address") or new address form with validation; delivery speed (Standard / Express +₹79 / Next-day +₹149); optional Cartwheel Plus card |
| `/review` | review | Address, speed, items, final breakdown, marketing opt-in (unticked) |
| `/payment` | payment | Core `PaymentPage` with Cartwheel progress bar |
| `/sandbox-complete` | complete | Core `SandboxComplete` |
| `/account` | account | Demo profile, orders (3 seeded + this session's sandbox order), Plus summary with Manage / Cancel links |
| `/account/membership` | membership | Plus status, renewal date and amount, terms, Cancel button |
| `/account/membership/cancel` | cancel | 2 steps: optional reason → confirm (`account.cancel.confirm`) |
| `/policies/{terms,returns,shipping,privacy}`, `/help` | policies | Policy pages and help centre (FAQ, about, contact) |

## Flows and steps

- `steps`: home, search, product, account, membership, cancel, policies, cart, checkout, review, payment.
- `purchase`: cart → checkout → review → payment (navigated with `useFlow("purchase").next()`).
- `cancel`: membership → cancel (so a manifest can `insertStep` into the cancel flow).

## Pricing (all from `shop.config.ts` → `buildLines`)

Items (GST-inclusive) · Delivery fee ₹40, ₹0 when items total ≥ ₹499 (from cart) · Platform fee ₹7 (from cart) · Coupon discount (from cart; WELCOME100, CART10, GROCER50) · optional: `warranty` (sum of eligible items' warranty prices), `giftwrap` ₹49 (from cart), `express` ₹79 / `nextday` ₹149 (from checkout; express is ₹0 for Plus members), `plus` ₹999 membership (from checkout). All optional lines start unselected.

## Slots

See `slots.ts` or `GET /api/slots` (≈95 ids). Dynamic, non-target ids: `home.categories.{slug}`, `home.deals.item.{id}`, `home.recommended.item.{id}`, `search.results.item.{id}`, `cart.items.row.{key}`, `{step}.summary.line.{key}`. Reorderable containers: `home.categories.list`, `home.deals.rail`, `home.recommended.rail`, `search.results.list`, `footer.links.list`. `product.variants.selector` accepts `setDefault` with option labels joined by `|`.

## Happy path (reaches payment)

1. `/honest?reset=1`
2. Type "earbuds" in the header search, press **Search**.
3. Click **Noisewave N2 Wireless Earbuds with ANC**.
4. Click **Add to cart**, then **View cart** in the toast (or click **Buy now**).
5. Click **Proceed to checkout**.
6. Click **Use saved address** (Standard delivery is already selected).
7. Click **Continue to review**, then **Continue to payment**.
8. Payment page total: ₹2,506 (₹2,499 item + ₹7 platform fee; delivery free).

Cancel walk: same as above but click **Add Plus** at checkout, **Pay ₹3,505**, then `/account` → **Cancel membership** (1 click) → **Continue** → `account.cancel.confirm`.

## Tests

`npx playwright test -c shops/market/tests/playwright.config.ts` against `next start -p 3001`. Covers the honest walk + totals, every registry id rendering on its declared step, no console errors, no checkbox pre-ticked, equal accept/decline variants, 390px overflow, and every `_neutral-test` override.

## Known gaps

- The Plus cancel flow (and `account.membership.cancel`, `membership.actions.cancel`, `cancel.*`) only renders for a member; the demo profile becomes a member by paying for an order that includes Plus. A plain walk without Plus will not render those ids.
- Warranty slots on the product page render only for eligible items (electronics, some appliances); `cart.addons.warranty` only when the cart holds one.
- Search is a simple token match (no typo tolerance or synonyms).
- The cart is not cleared after a sandbox payment (core keeps session state; harmless for agents).
- Delivery dates are computed client-side from today's date; before hydration a fixed reference date is used.
