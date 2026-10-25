import { priceBreakup } from "../lib/pricing";
import type { CartLine } from "../lib/cart";

export default function Checkout({ lines, member, selected }: { lines: CartLine[]; member: boolean; selected: { protect: boolean; donation: boolean } }) {
  const { lines: breakup, total } = priceBreakup(lines, selected, member, "checkout");
  return (
    <main>
      <h1>Checkout</h1>
      <p>Checkout as guest or <a href="/signup">sign in</a>.</p>
      <button>Use saved address</button>
      <h2>Order summary</h2>
      <ul>{breakup.map((l) => <li key={l.key}>{l.label}: ₹{l.amount}</li>)}</ul>
      <p><b>Total ₹{total}</b></p>
      <a href="/payment">Continue to payment</a>
    </main>
  );
}
