import { ProductCard } from "../components/ProductCard";
import { NewsletterModal } from "../components/NewsletterModal";
import { Footer } from "../components/Footer";
import { ProductArt } from "../components/ProductArt";
import { Icon } from "../components/Icon";
import { PRODUCTS } from "../data/products";
import { CREATOR_PICKS } from "../data/creators";

const CATEGORIES = [
  { art: "atta-5", label: "Atta, rice & dal" },
  { art: "olive-1", label: "Oils & ghee" },
  { art: "tea-500", label: "Tea & coffee" },
  { art: "dairy", label: "Dairy & bread" },
  { art: "snacks", label: "Snacks" },
  { art: "home", label: "Cleaning" },
];

export default function Home() {
  const sponsored = PRODUCTS.filter((p) => p.sponsored);
  return (
    <main className="page home">
      <section className="hero">
        <div>
          <span className="hero-chip"><Icon name="bolt" size={13} /> Delivered in 2–4 hours</span>
          <h1>Daily essentials, delivered to your door</h1>
          <p>Atta, oils, tea and household staples from sellers you can see on every product page.</p>
          <a href="/search" className="btn btn-yellow">Shop now <Icon name="chevron" size={16} /></a>
        </div>
        <div className="hero-art" aria-hidden="true">
          <ProductArt id="atta-5" size={104} /><ProductArt id="olive-1" size={104} /><ProductArt id="tea-500" size={104} />
        </div>
      </section>

      <section className="cats" aria-label="Shop by category">
        {CATEGORIES.map((c) => (
          <a key={c.label} href="/search" className="cat"><ProductArt id={c.art} size={64} /><span>{c.label}</span></a>
        ))}
      </section>

      <section>
        <div className="sec-head"><h2>Top picks for you</h2><a href="/search">See all <Icon name="chevron" size={14} /></a></div>
        <div className="grid">
          {[...sponsored, ...PRODUCTS.filter((p) => !p.sponsored)].map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>

      <section>
        <div className="sec-head"><h2>Creator picks</h2></div>
        <div className="creators">
          {CREATOR_PICKS.map((c) => (
            <blockquote key={c.creator} className="card creator">
              <ProductArt id={c.productId} size={64} />
              <div>
                <p>“{c.quote}” — <b>{c.creator}</b> {c.paid && <span className="badge">Paid partnership</span>}</p>
                <a href={`/product/${c.productId}`} className="link-strong">Shop now <Icon name="chevron" size={14} /></a>
              </div>
            </blockquote>
          ))}
        </div>
      </section>

      <p className="strip"><Icon name="truck" size={18} /> Free delivery on orders above ₹499. Below that, delivery is ₹30.</p>
      <NewsletterModal />
      <Footer />
    </main>
  );
}
