"use client";
import Link from "next/link";
import { useMemo } from "react";
import { Slot, computePrice, formatINR, useFlow, useRiptide, useHydrated, type PriceResult } from "@riptide/core";
import { config, type SaasState } from "@/shop.config";
import type { Selection } from "@/catalog";

/**
 * Engine price for a hypothetical selection (plan cards, account invoices).
 * Same computePrice + manifest overrides as usePrice, so every amount still comes from the engine.
 */
export function useQuote(sel: Selection | undefined, step = "plans"): PriceResult | null {
  const { manifest } = useRiptide();
  return useMemo(() => {
    if (!sel) return null;
    const s: SaasState = { ...config.initialState, ...sel, mode: "buy", selected: {} };
    return computePrice(config, s, manifest.overrides, step);
  }, [sel, manifest, step]);
}

/** Total of the mandatory (non-optional) lines: one charge incl. GST. */
export const chargeOf = (q: PriceResult | null) => (q ? q.lines.filter((l) => !l.optional).reduce((t, l) => t + l.amount, 0) : 0);

/** Itemised lines for a step. Lines with a registered `{step}.fees.{key}` id render as Slots. */
export function PriceLines({ price, step }: { price: PriceResult; step: string }) {
  const { registryIds } = useRiptide();
  return (
    <ul className="rt-lines">
      {price.lines.filter((l) => l.selected).map((l) => {
        const id = `${step}.fees.${l.key}`;
        const inner = (
          <>
            <span>{l.label}{l.detail && <small className="rt-line__detail">{l.detail}</small>}</span>
            <span className="ps-mono whitespace-nowrap">{formatINR(l.amount)}</span>
          </>
        );
        return registryIds.has(id)
          ? <Slot key={l.key} id={id} as="li" className="rt-line" data-kind={l.kind}>{inner}</Slot>
          : <li key={l.key} data-dp={`${step}.summary.line.${l.key}`} data-kind={l.kind} className="rt-line">{inner}</li>;
      })}
    </ul>
  );
}

const LABELS: Record<string, string> = { plans: "Plan", signup: "Account", review: "Review", payment: "Payment" };

/** Purchase progress, built from the live flow so manifest-inserted steps show up too. */
export function Steps({ current }: { current: string }) {
  const flow = useFlow("purchase");
  const at = flow.steps.findIndex((s) => s.step === current);
  return (
    <ol className="ps-steps" aria-label="Checkout progress">
      {flow.steps.map((s, i) => (
        <li key={s.step} aria-current={i === at ? "step" : undefined} data-done={i < at ? "" : undefined}>
          <span className="n">{i + 1}</span>
          {i < at ? <Link href={flow.href(s.path)} className="hover:underline">{LABELS[s.step] ?? s.interstitial?.title ?? s.step}</Link> : LABELS[s.step] ?? s.interstitial?.title ?? s.step}
        </li>
      ))}
    </ol>
  );
}

export function Skeleton({ h = 120, className = "" }: { h?: number; className?: string }) {
  return <div className={`ps-skel ${className}`} style={{ height: h }} aria-hidden />;
}

export function Crumbs({ items }: { items: [string, string?][] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted">
      <ol className="flex flex-wrap gap-2">
        {items.map(([label, href], i) => (
          <li key={label} className="flex gap-2">
            {i > 0 && <span aria-hidden>/</span>}
            {href ? <Link href={href} className="hover:text-fg hover:underline">{label}</Link> : <span className="text-fg">{label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-1" aria-label={`Rated ${value} out of 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox="0 0 20 20" width="14" height="14" aria-hidden>
          <path d="M10 1.5l2.6 5.6 6 .7-4.5 4.1 1.2 6L10 15l-5.3 2.9 1.2-6L1.4 7.8l6-.7Z" fill={value >= i + 0.75 ? "#1B1A21" : value >= i + 0.25 ? "#8A8592" : "#D9D2C3"} />
        </svg>
      ))}
    </span>
  );
}

export { useHydrated };
