import { hashString, type LineItem, type ShopConfig } from "@riptide/core";
import { itemByIdLookup, restaurantById, type MenuItem } from "./data/restaurants";
import { DONATION, GST_FOOD, GST_SERVICE, PASS_PRICE, PLATFORM_FEE, TIPS, couponDiscount, findCoupon, type Address } from "./data/profile";
import { registry } from "./slots";

export type CartLine = { uid: string; itemId: string; size: string; addons: string[]; spice: string | null; qty: number };

export type FoodState = {
  restaurantId: string | null;
  cart: CartLine[];
  coupon: string | null;
  city: string | null;
  address: Address | null;
  instructions: string;
  instructionChips: string[];
  cutlery?: boolean;
  marketing?: boolean;
  selected?: Record<string, boolean>;
};

export const SPICE_LEVELS = ["Mild", "Medium", "Spicy"] as const;

export const lineUid = (itemId: string, size: string, addons: string[], spice: string | null) =>
  `${itemId}-${hashString(`${size}|${[...addons].sort().join(",")}|${spice ?? ""}`).toString(36)}`;

export function unitPrice(item: MenuItem, size: string, addons: string[]): number {
  const s = item.sizes.find((x) => x.id === size) ?? item.sizes[0];
  return item.price + s.price + item.addons.filter((a) => addons.includes(a.id)).reduce((t, a) => t + a.price, 0);
}

export function lineDetail(item: MenuItem, l: Pick<CartLine, "size" | "addons" | "spice">): string {
  const s = item.sizes.find((x) => x.id === l.size) ?? item.sizes[0];
  const adds = item.addons.filter((a) => l.addons.includes(a.id)).map((a) => a.label);
  return [s.label, ...adds, l.spice && `${l.spice} spice`].filter(Boolean).join(" · ");
}

const round2 = (n: number) => Math.round(n * 100) / 100;

const line = (key: string, label: string, amount: number, kind: LineItem["kind"], optional = false, detail?: string): LineItem =>
  ({ key, label, amount, kind, visibleFromStep: "cart", optional, selected: false, ...(detail ? { detail } : {}) });

export const config: ShopConfig<FoodState> = {
  shop: "food",
  steps: ["location", "home", "restaurant", "cart", "checkout", "account", "policies", "payment"],
  flows: {
    purchase: [
      { step: "cart", path: "cart" },
      { step: "checkout", path: "checkout" },
      { step: "payment", path: "payment" },
    ],
  },
  registry,
  initialState: { restaurantId: null, cart: [], coupon: null, city: null, address: null, instructions: "", instructionChips: [] },
  buildLines(state) {
    const r = restaurantById(state.restaurantId);
    if (!r || !state.cart.length) return [];
    const lines: LineItem[] = [];
    let itemTotal = 0;
    for (const c of state.cart) {
      const item = itemByIdLookup(c.itemId);
      if (!item) continue;
      const unit = unitPrice(item, c.size, c.addons);
      itemTotal += unit * c.qty;
      lines.push(line(`item-${c.uid}`, item.name, unit * c.qty, "item", false, `${c.qty} × ₹${unit} · ${lineDetail(item, c)}`));
    }
    if (!lines.length) return [];
    const coupon = findCoupon(state.coupon);
    const discount = couponDiscount(coupon, r.id, itemTotal);
    if (discount) lines.push(line("coupon", `Coupon ${coupon!.code}`, -discount, "discount"));
    const gst = round2((itemTotal - discount + r.packaging) * GST_FOOD + PLATFORM_FEE * GST_SERVICE);
    lines.push(
      line("delivery", "Delivery fee", r.deliveryFee, "fee"),
      line("packaging", "Restaurant packaging", r.packaging, "fee"),
      line("platform", "Platform fee", PLATFORM_FEE, "fee"),
      line("gst", "GST", gst, "tax", false, "5% on food and packaging, 18% on platform fee"),
      line("pass", "Forkful Pass · 1 month", PASS_PRICE, "membership", true),
      ...TIPS.map((t) => line(`tip-${t}`, "Delivery partner tip", t, "tip", true)),
      line("donation", "Donation to Annapurna Meals Trust", DONATION, "donation", true),
    );
    return lines;
  },
};
