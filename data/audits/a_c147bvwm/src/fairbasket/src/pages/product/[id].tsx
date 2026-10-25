import { useState } from "react";
import { PRODUCTS } from "../../data/products";
import { OfferEnds } from "../../components/Countdown";

export default function ProductPage({ id }: { id: string }) {
  const p = PRODUCTS.find((x) => x.id === id)!;
  const [qty, setQty] = useState(1);
  return (
    <main>
      <h1>{p.name}</h1>
      <p><b>₹{p.price}</b> (incl. all taxes) · MRP ₹{p.mrp} · Lowest price in the last 30 days: ₹{p.lowest30d}</p>
      <OfferEnds endsAt={p.offerEndsAt} />
      <p>Delivery ₹30, free above ₹499 or with FairPass.</p>
      <table>
        <tbody>
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
      <p>Sold by {p.seller.name}, {p.seller.address} · seller rating {p.seller.rating}</p>
      <p>Returns: unopened packaged items can be returned within 7 days for a full refund. <a href="/policies/returns">Return policy</a></p>
      <label>Quantity <input type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value))} /></label>
      <button>Add to cart</button>
    </main>
  );
}
