import { ProductCard } from "../components/ProductCard";
import { PRODUCTS } from "../data/products";
import { rank } from "../lib/ranking";

export default function Search({ q = "", origin = "" }: { q?: string; origin?: string }) {
  const results = rank(PRODUCTS, q).filter((p) => !origin || p.countryOfOrigin === origin);
  const origins = [...new Set(PRODUCTS.map((p) => p.countryOfOrigin))];
  return (
    <main>
      <p>Sorted by relevance · <a href="/policies/ranking">How we rank results</a></p>
      <label>Country of origin <select defaultValue="">{["", ...origins].map((o) => <option key={o} value={o}>{o || "Any"}</option>)}</select></label>
      {results.map((p) => <ProductCard key={p.id} p={p} />)}
    </main>
  );
}
