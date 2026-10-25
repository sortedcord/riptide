import { ADDONS, FEES } from "../config/fees";
import type { CartLine } from "./cart";

export type PriceLine = { key: string; label: string; amount: number; note?: string };

/** The same breakup is shown in the cart, at checkout and on the payment page. */
export function priceBreakup(lines: CartLine[], selected: { carryBag: boolean; donation: boolean }, member: boolean): { lines: PriceLine[]; total: number } {
  const items = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const out: PriceLine[] = [{ key: "items", label: `Items (${lines.length})`, amount: items }];
  const freeDelivery = member || items >= FEES.delivery.freeAbove;
  out.push({ key: "delivery", label: FEES.delivery.label, amount: freeDelivery ? 0 : FEES.delivery.amount, note: freeDelivery ? "Free" : `Free above ₹${FEES.delivery.freeAbove}` });
  if (selected.carryBag) out.push({ key: "carryBag", label: ADDONS.carryBag.label, amount: ADDONS.carryBag.amount });
  if (selected.donation) out.push({ key: "donation", label: ADDONS.donation.label, amount: ADDONS.donation.amount });
  return { lines: out, total: out.reduce((s, l) => s + l.amount, 0) };
}
