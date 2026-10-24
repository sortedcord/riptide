import type { SlotDef } from "./contracts";

/** Slots rendered by the shared PaymentPage. Spread into every shop's registry. */
export const paymentSlots: SlotDef[] = [
  { id: "payment.header.title", step: "payment", kind: "text", description: "Payment page heading", default: "Payment" },
  { id: "payment.methods.tabs", step: "payment", kind: "selector", description: "Payment method tabs (UPI / Card / Netbanking / Wallet)", default: "upi" },
  { id: "payment.terms.text", step: "payment", kind: "text", description: "Terms line above the pay button", default: "By paying you agree to the Terms of Use and Refund Policy linked in the footer." },
  { id: "payment.pay.button", step: "payment", kind: "button", description: "Pay ₹X button (goes to sandbox-complete)", default: "Pay {total}" },
  { id: "payment.summary.panel", step: "payment", kind: "card", description: "Order summary container; lines carry data-dp=payment.summary.line.{key}", default: null },
  { id: "payment.summary.total", step: "payment", kind: "total", description: "Order total from the pricing engine", default: "{total}" },
];
