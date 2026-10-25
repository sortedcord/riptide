import type { ReactNode } from "react";
import type { PriceLine } from "../lib/pricing";

/** The price breakup card used by cart, checkout and payment. Every line from priceBreakup is listed. */
export function PriceSummary({ title, lines, total, totalLabel, children }: { title: string; lines: PriceLine[]; total: number; totalLabel: string; children?: ReactNode }) {
  return (
    <aside className="card summary">
      <h2>{title}</h2>
      <ul className="breakup">
        {lines.map((l) => <li key={l.key}><span>{l.label}{l.note && <small>{l.note}</small>}</span><span>₹{l.amount}</span></li>)}
      </ul>
      <p className="total"><b>{totalLabel}</b><b>₹{total}</b></p>
      <p className="muted">Inclusive of all taxes. No platform or handling fee.</p>
      {children}
    </aside>
  );
}
