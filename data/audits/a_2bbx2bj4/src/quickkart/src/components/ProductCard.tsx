import type { Product } from "../data/products";
import { ProductArt } from "./ProductArt";
import { Icon } from "./Icon";

export function ProductCard({ p }: { p: Product }) {
  const discount = p.lowest30d > p.price;
  return (
    <a href={`/product/${p.id}`} className="card tile">
      <div className="tile-img"><ProductArt id={p.id} size={112} /></div>
      <span className="chip-eta"><Icon name="clock" size={11} /> {p.deliveryHours} hrs</span>
      <h3>{p.name}</h3>
      <p className="muted">{p.unitPrice} · {p.netQuantity}</p>
      <p className="warn">Only {2 + Math.floor(Math.random() * 3)} left — selling fast!</p>
      {discount && <p className="low30">Lowest in last 30 days: ₹{p.lowest30d}</p>}
      <div className="tile-foot">
        <p className="price"><b>₹{p.price}</b> <s>MRP ₹{p.mrp}</s></p>
        <span className="add">ADD</span>
      </div>
    </a>
  );
}
