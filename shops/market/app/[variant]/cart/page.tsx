"use client";
import Link from "next/link";
import { useState } from "react";
import { Slot, SlotButton, formatINR, useFlow, useHydrated, useLineToggle, usePrice, useRiptide } from "@riptide/core";
import { artColor, productById, unitPrice, variantLabel } from "@/data/catalog";
import { COUPONS, FEES, evaluateCoupon, lineKey, type CartLine } from "@/shop.config";
import { Art } from "@/components/Art";
import { Icon } from "@/components/Icons";
import { CheckoutSteps, Skeleton } from "@/components/Ui";
import { PriceSummary } from "@/components/Summary";
import { useCart } from "@/components/hooks";

export default function Cart() {
  const { base } = useRiptide();
  const flow = useFlow("purchase");
  const hydrated = useHydrated();
  const cart = useCart();
  const { state } = cart;
  const price = usePrice("cart");
  const [warranty, setWarranty] = useLineToggle("warranty");
  const [wrap, setWrap] = useLineToggle("giftwrap");
  const [code, setCode] = useState("");
  const [couponMsg, setCouponMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const warrantyLine = price.lines.find((l) => l.key === "warranty");

  const apply = () => {
    if (!code.trim()) return setCouponMsg({ ok: false, text: "Enter a coupon code." });
    const r = evaluateCoupon(code, state.cart);
    if (!r.ok) return setCouponMsg({ ok: false, text: r.error });
    cart.set({ coupon: code.trim().toUpperCase() });
    setCouponMsg({ ok: true, text: `${code.trim().toUpperCase()} applied: ${formatINR(r.amount)} off.` });
    setCode("");
  };
  const applied = state.coupon ? evaluateCoupon(state.coupon, state.cart) : null;

  if (!hydrated) {
    return (
      <main data-riptide-step="cart" className="cw-wrap pt-6" aria-busy>
        <Skeleton className="h-6 w-72" />
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]"><Skeleton className="h-72" /><Skeleton className="h-72" /></div>
      </main>
    );
  }

  if (!state.cart.length) {
    return (
      <main data-riptide-step="cart" className="cw-wrap pt-6">
        <CheckoutSteps current={0} />
        <section className="cw-panel-flat mt-6 flex flex-col items-center gap-3 px-6 py-14 text-center">
          <span className="rounded-full bg-surface-2 p-4 text-muted"><Icon name="cart" size={32} /></span>
          <h1 className="cw-h2">Your cart is empty</h1>
          <p className="max-w-md text-muted">Browse categories or search for something. Items you add will appear here with every fee shown.</p>
          <Link href={`${base}/search`} className="rt-btn" data-variant="primary">Start shopping</Link>
        </section>
        <Saved lines={state.saved} cart={cart} base={base} />
      </main>
    );
  }

  return (
    <main data-riptide-step="cart" className="cw-wrap pt-6">
      <CheckoutSteps current={0} />
      <h1 className="mt-5 text-3xl font-semibold">Shopping cart</h1>
      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex flex-col gap-6">
          <Slot id="cart.items.list" as="ul" className="cw-panel-flat divide-y divide-line" aria-label="Items in your cart">
            {state.cart.map((l) => <Row key={lineKey(l)} l={l} cart={cart} base={base} />)}
          </Slot>

          <Slot id="cart.addons.panel" as="section" aria-labelledby="extras-h" className="cw-panel-flat p-5">
            <h2 id="extras-h" className="text-lg font-semibold">Optional extras</h2>
            <p className="text-sm text-muted">Not included unless you tick them. Each shows as its own line in the price details.</p>
            <div className="mt-4 flex flex-col gap-4">
              {warrantyLine && (
                <Slot id="cart.addons.warranty" as="label" className="rt-check">
                  <input type="checkbox" checked={warranty} onChange={(e) => setWarranty(e.target.checked)} />
                  <span><strong className="font-semibold">Extended warranty, 1 extra year (+{formatINR(warrantyLine.amount)})</strong>
                    <span className="block text-sm text-muted">{warrantyLine.detail}. Covers manufacturing defects after the brand warranty ends. Refundable within 30 days.</span></span>
                </Slot>
              )}
              <Slot id="cart.addons.giftwrap" as="label" className="rt-check">
                <input type="checkbox" checked={wrap} onChange={(e) => setWrap(e.target.checked)} />
                <span><strong className="font-semibold">Gift wrap (+{formatINR(FEES.giftwrap)})</strong>
                  <span className="block text-sm text-muted">Every item wrapped in recycled paper, with a printed note. Prices are left off the packing slip.</span></span>
              </Slot>
            </div>
          </Slot>

          <Saved lines={state.saved} cart={cart} base={base} />
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-4 lg:self-start">
          <section className="cw-panel-flat p-5" aria-labelledby="coupon-h">
            <h2 id="coupon-h" className="flex items-center gap-2 font-semibold" style={{ fontFamily: "var(--rt-font-body)" }}><Icon name="tag" size={18} /> Coupons</h2>
            {applied?.ok ? (
              <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-[#e4f1ea] px-3 py-2 text-sm">
                <span><strong>{state.coupon}</strong> applied · {formatINR(applied.amount)} off</span>
                <button type="button" className="rt-btn" data-variant="link" onClick={() => { cart.set({ coupon: undefined }); setCouponMsg(null); }}>Remove</button>
              </div>
            ) : (
              <form className="mt-3" onSubmit={(e) => { e.preventDefault(); apply(); }} noValidate>
                <label htmlFor="coupon" className="sr-only">Coupon code</label>
                <div className="flex gap-2">
                  <Slot id="cart.coupon.input" className="flex-1">
                    <input id="coupon" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter coupon code"
                      className="rt-input !min-h-10 uppercase" aria-invalid={couponMsg?.ok === false} aria-describedby="coupon-msg" />
                  </Slot>
                  <SlotButton id="cart.coupon.apply" as="button" type="submit" variant="secondary" className="!min-h-10">Apply</SlotButton>
                </div>
                {state.coupon && applied && !applied.ok && <p className="cw-error mt-2">{state.coupon} no longer applies: {applied.error}</p>}
              </form>
            )}
            <p id="coupon-msg" aria-live="polite" className={`mt-2 min-h-5 text-sm ${couponMsg?.ok === false ? "cw-error" : "text-success"}`}>{couponMsg?.text ?? ""}</p>
            <details className="text-sm">
              <summary className="cursor-pointer font-semibold text-[var(--rt-accent)]">See available coupons</summary>
              <ul className="mt-2 flex flex-col gap-1.5 text-muted">
                {COUPONS.map((c) => <li key={c.code}><strong className="text-fg">{c.code}</strong>: {c.title}</li>)}
              </ul>
            </details>
          </section>

          <PriceSummary step="cart" state={state}>
            <Slot id="cart.cta.checkout" as={Link} href={flow.next("cart")} className="rt-btn mt-5 w-full" variant="primary">Proceed to checkout</Slot>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted"><Icon name="lock" size={14} /> Delivery speed and address are chosen next.</p>
          </PriceSummary>
        </div>
      </div>
    </main>
  );
}

type CartApi = ReturnType<typeof useCart>;

function Row({ l, cart, base }: { l: CartLine; cart: CartApi; base: string }) {
  const p = productById(l.pid);
  if (!p) return null;
  const u = unitPrice(p, l.opts);
  const k = lineKey(l);
  const v = variantLabel(p, l.opts);
  return (
    <li data-dp={`cart.items.row.${k}`} className="flex gap-4 p-4">
      <Link href={`${base}/product/${p.id}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-[10px] border border-line md:h-28 md:w-28">
        <Art kind={p.art} color={artColor(p, l.opts)} accent={p.colors[1]} className="h-full w-full" label={p.title} />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Link href={`${base}/product/${p.id}`} className="font-semibold leading-snug hover:underline">{p.title}</Link>
        {v && <p className="text-sm text-muted">{v}</p>}
        <p className="text-xs text-muted">Sold by {p.seller.name} · {p.stock <= 5 ? `Only ${p.stock} left` : "In stock"}</p>
        <p className="flex flex-wrap items-baseline gap-x-2"><span className="cw-price">{formatINR(u.price)}</span><span className="cw-mrp text-sm">{formatINR(u.mrp)}</span></p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-full border border-line" role="group" aria-label={`Quantity for ${p.title}`}>
            <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-2" aria-label={l.qty === 1 ? `Remove ${p.title}` : `Decrease quantity of ${p.title}`} onClick={() => cart.setQty(l, l.qty - 1)}>
              <Icon name={l.qty === 1 ? "trash" : "minus"} size={16} />
            </button>
            <span className="w-8 text-center font-semibold tabular-nums" aria-live="polite">{l.qty}</span>
            <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-2 disabled:opacity-40" aria-label={`Increase quantity of ${p.title}`} disabled={l.qty >= Math.min(10, p.stock)} onClick={() => cart.setQty(l, l.qty + 1)}>
              <Icon name="plus" size={16} />
            </button>
          </div>
          <button type="button" className="rt-btn" data-variant="link" onClick={() => cart.saveForLater(l)}>Save for later</button>
          <button type="button" className="rt-btn" data-variant="link" onClick={() => cart.remove(l)}>Remove</button>
        </div>
      </div>
      <p className="hidden shrink-0 text-right font-semibold tabular-nums sm:block">{formatINR(u.price * l.qty)}</p>
    </li>
  );
}

function Saved({ lines, cart, base }: { lines: CartLine[]; cart: CartApi; base: string }) {
  return (
    <Slot id="cart.saved.list" as="section" aria-labelledby="saved-h" className="mt-0">
      <h2 id="saved-h" className="text-lg font-semibold">Saved for later ({lines.length})</h2>
      {lines.length === 0 ? (
        <p className="mt-1 text-sm text-muted">Items you save for later appear here. They aren&apos;t included in your total.</p>
      ) : (
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {lines.map((l) => {
            const p = productById(l.pid);
            if (!p) return null;
            return (
              <li key={lineKey(l)} className="cw-panel-flat flex gap-3 p-3">
                <Link href={`${base}/product/${p.id}`} className="h-16 w-16 shrink-0 overflow-hidden rounded-lg"><Art kind={p.art} color={artColor(p, l.opts)} accent={p.colors[1]} className="h-full w-full" /></Link>
                <div className="min-w-0 text-sm">
                  <p className="line-clamp-2 font-semibold">{p.title}</p>
                  <p className="cw-price">{formatINR(unitPrice(p, l.opts).price)}</p>
                  <div className="mt-1 flex gap-3">
                    <button type="button" className="rt-btn" data-variant="link" onClick={() => cart.moveToCart(l)}>Move to cart</button>
                    <button type="button" className="rt-btn" data-variant="link" onClick={() => cart.removeSaved(l)}>Remove</button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Slot>
  );
}
