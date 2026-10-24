"use client";
import Link from "next/link";
import { Slot, cn, formatINR, useFlow, usePrice, useRiptide } from "@riptide/core";
import type { ReactNode } from "react";

/* ---------- Icons: hand-drawn rounded strokes, Forkful style ---------- */
const PATHS = {
  pin: "M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm9 3-4.2-4.2",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 9c.8-4 4-6 8-6s7.2 2 8 6",
  bag: "M5 8h14l-1.2 12H6.2L5 8Zm4 0V6a3 3 0 0 1 6 0v2",
  star: "M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.8L12 3.5Z",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v4.5l3 2",
  tag: "M3 12V4h8l10 10-8 8L3 12Zm5-4.5a1 1 0 1 0 0 .01",
  close: "M6 6l12 12M18 6 6 18",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  chevron: "M9 6l6 6-6 6",
  back: "M15 6l-6 6 6 6",
  leaf: "M5 19c0-8 5-13 14-14-1 9-6 14-14 14Zm0 0 7-7",
  home: "M4 11 12 4l8 7v9h-5v-6H9v6H4v-9Z",
  briefcase: "M4 8h16v11H4V8Zm5 0V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2",
  check: "M5 12.5 10 17l9-10",
  scooter: "M5 17a2 2 0 1 0 0 .01M18 17a2 2 0 1 0 0 .01M7 17h9l2-6h-4l-2 4H6M14 7h3l1 4",
} as const;

export function Icon({ name, size = 20, className }: { name: keyof typeof PATHS; size?: number; className?: string }) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={PATHS[name]} />
    </svg>
  );
}

/** Indian veg / non-veg marker: square outline with a dot (veg) or triangle (non-veg). */
export function VegMark({ veg, className }: { veg: boolean; className?: string }) {
  const c = veg ? "var(--ff-veg)" : "var(--ff-nonveg)";
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" role="img" aria-label={veg ? "Vegetarian" : "Non-vegetarian"} className={cn("shrink-0", className)}>
      <rect x="1" y="1" width="14" height="14" rx="2" fill="#fff" stroke={c} strokeWidth="1.5" />
      {veg ? <circle cx="8" cy="8" r="3.5" fill={c} /> : <path d="M8 4l4 7H4z" fill={c} />}
    </svg>
  );
}

export function Rating({ value, count, className }: { value: number; count?: number; className?: string }) {
  return (
    <span className={cn("ff-rating", className)} aria-label={`Rated ${value} out of 5${count ? ` from ${count} ratings` : ""}`}>
      <Icon name="star" size={13} /> {value.toFixed(1)}
      {count !== undefined && <span className="ff-rating__count">({count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count})</span>}
    </span>
  );
}

export function QtyStepper({ qty, onChange, label }: { qty: number; onChange: (q: number) => void; label: string }) {
  return (
    <div className="ff-qty" role="group" aria-label={`Quantity of ${label}`}>
      <button type="button" aria-label={`Remove one ${label}`} onClick={() => onChange(qty - 1)}><Icon name="minus" size={16} /></button>
      <span aria-live="polite">{qty}</span>
      <button type="button" aria-label={`Add one more ${label}`} onClick={() => onChange(qty + 1)}><Icon name="plus" size={16} /></button>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("ff-skel", className)} aria-hidden />;
}

/** Bill details for cart and checkout. Every amount comes from the pricing engine. */
export function Bill({ step }: { step: "cart" | "checkout" }) {
  const price = usePrice(step);
  const { registryIds } = useRiptide();
  const itemTotal = price.lines.filter((l) => l.kind === "item").reduce((t, l) => t + l.amount, 0);
  const rest = price.lines.filter((l) => l.kind !== "item" && l.selected);
  return (
    <Slot id={`${step}.bill.panel`} as="section" className="ff-card ff-bill" aria-label="Bill details">
      <h2 className="ff-h3">Bill details</h2>
      <div className="rt-line"><span>Item total</span><Slot id={`${step}.bill.item-total`} as="span">{formatINR(itemTotal)}</Slot></div>
      {rest.map((l) => {
        const id = `${step}.fees.${l.key}`;
        const body = (
          <>
            <span>{l.label}{l.detail && <small className="rt-line__detail">{l.detail}</small>}</span>
            <span>{formatINR(l.amount)}</span>
          </>
        );
        return registryIds.has(id)
          ? <Slot key={l.key} id={id} className="rt-line" data-kind={l.kind}>{body}</Slot>
          : <div key={l.key} data-dp={`${step}.summary.line.${l.key}`} data-kind={l.kind} className="rt-line">{body}</div>;
      })}
      <div className="rt-line rt-line--total"><span>To pay</span><Slot id={`${step}.bill.total`} as="strong">{formatINR(price.total)}</Slot></div>
      <p className="rt-fine">All charges are listed here. Optional extras are only added if you choose them.</p>
    </Slot>
  );
}

const STEP_LABEL: Record<string, string> = { cart: "Cart", checkout: "Checkout", payment: "Payment" };

/** Purchase progress, including any inserted steps. */
export function Progress({ current }: { current: string }) {
  const flow = useFlow("purchase");
  const at = flow.steps.findIndex((s) => s.step === current);
  return (
    <nav aria-label="Checkout progress" className="ff-progress">
      <ol>
        {flow.steps.map((s, i) => (
          <li key={s.step} data-state={i < at ? "done" : i === at ? "current" : "todo"} aria-current={i === at ? "step" : undefined}>
            <span className="ff-progress__dot">{i < at ? <Icon name="check" size={12} /> : i + 1}</span>
            {s.interstitial?.title ?? STEP_LABEL[s.step] ?? s.step}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="ff-crumbs">
      <ol>
        {items.map((c, i) => (
          <li key={c.label}>
            {c.href ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
            {i < items.length - 1 && <Icon name="chevron" size={12} />}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Toast({ children }: { children: ReactNode }) {
  return <div role="status" aria-live="polite" className="ff-toast">{children}</div>;
}
