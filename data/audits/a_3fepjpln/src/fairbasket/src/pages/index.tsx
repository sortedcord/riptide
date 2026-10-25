import { ProductCard } from "../components/ProductCard";
import { NewsletterModal } from "../components/NewsletterModal";
import { Footer } from "../components/Footer";
import { PRODUCTS } from "../data/products";
import { CREATOR_PICKS } from "../data/creators";

export default function Home() {
  const sponsored = PRODUCTS.filter((p) => p.sponsored);
  return (
    <main>
      <section>
        <h2>Sponsored</h2>
        {sponsored.map((p) => <ProductCard key={p.id} p={p} />)}
      </section>
      <section>
        <h2>Fresh this week</h2>
        {PRODUCTS.filter((p) => !p.sponsored).map((p) => <ProductCard key={p.id} p={p} />)}
      </section>
      <section>
        <h2>Creator picks</h2>
        {CREATOR_PICKS.map((c) => (
          <blockquote key={c.creator}>“{c.quote}” — {c.creator} <a href={`/product/${c.productId}`}>Shop now</a></blockquote>
        ))}
      </section>
      <p>Free delivery on orders above ₹499. Below that, delivery is ₹30.</p>
      <NewsletterModal />
      <Footer />
    </main>
  );
}
