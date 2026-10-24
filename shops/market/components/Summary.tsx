"use client";
import type { ReactNode } from "react";
import { Slot, formatINR, useHydrated, usePrice, useRiptide } from "@riptide/core";
import { productById, unitPrice } from "@/data/catalog";
import type { MarketState } from "@/shop.config";
import { Skeleton } from "./Ui";

function Amount({ n }: { n: number }) {
  return <span data-neg={n < 0 ? "" : undefined} className="tabular-nums">{n === 0 ? "Free" : formatINR(n)}</span>;
}

/** Itemised price breakdown for cart / checkout / review. Every amount comes from usePrice(step). */
export function PriceSummary({ step, state, children, title = "Price details" }: { step: "cart" | "checkout" | "review"; state: MarketState; children?: ReactNode; title?: string }) {
  const price = usePrice(step);
  const { registryIds } = useRiptide();
  const hydrated = useHydrated();
  const items = price.lines.filter((l) => l.kind === "item");
  const others = price.lines.filter((l) => l.kind !== "item" && l.selected);
  const subtotal = items.reduce((s, l) => s + l.amount, 0);
  const qty = state.cart.reduce((s, l) => s + l.qty, 0);
  const mrpSaving = state.cart.reduce((s, l) => {
    const p = productById(l.pid);
    if (!p) return s;
    const u = unitPrice(p, l.opts);
    return s + (u.mrp - u.price) * l.qty;
  }, 0);
  const subId = `${step}.summary.subtotal`;
  return (
    <Slot id={`${step}.summary.panel`} as="section" className="cw-panel p-5" aria-label={title}>
      <h2 className="cw-eyebrow mb-4">{title}</h2>
      {!hydrated ? (
        <div className="flex flex-col gap-3"><Skeleton className="h-4" /><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-2/3" /><Skeleton className="mt-3 h-6" /></div>
      ) : (
        <>
          <div className="cw-lines">
            {registryIds.has(subId) ? (
              <Slot id={subId} className="cw-line"><span>Items ({qty})</span><span className="tabular-nums">{formatINR(subtotal)}</span></Slot>
            ) : (
              <div data-dp={`${step}.summary.line.items`} className="cw-line"><span>Items ({qty})</span><span className="tabular-nums">{formatINR(subtotal)}</span></div>
            )}
            {others.map((l) => {
              const inner = <><span>{l.label}{l.detail && <small>{l.detail}</small>}</span><Amount n={l.amount} /></>;
              const id = `${step}.fees.${l.key}`;
              return registryIds.has(id)
                ? <Slot key={l.key} id={id} className="cw-line" data-kind={l.kind}>{inner}</Slot>
                : <div key={l.key} data-dp={`${step}.summary.line.${l.key}`} data-kind={l.kind} className="cw-line">{inner}</div>;
            })}
          </div>
          <div className="cw-total">
            <span>Total</span>
            <Slot id={`${step}.summary.total`} as="strong" className="cw-price text-xl">{formatINR(price.total)}</Slot>
          </div>
          <p className="mt-1 text-xs text-muted">Item prices include GST.</p>
          {mrpSaving > 0 && <p className="mt-3 rounded-lg bg-[#e4f1ea] px-3 py-2 text-sm font-semibold text-success">You save {formatINR(mrpSaving)} on MRP on this order</p>}
        </>
      )}
      {children}
    </Slot>
  );
}
