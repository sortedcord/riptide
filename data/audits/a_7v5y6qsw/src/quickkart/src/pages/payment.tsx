import { priceBreakup } from "../lib/pricing";
import type { CartLine } from "../lib/cart";

export default function Payment({ lines, member, selected }: { lines: CartLine[]; member: boolean; selected: { protect: boolean; donation: boolean } }) {
  const { lines: breakup, total } = priceBreakup(lines, selected, member, "payment");
  return (
    <main>
      <h1>Payment</h1>
      <ul>{breakup.map((l) => <li key={l.key}>{l.label}: ₹{l.amount}</li>)}</ul>
      <p><b>Pay ₹{total}</b></p>
      <p>Methods: UPI, card, netbanking, cash on delivery. No payment method carries an extra fee.</p>
      <p>KartPlus autopay: to stop recurring payments, call our membership desk on 1800 266 9090.</p>
      <button>Pay ₹{total}</button>
    </main>
  );
}
