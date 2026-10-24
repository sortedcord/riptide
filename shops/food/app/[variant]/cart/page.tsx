"use client";
import Link from "next/link";
import { useState } from "react";
import { Slot, SlotButton, formatINR, useFlow, useHydrated, useLineToggle, usePrice, useRiptide, useSession, useSlotDefault } from "@riptide/core";
import { itemByIdLookup, restaurantById } from "@/data/restaurants";
import { PASS_PRICE, couponDiscount, couponsFor, findCoupon } from "@/data/profile";
import { lineDetail, type FoodState } from "@/shop.config";
import { FoodArt } from "@/components/FoodArt";
import { Bill, Icon, Progress, QtyStepper, Skeleton, VegMark } from "@/components/ui";

export default function CartPage() {
  const { base } = useRiptide();
  const [s, set] = useSession<FoodState>();
  const hydrated = useHydrated();
  const price = usePrice("cart");
  const flow = useFlow("purchase");
  const [pass, setPass] = useLineToggle("pass");
  const [passDeclined, setPassDeclined] = useState(false);
  const [code, setCode] = useState(useSlotDefault<string>("cart.coupon.input", ""));
  const [couponMsg, setCouponMsg] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const r = restaurantById(s.restaurantId);

  if (!hydrated) {
    return (
      <main data-riptide-step="cart" className="ff-wrap ff-checkout">
        <Skeleton className="h-8 w-48" />
        <div className="ff-checkout__grid"><Skeleton className="h-72" /><Skeleton className="h-72" /></div>
      </main>
    );
  }
  if (!r || !s.cart.length) {
    return (
      <main data-riptide-step="cart" className="ff-wrap ff-narrow">
        <div className="ff-empty">
          <FoodArt art="bowl" seed="empty-cart-page" className="ff-empty__art" />
          <h1 className="ff-h2">Your cart is empty</h1>
          <p>Browse restaurants near you and add a dish to start an order.</p>
          <Link href={base} className="rt-btn" data-variant="primary">Browse restaurants</Link>
        </div>
      </main>
    );
  }

  const itemTotal = price.lines.filter((l) => l.kind === "item").reduce((t, l) => t + l.amount, 0);
  const applied = findCoupon(s.coupon);
  const appliedWorks = applied ? couponDiscount(applied, r.id, itemTotal) > 0 : false;
  const setQty = (uid: string, qty: number) =>
    set((st) => {
      const cart = qty <= 0 ? st.cart.filter((l) => l.uid !== uid) : st.cart.map((l) => (l.uid === uid ? { ...l, qty: Math.min(20, qty) } : l));
      return { cart, ...(cart.length ? {} : { restaurantId: null, coupon: null }) };
    });
  const apply = (raw: string) => {
    const c = findCoupon(raw);
    if (!raw.trim()) return setCouponMsg({ tone: "err", text: "Enter a coupon code." });
    if (!c) return setCouponMsg({ tone: "err", text: `“${raw.trim().toUpperCase()}” isn't a valid code.` });
    if (c.restaurants && !c.restaurants.includes(r.id)) return setCouponMsg({ tone: "err", text: `${c.code} isn't valid at ${r.name}.` });
    if (itemTotal < c.min) return setCouponMsg({ tone: "err", text: `Add ${formatINR(c.min - itemTotal)} more to use ${c.code}.` });
    set({ coupon: c.code });
    setCode("");
    setCouponMsg({ tone: "ok", text: `${c.code} applied. You save ${formatINR(couponDiscount(c, r.id, itemTotal))}.` });
  };

  return (
    <main data-riptide-step="cart" className="ff-wrap ff-checkout">
      <Progress current="cart" />
      <Slot id="cart.header.title" as="h1" className="ff-display ff-display--sm">Your cart</Slot>
      <Slot id="cart.promo.banner" className="ff-promo" />

      <div className="ff-checkout__grid">
        <div className="ff-stack">
          <Slot id="cart.items.list" as="section" aria-label="Items" className="ff-card ff-cartitems">
            <div className="ff-cartitems__head">
              <FoodArt art={r.art} seed={r.id} className="ff-cartitems__logo" />
              <div>
                <h2 className="ff-h3">{r.name}</h2>
                <p className="ff-muted text-sm">{r.eta[0]}–{r.eta[1]} min · {r.cuisines.slice(0, 2).join(", ")}</p>
              </div>
            </div>
            <ul>
              {s.cart.map((l) => {
                const it = itemByIdLookup(l.itemId);
                if (!it) return null;
                const amt = price.lines.find((x) => x.key === `item-${l.uid}`)?.amount ?? 0;
                return (
                  <li key={l.uid} data-dp={`cart.summary.line.item-${l.uid}`} className="ff-cartitem">
                    <VegMark veg={it.veg} />
                    <div className="ff-cartitem__name"><strong>{it.name}</strong><small>{lineDetail(it, l)}</small></div>
                    <QtyStepper qty={l.qty} label={it.name} onChange={(q) => setQty(l.uid, q)} />
                    <span className="ff-cartitem__amt">{formatINR(amt)}</span>
                  </li>
                );
              })}
            </ul>
            <Slot id="cart.cta.add-more" as={Link} href={`${base}/restaurant/${r.id}`} className="rt-link">+ Add more items</Slot>
          </Slot>

          <Slot id="cart.coupon.section" as="section" aria-labelledby="ff-coupon-h" className="ff-card">
            <h2 id="ff-coupon-h" className="ff-h3"><Icon name="tag" size={18} /> Offers &amp; coupons</h2>
            {applied && (
              <div className="ff-applied" data-ok={appliedWorks || undefined}>
                <span><strong>{applied.code}</strong> {appliedWorks ? "applied" : `needs an item total of ${formatINR(applied.min)} or more`}</span>
                <button type="button" className="rt-btn" data-variant="link" onClick={() => { set({ coupon: null }); setCouponMsg(null); }}>Remove</button>
              </div>
            )}
            <form className="ff-coupon" onSubmit={(e) => { e.preventDefault(); apply(code); }}>
              <Slot id="cart.coupon.input" className="ff-coupon__field">
                <label htmlFor="ff-coupon" className="sr-only">Coupon code</label>
                <input id="ff-coupon" className="rt-input" placeholder="Enter coupon code" value={code} onChange={(e) => setCode(e.target.value)} autoComplete="off" />
              </Slot>
              <SlotButton id="cart.coupon.apply" as="button" type="submit" variant="secondary">Apply</SlotButton>
            </form>
            {couponMsg && <p role="status" className={couponMsg.tone === "ok" ? "ff-ok" : "ff-err"}>{couponMsg.text}</p>}
            <ul className="ff-coupons">
              {couponsFor(r.id).map((c) => (
                <li key={c.code}>
                  <div><strong>{c.code}</strong> · {c.title}<small>{c.terms}</small></div>
                  {s.coupon === c.code
                    ? <span className="ff-pill">Applied</span>
                    : <button type="button" className="rt-btn" data-variant="secondary" onClick={() => apply(c.code)} aria-label={`Apply ${c.code}`}>Apply</button>}
                </li>
              ))}
            </ul>
          </Slot>

          <Slot id="cart.pass.card" as="section" aria-labelledby="ff-pass-h" className="ff-card ff-pass">
            <div className="ff-pass__badge" aria-hidden><Icon name="scooter" size={22} /></div>
            <div className="ff-pass__body">
              <h2 id="ff-pass-h" className="ff-h3">Forkful Pass <span className="ff-pill">Optional</span></h2>
              <p>Free delivery on orders above ₹199 for 30 days, starting from your next order. This order&apos;s fees stay as shown.</p>
              <p className="ff-pass__terms"><strong>{formatINR(PASS_PRICE)} for 1 month</strong>, charged once with this order. It does <strong>not</strong> renew automatically; we&apos;ll ask before any renewal.</p>
              <div className="ff-pair">
                <SlotButton id="cart.pass.add" variant="secondary" aria-pressed={pass} onClick={() => { setPass(true); setPassDeclined(false); }}>
                  {pass ? "✓ Pass added" : `Add Pass for ${formatINR(PASS_PRICE)}`}
                </SlotButton>
                <SlotButton id="cart.pass.decline" variant="secondary" aria-pressed={!pass && passDeclined} onClick={() => { setPass(false); setPassDeclined(true); }}>
                  {pass ? "Remove Pass" : "No, thanks"}
                </SlotButton>
              </div>
            </div>
          </Slot>
        </div>

        <div className="ff-stack ff-sticky">
          <Bill step="cart" />
          <Slot id="cart.cta.checkout" as={Link} href={flow.next("cart")} className="rt-btn ff-block" variant="primary">Proceed to checkout</Slot>
          <p className="rt-fine ff-center">Tip, donation and cutlery are optional and chosen at checkout.</p>
        </div>
      </div>
    </main>
  );
}
