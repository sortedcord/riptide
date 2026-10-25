import { priceBreakup } from "../lib/pricing";
import type { CartLine } from "../lib/cart";

export default function Payment({ lines, member, selected }: { lines: CartLine[]; member: boolean; selected: { carryBag: boolean; donation: boolean } }) {
  const { lines: breakup, total } = priceBreakup(lines, selected, member);
  return (
    <main>
      <h1>Payment</h1>
      <ul>{breakup.map((l) => <li key={l.key}>{l.label}: ₹{l.amount}</li>)}</ul>
      <p><b>Pay ₹{total}</b></p>
      <p>Methods: UPI, card, netbanking, cash on delivery. No payment method carries an extra fee.</p>
      <p>Recurring payments (FairPass) can be cancelled anytime in Account → FairPass → Manage autopay.</p>
      <button>Pay ₹{total}</button>
    </main>
  );
}
