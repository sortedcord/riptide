import { useState } from "react";
import { ADDONS } from "../config/fees";
import { priceBreakup } from "../lib/pricing";
import type { CartLine } from "../lib/cart";

export default function Cart({ lines, member }: { lines: CartLine[]; member: boolean }) {
  const [carryBag, setCarryBag] = useState(false);
  const [donation, setDonation] = useState(false);
  const { lines: breakup, total } = priceBreakup(lines, { carryBag, donation }, member);
  return (
    <main>
      <h1>Your cart</h1>
      <label><input type="checkbox" checked={carryBag} onChange={(e) => setCarryBag(e.target.checked)} /> {ADDONS.carryBag.label} (+₹{ADDONS.carryBag.amount})</label>
      <label><input type="checkbox" checked={donation} onChange={(e) => setDonation(e.target.checked)} /> {ADDONS.donation.label}</label>
      <ul>{breakup.map((l) => <li key={l.key}>{l.label}: ₹{l.amount} {l.note && <small>{l.note}</small>}</li>)}</ul>
      <p><b>Total ₹{total}</b></p>
      <a href="/checkout">Continue to checkout</a>
    </main>
  );
}
