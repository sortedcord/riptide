/**
 * Charges. Delivery is free above ₹499; otherwise ₹30.
 * Platform and handling fees apply to every order and are added at the payment step.
 */
export const FEES = {
  delivery: { label: "Delivery", amount: 30, freeAbove: 499, visibleFrom: "cart" as const },
  platform: { label: "Platform fee", amount: 9, visibleFrom: "payment" as const },
  handling: { label: "Handling & packing", amount: 19, visibleFrom: "payment" as const },
};
export const ADDONS = {
  protect: { label: "QuickProtect order protection", amount: 19, optional: true },
  donation: { label: "Donate ₹2 to Akshaya Patra meals", amount: 2, optional: true },
};
