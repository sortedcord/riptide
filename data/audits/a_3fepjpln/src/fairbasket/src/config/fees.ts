/**
 * Every charge, shown from the cart onwards with its condition. There is no platform or handling fee.
 * Delivery is free above ₹499 (and always for FairPass members); otherwise ₹30.
 */
export const FEES = {
  delivery: { label: "Delivery", amount: 30, freeAbove: 499, visibleFrom: "cart" as const },
  smallCart: null, // no small-cart fee
};
export const ADDONS = {
  carryBag: { label: "Paper carry bag", amount: 5, optional: true },
  donation: { label: "Donate ₹2 to Akshaya Patra meals", amount: 2, optional: true },
};
