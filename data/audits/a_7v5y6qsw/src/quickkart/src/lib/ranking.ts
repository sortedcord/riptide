import type { Product } from "../data/products";

/** Search ranking: text relevance first, then rating and delivery speed. Explained to users at /policies/ranking. */
export function rank(products: Product[], q: string): Product[] {
  const score = (p: Product) => (p.name.toLowerCase().includes(q.toLowerCase()) ? 10 : 0) + p.rating + (p.deliveryHours <= 2 ? 1 : 0);
  return products.filter((p) => !p.sponsored).sort((a, b) => score(b) - score(a));
}
