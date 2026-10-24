import type { LineItem, ShopConfig } from "@riptide/core";
import products from "./data/products.json";
import { registry } from "./slots";

export type MarketState = {
  cart: { id: string; qty: number }[];
  selected?: Record<string, boolean>;
};

export const productById = (id: string) => products.find((p) => p.id === id);

export const config: ShopConfig<MarketState> = {
  shop: "market",
  steps: ["home", "search", "product", "cart", "checkout", "review", "payment"],
  flows: {
    purchase: [
      { step: "cart", path: "cart" },
      { step: "payment", path: "payment" },
    ],
  },
  registry,
  initialState: { cart: [] },
  buildLines(state) {
    const lines: LineItem[] = state.cart.flatMap(({ id, qty }) => {
      const p = productById(id);
      return p ? [{ key: `item:${id}`, label: p.title, amount: p.price * qty, kind: "item" as const, visibleFromStep: "cart", optional: false, selected: true, detail: `${qty} × ₹${p.price}` }] : [];
    });
    if (!lines.length) return lines;
    lines.push(
      { key: "delivery", label: "Delivery fee", amount: 49, kind: "fee", visibleFromStep: "cart", optional: false, selected: true },
      { key: "platform", label: "Platform fee", amount: 9, kind: "fee", visibleFromStep: "cart", optional: false, selected: true },
      { key: "giftwrap", label: "Gift wrap", amount: 39, kind: "addon", visibleFromStep: "cart", optional: true, selected: false },
    );
    return lines;
  },
};
