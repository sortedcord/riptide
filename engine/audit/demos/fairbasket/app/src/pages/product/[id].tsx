import { useState } from "react";
import { PRODUCTS } from "../../data/products";
import { OfferEnds } from "../../components/Countdown";
import { ProductImage } from "../../components/ProductImage";
import { Icon } from "../../components/Icons";

export default function ProductPage({ id }: { id: string }) {
  const p = PRODUCTS.find((x) => x.id === id)!;
  const [qty, setQty] = useState(1);
  return (
    <main>
      <p className="crumbs"><a href="/">Home</a> / <a href="/search">{p.brand}</a> / {p.name}</p>
      <div className="pdp">
        <div className="pdp-media"><ProductImage id={p.id} label={p.name} /></div>
        <div className="pdp-info">
          <p className="pcard-brand">{p.brand}</p>
          <h1>{p.name}</h1>
          <p className="pdp-sub"><span className="rating"><Icon name="star" size={12} /> {p.rating}</span> {p.genericName} · {p.netQuantity}</p>
          <div className="price-box">
            <p><b>₹{p.price}</b> (incl. all taxes) · MRP ₹{p.mrp} · Lowest price in the last 30 days: ₹{p.lowest30d}</p>
            <p className="muted">Unit sale price {p.unitPrice}</p>
          </div>
          <OfferEnds endsAt={p.offerEndsAt} />
          <p className="info-line"><Icon name="truck" /> Delivery ₹30, free above ₹499 or with FairPass.</p>
          <div className="buy-row">
            <label className="qty">Quantity <input type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value))} /></label>
            <button className="btn btn-primary">Add to cart</button>
          </div>
          <div className="seller-card">
            <span className="promise-icon"><Icon name="store" /></span>
            <p>Sold by <b>{p.seller.name}</b>, {p.seller.address} · seller rating {p.seller.rating}</p>
          </div>
          <div className="seller-card">
            <span className="promise-icon"><Icon name="return" /></span>
            <p>Returns: unopened packaged items can be returned within 7 days for a full refund. <a href="/policies/returns">Return policy</a></p>
          </div>
        </div>
      </div>
      <section className="card">
        <h2>Product information</h2>
        <table className="spec">
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
    </main>
  );
}
