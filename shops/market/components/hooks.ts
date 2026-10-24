"use client";
import { computePrice, useRiptide, useSession } from "@riptide/core";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import { config, hasPlusBenefits, lineKey, type CartLine, type MarketState, type Membership } from "@/shop.config";

let today: string | undefined;
const noop = () => () => {};
/** Today's date (YYYY-MM-DD) on the client, null during SSR/hydration. Never read at render on the server. */
export function useToday(): Date | null {
  const s = useSyncExternalStore(noop, () => (today ??= new Date().toISOString().slice(0, 10)), () => null);
  return useMemo(() => (s ? new Date(`${s}T00:00:00`) : null), [s]);
}

export const fmtDate = (d: Date, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) =>
  d.toLocaleDateString("en-IN", opts);
export const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
/** Skip Sundays, as the shipping policy says. */
export const deliveryDate = (from: Date, days: number) => {
  let d = from;
  for (let i = 0; i < days; ) {
    d = addDays(d, 1);
    if (d.getDay() !== 0) i++;
  }
  return d;
};
export const iso = (d: Date) => d.toISOString().slice(0, 10);

/** Fees for a hypothetical cart containing just this item, straight from the pricing engine. */
export function useQuote(line: CartLine) {
  const { manifest } = useRiptide();
  return useMemo(() => computePrice(config, { cart: [line], saved: [] }, manifest.overrides, "cart"), [line, manifest]);
}

export function useCart() {
  const [s, set] = useSession<MarketState>();
  const count = s.cart.reduce((n, l) => n + l.qty, 0);
  const same = (a: CartLine) => (b: CartLine) => lineKey(a) === lineKey(b);
  return {
    state: s,
    set,
    count,
    add(line: CartLine) {
      set((st) => {
        const has = st.cart.find(same(line));
        return { cart: has ? st.cart.map((l) => (same(line)(l) ? { ...l, qty: Math.min(10, l.qty + line.qty) } : l)) : [...st.cart, line] };
      });
    },
    setQty(line: CartLine, qty: number) {
      set((st) => ({ cart: qty <= 0 ? st.cart.filter((l) => !same(line)(l)) : st.cart.map((l) => (same(line)(l) ? { ...l, qty: Math.min(10, qty) } : l)) }));
    },
    remove(line: CartLine) {
      set((st) => ({ cart: st.cart.filter((l) => !same(line)(l)) }));
    },
    saveForLater(line: CartLine) {
      set((st) => ({ cart: st.cart.filter((l) => !same(line)(l)), saved: [...st.saved.filter((l) => !same(line)(l)), line] }));
    },
    moveToCart(line: CartLine) {
      set((st) => ({ saved: st.saved.filter((l) => !same(line)(l)), cart: [...st.cart.filter((l) => !same(line)(l)), line] }));
    },
    removeSaved(line: CartLine) {
      set((st) => ({ saved: st.saved.filter((l) => !same(line)(l)) }));
    },
  };
}

/**
 * The demo profile's Plus membership. Paying for an order that includes the Plus line starts it;
 * the start/renewal dates are recorded the first time it is seen on the client.
 */
export function useMembership(): { membership: Membership | null; benefits: boolean; set: (m: Membership) => void } {
  const [s, set] = useSession<MarketState>();
  const d = useToday();
  const order = s.lastOrder?.lines.some((l) => l.key === "plus") ? s.lastOrder.orderId : undefined;
  useEffect(() => {
    if (d && order && s.membership?.orderId !== order) {
      const renews = new Date(d);
      renews.setFullYear(renews.getFullYear() + 1);
      set({ membership: { status: "active", started: iso(d), renews: iso(renews), orderId: order } });
    }
  }, [d, order, s.membership, set]);
  return { membership: s.membership ?? null, benefits: hasPlusBenefits(s), set: (m) => set({ membership: m }) };
}
