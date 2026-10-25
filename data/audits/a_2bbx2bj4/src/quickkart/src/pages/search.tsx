import { ProductCard } from "../components/ProductCard";
import { Icon } from "../components/Icon";
import { PRODUCTS } from "../data/products";
import { rank } from "../lib/ranking";

export default function Search({ q = "", origin = "" }: { q?: string; origin?: string }) {
  const results = rank(PRODUCTS, q).filter((p) => !origin || p.countryOfOrigin === origin);
  const origins = [...new Set(PRODUCTS.map((p) => p.countryOfOrigin))];
  return (
    <main className="page">
      <div className="searchbar"><Icon name="search" size={18} /><input defaultValue={q} placeholder="Search for products" aria-label="Search" /></div>
      <div className="toolbar">
        <p className="muted">{results.length} results for “{q}”</p>
        <p>Sorted by relevance · <a href="/policies/ranking">How we rank results</a></p>
        <label className="select">Country of origin <select defaultValue="">{["", ...origins].map((o) => <option key={o} value={o}>{o || "Any"}</option>)}</select></label>
      </div>
      <div className="grid">{results.map((p) => <ProductCard key={p.id} p={p} />)}</div>
    </main>
  );
}
