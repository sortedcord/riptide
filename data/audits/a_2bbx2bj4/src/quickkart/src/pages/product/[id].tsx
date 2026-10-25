import { useState } from "react";
import { PRODUCTS } from "../../data/products";
import { OfferEnds } from "../../components/Countdown";
import { ProductArt } from "../../components/ProductArt";
import { Icon } from "../../components/Icon";

export default function ProductPage({ id }: { id: string }) {
  const p = PRODUCTS.find((x) => x.id === id)!;
  const [qty, setQty] = useState(1);
  return (
    <main className="page product">
      <p className="crumbs"><a href="/">Home</a> <Icon name="chevron" size={12} /> <a href="/search">{p.brand}</a> <Icon name="chevron" size={12} /> {p.name}</p>
      <div className="pdp">
        <div className="pdp-media card"><ProductArt id={p.id} size={300} /></div>
        <div className="pdp-info">
          <span className="chip-eta"><Icon name="clock" size={12} /> Delivery in {p.deliveryHours} hrs</span>
          <h1>{p.name}</h1>
          <p className="muted">{p.brand} · <Icon name="star" size={12} className="star" /> {p.rating}</p>
          <p className="pdp-price"><b>₹{p.price}</b> (incl. all taxes) · MRP ₹{p.mrp} · Lowest price in the last 30 days: ₹{p.lowest30d}</p>
          <OfferEnds />
          <p className="note"><Icon name="truck" size={16} /> Delivery ₹30, free above ₹499 or with KartPlus.</p>

          <div className="buy">
            <label className="qty">Quantity
              <span className="stepper">
                <button type="button" aria-label="Decrease" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                <input type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value))} />
                <button type="button" aria-label="Increase" onClick={() => setQty(qty + 1)}>+</button>
              </span>
            </label>
            <button className="btn btn-primary btn-lg">Add to cart</button>
          </div>

          <section className="card">
            <h2>Product details</h2>
            <table className="specs">
              <tbody>
                <tr><th>Generic name</th><td>{p.genericName}</td></tr>
                <tr><th>Net quantity</th><td>{p.netQuantity}</td></tr>
                <tr><th>Unit sale price</th><td>{p.unitPrice}</td></tr>
                <tr><th>Packed on</th><td>{p.packedOn}</td></tr>
                <tr><th>Best before</th><td>{p.bestBefore}</td></tr>
                <tr><th>Manufacturer</th><td>{p.manufacturer}</td></tr>
                <tr><th>Country of origin</th><td>{p.countryOfOrigin}</td></tr>
                {p.importer && <tr><th>Importer</th><td>{p.importer}</td></tr>}
                <tr><th>Consumer care</th><td>{p.consumerCare}</td></tr>
              </tbody>
            </table>
          </section>
          <section className="card seller">
            <p><Icon name="home" size={16} /><span>Sold by <b>{p.seller.name}</b>, {p.seller.address} · seller rating {p.seller.rating}</span></p>
            <p><Icon name="shield" size={16} /><span>Returns: unopened packaged items can be returned within 7 days for a full refund. <a href="/policies/returns">Return policy</a></span></p>
          </section>
        </div>
      </div>
    </main>
  );
}
