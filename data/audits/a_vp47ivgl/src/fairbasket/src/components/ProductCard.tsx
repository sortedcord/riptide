import type { Product } from "../data/products";
import { ProductImage } from "./ProductImage";
import { Icon } from "./Icons";

export function ProductCard({ p }: { p: Product }) {
  const discount = p.lowest30d > p.price;
  return (
    <article className="card pcard">
      <a href={`/product/${p.id}`} className="pcard-link">
        {p.sponsored && <span className="badge badge-sponsored">Sponsored</span>}
        <ProductImage id={p.id} label={p.name} />
        <span className="pcard-brand">{p.brand}</span>
        <h3>{p.name}</h3>
        <span className="pcard-generic">{p.genericName}</span>
      </a>
      <p className="pcard-price">
        <b>₹{p.price}</b> <s>MRP ₹{p.mrp}</s> {discount && <span className="lowest">Lowest in last 30 days: ₹{p.lowest30d}</span>}
      </p>
      <p className="muted">{p.unitPrice} · {p.netQuantity}</p>
      <p className="pcard-meta">
        <span className="rating"><Icon name="star" size={12} /> {p.rating}</span>
        <span><Icon name="truck" size={13} /> About {p.deliveryHours} hrs</span>
      </p>
      {p.stock <= 5 && <p className="warn">Only {p.stock} left in stock</p>}
      <a href={`/product/${p.id}`} className="btn btn-outline btn-block">View details</a>
    </article>
  );
}
