import { useState } from "react";
import { ADDONS } from "../config/fees";
import { priceBreakup } from "../lib/pricing";
import type { CartLine } from "../lib/cart";
import { ProductArt } from "../components/ProductArt";
import { Icon } from "../components/Icon";

export default function Cart({ lines, member }: { lines: CartLine[]; member: boolean }) {
  const [protect, setProtect] = useState(true);
  const [donation, setDonation] = useState(true);
  const { lines: breakup, total } = priceBreakup(lines, { protect, donation }, member, "cart");
  return (
    <main className="page split">
      <div className="col-main">
        <h1>Your cart</h1>
        <section className="card">
          <p className="eta-row"><Icon name="clock" size={16} /> <b>Delivery in 2–4 hours</b> · {lines.length} items</p>
          <ul className="lines">
            {lines.map((l) => (
              <li key={l.productId}><ProductArt id={l.productId} size={56} /><span className="ln-name">{l.name}</span><span className="qty-pill">Qty {l.qty}</span><b>₹{l.price * l.qty}</b></li>
            ))}
          </ul>
        </section>
        <section className="card addons">
          <label className="addon"><input type="checkbox" checked={protect} onChange={(e) => setProtect(e.target.checked)} /> <Icon name="shield" size={18} /> <span>{ADDONS.protect.label} (+₹{ADDONS.protect.amount})</span></label>
          <label className="addon"><input type="checkbox" checked={donation} onChange={(e) => setDonation(e.target.checked)} /> <Icon name="heart" size={18} /> <span>{ADDONS.donation.label}</span></label>
        </section>
      </div>
      <aside className="col-side">
        <section className="card bill">
          <h2>Bill details</h2>
          <ul className="breakup">{breakup.map((l) => <li key={l.key}><span>{l.label}</span><span>₹{l.amount}</span></li>)}</ul>
          <p className="bill-total"><b>Total</b><b>₹{total}</b></p>
        </section>
        <div className="paybar">
          <div><b>₹{total}</b><span>Total</span></div>
          <a href="/checkout" className="btn btn-primary">Continue to checkout <Icon name="chevron" size={16} /></a>
        </div>
      </aside>
    </main>
  );
}
