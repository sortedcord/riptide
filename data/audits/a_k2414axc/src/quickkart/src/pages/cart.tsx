import { useState } from "react";
import { ADDONS } from "../config/fees";
import { priceBreakup } from "../lib/pricing";
import type { CartLine } from "../lib/cart";

export default function Cart({ lines, member }: { lines: CartLine[]; member: boolean }) {
  const [protect, setProtect] = useState(true);
  const [donation, setDonation] = useState(true);
  const { lines: breakup, total } = priceBreakup(lines, { protect, donation }, member, "cart");
  return (
    <main>
      <h1>Your cart</h1>
      <label><input type="checkbox" checked={protect} onChange={(e) => setProtect(e.target.checked)} /> {ADDONS.protect.label} (+₹{ADDONS.protect.amount})</label>
      {!protect && <p className="small">No thanks, I'm fine if my groceries arrive damaged.</p>}
      <label><input type="checkbox" checked={donation} onChange={(e) => setDonation(e.target.checked)} /> {ADDONS.donation.label}</label>
      <ul>{breakup.map((l) => <li key={l.key}>{l.label}: ₹{l.amount}</li>)}</ul>
      <p><b>Total ₹{total}</b></p>
      <a href="/checkout">Continue to checkout</a>
    </main>
  );
}
