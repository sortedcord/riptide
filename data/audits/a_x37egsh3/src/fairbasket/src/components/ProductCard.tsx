import type { Product } from "../data/products";

export function ProductCard({ p }: { p: Product }) {
  const discount = p.lowest30d > p.price;
  return (
    <a href={`/product/${p.id}`} className="card">
      {p.sponsored && <span className="badge">Sponsored</span>}
      <h3>{p.name}</h3>
      <p>
        <b>₹{p.price}</b> <s>MRP ₹{p.mrp}</s> {discount && <span>Lowest in last 30 days: ₹{p.lowest30d}</span>}
      </p>
      <p className="muted">{p.unitPrice} · {p.netQuantity}</p>
      {p.stock <= 5 && <p className="warn">Only {p.stock} left in stock</p>}
    </a>
  );
}
