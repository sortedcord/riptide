"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Slot, SlotButton, formatINR, useFlow, useHydrated, useLineToggle, usePrice, useRiptide } from "@riptide/core";
import { productById } from "@/data/catalog";
import { DEMO_ADDRESS, PLUS_BENEFITS, STATES } from "@/data/content";
import type { Address } from "@/shop.config";
import { Icon } from "@/components/Icons";
import { CheckoutSteps, Skeleton } from "@/components/Ui";
import { PriceSummary } from "@/components/Summary";
import { addDays, deliveryDate, fmtDate, useCart, useMembership, useToday } from "@/components/hooks";

type Errors = Partial<Record<keyof Address, string>>;
const FIELDS: { k: keyof Address; label: string; auto: string; mode?: "numeric" | "tel"; optional?: boolean }[] = [
  { k: "name", label: "Full name", auto: "name" },
  { k: "phone", label: "Mobile number (10 digits)", auto: "tel", mode: "tel" },
  { k: "line1", label: "Flat, house no., building, street", auto: "address-line1" },
  { k: "line2", label: "Area, locality (optional)", auto: "address-line2", optional: true },
  { k: "city", label: "City", auto: "address-level2" },
  { k: "pin", label: "PIN code", auto: "postal-code", mode: "numeric" },
];

function validate(a: Partial<Address>): Errors {
  const e: Errors = {};
  if (!a.name?.trim()) e.name = "Enter the recipient's full name.";
  if (!/^[6-9]\d{9}$/.test(a.phone ?? "")) e.phone = "Enter a 10-digit mobile number starting with 6–9.";
  if (!a.line1?.trim()) e.line1 = "Enter the flat, house or street.";
  if (!a.city?.trim()) e.city = "Enter the city.";
  if (!a.state) e.state = "Choose a state.";
  if (!/^[1-8]\d{5}$/.test(a.pin ?? "")) e.pin = "Enter a valid 6-digit PIN code.";
  return e;
}

export default function Checkout() {
  const { base } = useRiptide();
  const flow = useFlow("purchase");
  const router = useRouter();
  const hydrated = useHydrated();
  const today = useToday();
  const { state, set } = useCart();
  const { benefits } = useMembership();
  const price = usePrice("checkout");
  const [express, setExpress] = useLineToggle("express");
  const [nextday, setNextday] = useLineToggle("nextday");
  const [plus, setPlus] = useLineToggle("plus");
  const [plusDeclined, setPlusDeclined] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Partial<Address>>({});
  const [errors, setErrors] = useState<Errors>({});
  const [blocked, setBlocked] = useState(false);

  if (!hydrated) return <main data-riptide-step="checkout" className="cw-wrap pt-6" aria-busy><Skeleton className="h-6 w-80" /><div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]"><Skeleton className="h-96" /><Skeleton className="h-72" /></div></main>;
  if (!state.cart.length) {
    return (
      <main data-riptide-step="checkout" className="cw-wrap pt-6">
        <section className="cw-panel-flat flex flex-col items-center gap-3 px-6 py-14 text-center">
          <h1 className="cw-h2">Your cart is empty</h1>
          <p className="text-muted">Add something to your cart before checking out.</p>
          <Link href={`${base}/search`} className="rt-btn" data-variant="primary">Start shopping</Link>
        </section>
      </main>
    );
  }

  const items = state.cart.map((l) => productById(l.pid)).filter((p) => !!p);
  const canExpress = items.every((p) => p.delivery !== "standard");
  const canNextday = items.every((p) => p.delivery === "nextday");
  const speed = nextday && canNextday ? "nextday" : express && canExpress ? "express" : "standard";
  const choose = (s: "standard" | "express" | "nextday") => { setExpress(s === "express"); setNextday(s === "nextday"); };
  const from = today ?? new Date("2026-10-24T00:00:00");
  const by = (d: number) => fmtDate(deliveryDate(from, d), { weekday: "long", day: "numeric", month: "short" });
  const fee = (k: string) => price.lines.find((l) => l.key === k)?.amount ?? 0;
  const delivery = price.lines.find((l) => l.key === "delivery");
  const renew = addDays(from, 365);

  const applySaved = () => { set({ address: DEMO_ADDRESS }); setEditing(false); setErrors({}); setBlocked(false); };
  const saveNew = () => {
    const e = validate(draft);
    setErrors(e);
    if (Object.keys(e).length) return;
    set({ address: { ...(draft as Address), name: draft.name!.trim() } });
    setEditing(false);
    setBlocked(false);
  };
  const cont = () => {
    if (!state.address) { setBlocked(true); return; }
    if (speed === "standard" && (express || nextday)) choose("standard");
    router.push(flow.next("checkout"));
  };

  const opt = (s: "standard" | "express" | "nextday", id: string, title: string, sub: string, amount: string, disabled = false) => (
    <Slot key={s} id={id} as="label" className={`cw-radio-card ${disabled ? "cursor-not-allowed opacity-55" : ""}`}>
      <input type="radio" name="speed" value={s} checked={speed === s} disabled={disabled} onChange={() => choose(s)} />
      <span className="flex-1"><strong className="block">{title}</strong><span className="text-sm text-muted">{sub}</span></span>
      <span className="font-semibold tabular-nums">{amount}</span>
    </Slot>
  );

  return (
    <main data-riptide-step="checkout" className="cw-wrap pt-6">
      <CheckoutSteps current={1} />
      <h1 className="mt-5 text-3xl font-semibold">Address &amp; delivery</h1>
      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex flex-col gap-6">
          <section className="cw-panel-flat p-5" aria-labelledby="addr-h">
            <h2 id="addr-h" className="text-lg font-semibold">1. Delivery address</h2>
            {state.address && !editing ? (
              <div className="mt-3 flex flex-col gap-3 rounded-[var(--rt-radius-sm)] border border-primary bg-[#f6faf7] p-4 sm:flex-row sm:items-start sm:justify-between">
                <address className="not-italic text-sm leading-relaxed">
                  <strong className="text-base">{state.address.name}</strong><br />
                  {state.address.line1}{state.address.line2 ? `, ${state.address.line2}` : ""}<br />
                  {state.address.city}, {state.address.state} {state.address.pin}<br />
                  Phone: {state.address.phone}
                </address>
                <button type="button" className="rt-btn" data-variant="secondary" onClick={() => { setDraft(state.address ?? {}); setEditing(true); }}>Change address</button>
              </div>
            ) : (
              <div className="mt-3 flex flex-col gap-4">
                <div className="flex flex-col gap-3 rounded-[var(--rt-radius-sm)] bg-surface-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm"><strong>Saved on your demo profile:</strong> {DEMO_ADDRESS.name}, {DEMO_ADDRESS.line1}, {DEMO_ADDRESS.city} {DEMO_ADDRESS.pin}</p>
                  <SlotButton id="checkout.address.saved" variant="primary" onClick={applySaved}>Use saved address</SlotButton>
                </div>
                <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted">or add a new address</p>
                <Slot id="checkout.address.form" as="form" noValidate className="grid gap-x-4 sm:grid-cols-2" onSubmit={(e: React.FormEvent) => { e.preventDefault(); saveNew(); }}>
                  {FIELDS.map((f) => (
                    <div key={f.k} className={`rt-field ${f.k === "line1" || f.k === "line2" ? "sm:col-span-2" : ""}`}>
                      <label htmlFor={`a-${f.k}`}>{f.label}</label>
                      <input id={`a-${f.k}`} className="rt-input" autoComplete={f.auto} inputMode={f.mode} value={draft[f.k] ?? ""}
                        maxLength={f.k === "pin" ? 6 : f.k === "phone" ? 10 : 120}
                        onChange={(e) => setDraft({ ...draft, [f.k]: f.mode ? e.target.value.replace(/\D/g, "") : e.target.value })}
                        aria-invalid={!!errors[f.k]} aria-describedby={errors[f.k] ? `e-${f.k}` : undefined} />
                      {errors[f.k] && <p id={`e-${f.k}`} className="cw-error">{errors[f.k]}</p>}
                    </div>
                  ))}
                  <div className="rt-field">
                    <label htmlFor="a-state">State</label>
                    <select id="a-state" className="rt-input" value={draft.state ?? ""} onChange={(e) => setDraft({ ...draft, state: e.target.value })} aria-invalid={!!errors.state} aria-describedby={errors.state ? "e-state" : undefined}>
                      <option value="" disabled>Choose a state</option>
                      {STATES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                    {errors.state && <p id="e-state" className="cw-error">{errors.state}</p>}
                  </div>
                  <div className="flex items-end gap-2 pb-[.9rem] sm:col-span-2">
                    <SlotButton id="checkout.address.submit" as="button" type="submit" variant="secondary">Deliver to this address</SlotButton>
                    {state.address && <button type="button" className="rt-btn" data-variant="ghost" onClick={() => setEditing(false)}>Cancel</button>}
                  </div>
                </Slot>
              </div>
            )}
            {blocked && !state.address && <p className="cw-error mt-2" role="alert">Choose or add a delivery address to continue.</p>}
          </section>

          <section className="cw-panel-flat p-5" aria-labelledby="speed-h">
            <h2 id="speed-h" className="text-lg font-semibold">2. Delivery speed</h2>
            <p className="text-sm text-muted">Prices are added to the standard delivery fee{delivery ? ` (${delivery.amount === 0 ? "free on this order" : formatINR(delivery.amount)})` : ""}.</p>
            <Slot id="checkout.delivery.options" role="radiogroup" aria-labelledby="speed-h" className="mt-3 flex flex-col gap-2">
              {opt("standard", "checkout.delivery.standard", "Standard", `4–6 days · arrives by ${by(6)}`, "No extra charge")}
              {opt("express", "checkout.delivery.express", benefits ? "Express (free with Plus)" : "Express", canExpress ? `2 days · arrives by ${by(2)}` : "Not available for every item in your cart", `+${formatINR(fee("express"))}`, !canExpress)}
              {opt("nextday", "checkout.delivery.nextday", "Next-day", canNextday ? `Arrives tomorrow, ${by(1)}` : "Not available for every item in your cart", `+${formatINR(fee("nextday"))}`, !canNextday)}
            </Slot>
          </section>

          {!benefits && (
            <Slot id="checkout.plus.card" as="section" aria-labelledby="plus-h" className="cw-panel-flat overflow-hidden">
              <div className="flex flex-col gap-4 bg-cream p-5 sm:flex-row sm:items-start">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-ink text-saffron"><Icon name="spark" size={24} /></span>
                <div className="flex-1">
                  <p className="cw-eyebrow !text-[#7a5a1a]">Optional membership</p>
                  <h2 id="plus-h" className="text-lg font-semibold">Cartwheel Plus · {formatINR(fee("plus"))} per year</h2>
                  <ul className="mt-2 list-disc space-y-0.5 pl-5 text-sm text-[#4a3c1e]">{PLUS_BENEFITS.map((b) => <li key={b}>{b}</li>)}</ul>
                  <Slot id="checkout.plus.terms" as="p" className="mt-3 text-sm text-[#4a3c1e]">
                    {`Charged ${formatINR(fee("plus"))} today with this order. Renews automatically on ${fmtDate(renew)} at ${formatINR(fee("plus"))} per year until you cancel. Cancel anytime from Account → Membership in 2 steps; full refund if you cancel within 14 days without using a benefit.`}
                  </Slot>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 p-4">
                <SlotButton id="checkout.plus.add" variant="secondary" aria-pressed={plus} onClick={() => { setPlus(true); setPlusDeclined(false); }}>{plus ? "Plus added" : "Add Plus"}</SlotButton>
                <SlotButton id="checkout.plus.decline" variant="secondary" aria-pressed={!plus && plusDeclined} onClick={() => { setPlus(false); setPlusDeclined(true); }}>No, thanks</SlotButton>
              </div>
            </Slot>
          )}
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-4 lg:self-start">
          <PriceSummary step="checkout" state={state}>
            <SlotButton id="checkout.cta.continue" variant="primary" className="mt-5 w-full" onClick={cont}>Continue to review</SlotButton>
            <Link href={`${base}/cart`} className="rt-link mt-3 block text-center text-sm">Back to cart</Link>
          </PriceSummary>
        </div>
      </div>
    </main>
  );
}
