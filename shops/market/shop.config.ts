import type { LineItem, ShopConfig } from "@riptide/core";
import { productById, unitPrice, variantLabel, type Product } from "./data/catalog";
import { registry } from "./slots";

export type CartLine = { pid: string; opts: number[]; qty: number };
export type Address = { name: string; phone: string; line1: string; line2?: string; city: string; state: string; pin: string };
export type Membership = { status: "active" | "cancelled"; started: string; renews: string; reason?: string; refunded?: boolean; orderId?: string };

export type MarketState = {
  cart: CartLine[];
  saved: CartLine[];
  coupon?: string;
  address?: Address;
  optin?: boolean;
  pin?: string;
  membership?: Membership;
  selected?: Record<string, boolean>;
  lastOrder?: { orderId: string; total: number; lines: { key: string; label: string; amount: number }[] };
};

/** Fixed fees. Shown wherever a price first appears; every amount on screen comes from the engine. */
export const FEES = { platform: 7, delivery: 40, freeDeliveryOver: 499, giftwrap: 49, express: 79, nextday: 149, plus: 999 };

export const COUPONS: { code: string; title: string; minSubtotal: number; category?: Product["category"]; value: (eligible: number) => number }[] = [
  { code: "WELCOME100", title: "₹100 off orders with items worth ₹999 or more", minSubtotal: 999, value: () => 100 },
  { code: "CART10", title: "10% off (up to ₹250) on items worth ₹1,499 or more", minSubtotal: 1499, value: (s) => Math.min(250, Math.round(s * 0.1)) },
  { code: "GROCER50", title: "₹50 off grocery items worth ₹399 or more", minSubtotal: 399, category: "grocery", value: () => 50 },
];

/** Plus benefits apply while active, or after a non-refunded cancel until the paid year ends. */
export const hasPlusBenefits = (s: Pick<MarketState, "membership" | "lastOrder">) =>
  s.membership ? s.membership.status === "active" || !s.membership.refunded : !!s.lastOrder?.lines.some((l) => l.key === "plus");

export const lineKey = (l: Pick<CartLine, "pid" | "opts">) => `${l.pid}.${l.opts.join("-") || "0"}`;

export type CouponResult = { ok: true; amount: number; title: string } | { ok: false; error: string };
export function evaluateCoupon(code: string, cart: CartLine[]): CouponResult {
  const c = COUPONS.find((x) => x.code === code.trim().toUpperCase());
  if (!c) return { ok: false, error: "This coupon code isn't valid. Check the spelling and try again." };
  const eligible = cart.reduce((s, l) => {
    const p = productById(l.pid);
    return p && (!c.category || p.category === c.category) ? s + unitPrice(p, l.opts).price * l.qty : s;
  }, 0);
  if (eligible < c.minSubtotal) return { ok: false, error: `${c.code} needs ${c.category ? "grocery items" : "items"} worth ₹${c.minSubtotal.toLocaleString("en-IN")} or more.` };
  return { ok: true, amount: c.value(eligible), title: c.title };
}

export const config: ShopConfig<MarketState> = {
  shop: "market",
  steps: ["home", "search", "product", "account", "membership", "cancel", "policies", "cart", "checkout", "review", "payment"],
  flows: {
    purchase: [
      { step: "cart", path: "cart" },
      { step: "checkout", path: "checkout" },
      { step: "review", path: "review" },
      { step: "payment", path: "payment" },
    ],
    cancel: [
      { step: "membership", path: "account/membership" },
      { step: "cancel", path: "account/membership/cancel" },
    ],
  },
  registry,
  initialState: { cart: [], saved: [] },
  buildLines(state) {
    const lines: LineItem[] = [];
    let subtotal = 0;
    let warranty = 0;
    let covered = 0;
    for (const l of state.cart ?? []) {
      const p = productById(l.pid);
      if (!p) continue;
      const { price } = unitPrice(p, l.opts);
      subtotal += price * l.qty;
      if (p.warranty) { warranty += p.warranty * l.qty; covered += l.qty; }
      const v = variantLabel(p, l.opts);
      lines.push({ key: `item:${lineKey(l)}`, label: p.title, amount: price * l.qty, kind: "item", visibleFromStep: "cart", optional: false, selected: true, detail: `${v ? `${v} · ` : ""}${l.qty} × ₹${price.toLocaleString("en-IN")}` });
    }
    if (!lines.length) return lines;
    const free = subtotal >= FEES.freeDeliveryOver;
    lines.push(
      { key: "delivery", label: "Delivery fee", amount: free ? 0 : FEES.delivery, kind: "fee", visibleFromStep: "cart", optional: false, selected: true, detail: free ? "Standard delivery, free on orders over ₹499" : "Standard delivery (free on orders over ₹499)" },
      { key: "platform", label: "Platform fee", amount: FEES.platform, kind: "fee", visibleFromStep: "cart", optional: false, selected: true, detail: "Per order, incl. GST" },
    );
    if (state.coupon) {
      const c = evaluateCoupon(state.coupon, state.cart);
      if (c.ok) lines.push({ key: "coupon", label: `Coupon ${state.coupon}`, amount: -c.amount, kind: "discount", visibleFromStep: "cart", optional: false, selected: true });
    }
    if (warranty) lines.push({ key: "warranty", label: "Extended warranty (1 year)", amount: warranty, kind: "addon", visibleFromStep: "cart", optional: true, selected: false, detail: `Covers ${covered} eligible item${covered > 1 ? "s" : ""}` });
    lines.push(
      { key: "giftwrap", label: "Gift wrap", amount: FEES.giftwrap, kind: "addon", visibleFromStep: "cart", optional: true, selected: false, detail: "All items, with a printed note" },
      { key: "express", label: hasPlusBenefits(state) ? "Express delivery (free with Plus)" : "Express delivery", amount: hasPlusBenefits(state) ? 0 : FEES.express, kind: "addon", visibleFromStep: "checkout", optional: true, selected: false, detail: "Upgrade from standard, arrives in 2 days" },
      { key: "nextday", label: "Next-day delivery", amount: FEES.nextday, kind: "addon", visibleFromStep: "checkout", optional: true, selected: false, detail: "Upgrade from standard, arrives tomorrow" },
      { key: "plus", label: "Cartwheel Plus, 1 year", amount: FEES.plus, kind: "membership", visibleFromStep: "checkout", optional: true, selected: false, detail: "Renews yearly at ₹999 until you cancel" },
    );
    return lines;
  },
};
