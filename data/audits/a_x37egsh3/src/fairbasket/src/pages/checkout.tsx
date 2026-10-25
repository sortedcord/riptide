import { priceBreakup } from "../lib/pricing";
import type { CartLine } from "../lib/cart";

export default function Checkout({ lines, member, selected }: { lines: CartLine[]; member: boolean; selected: { carryBag: boolean; donation: boolean } }) {
  const { lines: breakup, total } = priceBreakup(lines, selected, member);
  return (
    <main>
      <h1>Checkout</h1>
      <p>Checkout as guest or <a href="/signup">sign in</a>. An account is not required to order.</p>
      <button>Use saved address</button>
      <h2>Order summary</h2>
      <ul>{breakup.map((l) => <li key={l.key}>{l.label}: ₹{l.amount}</li>)}</ul>
      <p><b>Total payable ₹{total}</b> (inclusive of all taxes)</p>
      <a href="/payment">Continue to payment</a>
    </main>
  );
}
