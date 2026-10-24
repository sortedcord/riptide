"use client";
import Link from "next/link";
import { Slot, formatINR, useFlow, useHydrated, useLineToggle, usePrice, useRiptide } from "@riptide/core";

export default function Cart() {
  const price = usePrice("cart");
  const flow = useFlow("purchase");
  const { registryIds } = useRiptide();
  const hydrated = useHydrated();
  const [wrap, setWrap] = useLineToggle("giftwrap");
  const items = price.lines.filter((l) => l.kind === "item");
  if (hydrated && !items.length) return <main data-riptide-step="cart" className="mx-auto max-w-6xl px-4 py-8"><h1 className="text-2xl">Your cart is empty</h1></main>;
  return (
    <main data-riptide-step="cart" className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-[1fr_360px]">
      <section>
        <h1 className="font-heading text-3xl font-bold">Cart</h1>
        <ul className="mt-4 flex flex-col gap-2">
          {items.map((l) => <li key={l.key} className="flex justify-between"><span>{l.label} <small className="text-muted">{l.detail}</small></span><span>{formatINR(l.amount)}</span></li>)}
        </ul>
        <Slot id="cart.addons.giftwrap" as="label" className="rt-check mt-6">
          <input type="checkbox" checked={wrap} onChange={(e) => setWrap(e.target.checked)} /> <span>Add gift wrap (+{formatINR(39)})</span>
        </Slot>
      </section>
      <Slot id="cart.summary.panel" as="aside" className="rt-card flex flex-col gap-2">
        {price.lines.filter((l) => l.kind !== "item" && l.selected).map((l) => (
          registryIds.has(`cart.fees.${l.key}`)
            ? <Slot key={l.key} id={`cart.fees.${l.key}`} className="rt-line"><span>{l.label}</span><span>{formatINR(l.amount)}</span></Slot>
            : <div key={l.key} data-dp={`cart.summary.line.${l.key}`} className="rt-line"><span>{l.label}</span><span>{formatINR(l.amount)}</span></div>
        ))}
        <div className="rt-line rt-line--total"><span>Total</span><Slot id="cart.summary.total" as="strong">{formatINR(price.total)}</Slot></div>
        <Slot id="cart.cta.checkout" as={Link} href={flow.next("cart")} className="rt-btn" variant="primary">Proceed to pay</Slot>
      </Slot>
    </main>
  );
}
