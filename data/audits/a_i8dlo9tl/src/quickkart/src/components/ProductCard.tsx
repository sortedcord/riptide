import type { Product } from "../data/products";

export function ProductCard({ p }: { p: Product }) {
  const discount = p.lowest30d > p.price;
  return (
    <a href={`/product/${p.id}`} className="card">
      <h3>{p.name}</h3>
      <p>
        <b>₹{p.price}</b> <s>MRP ₹{p.mrp}</s> {discount && <span>Lowest in last 30 days: ₹{p.lowest30d}</span>}
      </p>
      <p className="muted">{p.unitPrice} · {p.netQuantity}</p>
      <p className="warn">Only {2 + Math.floor(Math.random() * 3)} left — selling fast!</p>
    </a>
  );
}
