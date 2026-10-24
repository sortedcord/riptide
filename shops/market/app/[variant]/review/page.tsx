"use client";
import Link from "next/link";
import { Slot, formatINR, useFlow, useHydrated, useLineToggle, useRiptide, useSlotDefault } from "@riptide/core";
import { artColor, productById, unitPrice, variantLabel } from "@/data/catalog";
import { lineKey } from "@/shop.config";
import { Art } from "@/components/Art";
import { CheckoutSteps, Skeleton } from "@/components/Ui";
import { PriceSummary } from "@/components/Summary";
import { deliveryDate, fmtDate, useCart, useToday } from "@/components/hooks";

export default function Review() {
  const { base } = useRiptide();
  const flow = useFlow("purchase");
  const hydrated = useHydrated();
  const today = useToday();
  const { state, set } = useCart();
  const [express] = useLineToggle("express");
  const [nextday] = useLineToggle("nextday");
  const optinDefault = useSlotDefault<boolean>("review.optin.marketing", false);
  const optin = state.optin ?? optinDefault;

  if (!hydrated) return <main data-riptide-step="review" className="cw-wrap pt-6" aria-busy><Skeleton className="h-6 w-80" /><div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]"><Skeleton className="h-96" /><Skeleton className="h-72" /></div></main>;
  if (!state.cart.length || !state.address) {
    return (
      <main data-riptide-step="review" className="cw-wrap pt-6">
        <section className="cw-panel-flat flex flex-col items-center gap-3 px-6 py-14 text-center">
          <h1 className="cw-h2">{state.cart.length ? "Add a delivery address first" : "Your cart is empty"}</h1>
          <Link href={`${base}/${state.cart.length ? "checkout" : "search"}`} className="rt-btn" data-variant="primary">{state.cart.length ? "Go to address & delivery" : "Start shopping"}</Link>
        </section>
      </main>
    );
  }
  const a = state.address;
  const days = nextday ? 1 : express ? 2 : 6;
  const from = today ?? new Date("2026-10-24T00:00:00");
  const speedName = nextday ? "Next-day" : express ? "Express" : "Standard";

  return (
    <main data-riptide-step="review" className="cw-wrap pt-6">
      <CheckoutSteps current={2} />
      <h1 className="mt-5 text-3xl font-semibold">Review your order</h1>
      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex flex-col gap-6">
          <Slot id="review.address.card" as="section" aria-labelledby="ship-h" className="cw-panel-flat grid gap-4 p-5 sm:grid-cols-2">
            <div>
              <h2 id="ship-h" className="cw-eyebrow">Delivering to</h2>
              <address className="mt-2 not-italic text-sm leading-relaxed"><strong>{a.name}</strong><br />{a.line1}{a.line2 ? `, ${a.line2}` : ""}<br />{a.city}, {a.state} {a.pin}<br />Phone: {a.phone}</address>
              <Link href={`${base}/checkout`} className="rt-link mt-2 inline-block text-sm">Change</Link>
            </div>
            <div>
              <h2 className="cw-eyebrow">Delivery</h2>
              <p className="mt-2 text-sm"><strong>{speedName}</strong>, arrives by <strong>{fmtDate(deliveryDate(from, days), { weekday: "long", day: "numeric", month: "short" })}</strong></p>
              <Link href={`${base}/checkout`} className="rt-link mt-2 inline-block text-sm">Change speed</Link>
            </div>
          </Slot>

          <Slot id="review.items.list" as="section" aria-labelledby="items-h" className="cw-panel-flat p-5">
            <h2 id="items-h" className="text-lg font-semibold">Items ({state.cart.reduce((n, l) => n + l.qty, 0)})</h2>
            <ul className="mt-3 divide-y divide-line">
              {state.cart.map((l) => {
                const p = productById(l.pid);
                if (!p) return null;
                const u = unitPrice(p, l.opts);
                return (
                  <li key={lineKey(l)} className="flex gap-3 py-3">
                    <span className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-line"><Art kind={p.art} color={artColor(p, l.opts)} accent={p.colors[1]} className="h-full w-full" /></span>
                    <div className="min-w-0 flex-1 text-sm">
                      <p className="font-semibold">{p.title}</p>
                      <p className="text-muted">{[variantLabel(p, l.opts), `Qty ${l.qty}`, `Sold by ${p.seller.name}`].filter(Boolean).join(" · ")}</p>
                    </div>
                    <p className="font-semibold tabular-nums">{formatINR(u.price * l.qty)}</p>
                  </li>
                );
              })}
            </ul>
            <Link href={`${base}/cart`} className="rt-link text-sm">Edit cart</Link>
          </Slot>
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-4 lg:self-start">
          <PriceSummary step="review" state={state} title="Order summary">
            <Slot id="review.optin.marketing" as="label" className="rt-check mt-5 text-sm">
              <input type="checkbox" checked={optin} onChange={(e) => set({ optin: e.target.checked })} />
              <span>Send me offers and updates by email</span>
            </Slot>
            <Slot id="review.terms.text" as="p" className="mt-3 text-xs text-muted">By continuing you agree to Cartwheel&apos;s Terms of Use and Returns Policy.</Slot>
            <Slot id="review.cta.pay" as={Link} href={flow.next("review")} className="rt-btn mt-4 w-full" variant="primary">Continue to payment</Slot>
          </PriceSummary>
        </div>
      </div>
    </main>
  );
}
