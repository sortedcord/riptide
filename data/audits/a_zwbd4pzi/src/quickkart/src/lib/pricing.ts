import { ADDONS, FEES } from "../config/fees";
import type { CartLine } from "./cart";

export type PriceLine = { key: string; label: string; amount: number; note?: string };
type Step = "cart" | "checkout" | "payment";

export function priceBreakup(lines: CartLine[], selected: { protect: boolean; donation: boolean }, member: boolean, step: Step = "cart"): { lines: PriceLine[]; total: number } {
  const items = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const out: PriceLine[] = [{ key: "items", label: `Items (${lines.length})`, amount: items }];
  const freeDelivery = member || items >= FEES.delivery.freeAbove;
  out.push({ key: "delivery", label: FEES.delivery.label, amount: freeDelivery ? 0 : FEES.delivery.amount });
  if (selected.protect) out.push({ key: "protect", label: ADDONS.protect.label, amount: ADDONS.protect.amount });
  if (selected.donation) out.push({ key: "donation", label: ADDONS.donation.label, amount: ADDONS.donation.amount });
  if (step === "payment") {
    out.push({ key: "platform", label: FEES.platform.label, amount: FEES.platform.amount });
    out.push({ key: "handling", label: FEES.handling.label, amount: FEES.handling.amount });
  }
  return { lines: out, total: out.reduce((s, l) => s + l.amount, 0) };
}
