import { useState } from "react";
import { ADDONS } from "../config/fees";
import { priceBreakup } from "../lib/pricing";
import type { CartLine } from "../lib/cart";
import { PRODUCTS } from "../data/products";
import { ProductImage } from "../components/ProductImage";
import { PriceSummary } from "../components/PriceSummary";

export default function Cart({ lines, member }: { lines: CartLine[]; member: boolean }) {
  const [carryBag, setCarryBag] = useState(false);
  const [donation, setDonation] = useState(false);
  const { lines: breakup, total } = priceBreakup(lines, { carryBag, donation }, member);
  return (
    <main>
      <h1>Your cart</h1>
      <div className="two-col">
        <div className="stack">
          <section className="card">
            {lines.map((l) => {
              const p = PRODUCTS.find((x) => x.id === l.productId);
              return (
                <div key={l.productId} className="line-item">
                  <ProductImage id={l.productId} label={l.name} />
                  <div><b>{l.name}</b>{p && <span className="muted">{p.unitPrice} · Sold by {p.seller.name}</span>}<span className="muted">Qty {l.qty}</span></div>
                  <b>₹{l.price * l.qty}</b>
                </div>
              );
            })}
          </section>
          <section className="card">
            <h2>Optional add-ons</h2>
            <p className="muted">Nothing here is added unless you tick it.</p>
            <label className="check"><input type="checkbox" checked={carryBag} onChange={(e) => setCarryBag(e.target.checked)} /> {ADDONS.carryBag.label} (+₹{ADDONS.carryBag.amount})</label>
            <label className="check"><input type="checkbox" checked={donation} onChange={(e) => setDonation(e.target.checked)} /> {ADDONS.donation.label}</label>
          </section>
        </div>
        <PriceSummary title="Price details" lines={breakup} total={total} totalLabel="Total">
          <a href="/checkout" className="btn btn-primary btn-block">Continue to checkout</a>
        </PriceSummary>
      </div>
    </main>
  );
}
