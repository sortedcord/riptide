import { ProductCard } from "../components/ProductCard";
import { ProductImage } from "../components/ProductImage";
import { NewsletterModal } from "../components/NewsletterModal";
import { Footer } from "../components/Footer";
import { Icon } from "../components/Icons";
import { PRODUCTS } from "../data/products";
import { CREATOR_PICKS } from "../data/creators";

const PROMISES = [
  { icon: "rupee", title: "One honest price", text: "All taxes included. Every charge is shown in the cart." },
  { icon: "truck", title: "Free delivery above ₹499", text: "Below that, a flat ₹30. Always free with FairPass." },
  { icon: "return", title: "Easy returns", text: "Unopened packs within 7 days, full refund." },
] as const;

export default function Home() {
  const sponsored = PRODUCTS.filter((p) => p.sponsored);
  return (
    <>
      <main className="home">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Groceries &amp; household essentials</p>
            <h1>Everyday staples, priced plainly.</h1>
            <p>Packaged goods from named Indian sellers, delivered across Bengaluru. What you see on the shelf is what you pay.</p>
            <div className="hero-actions"><a href="/search" className="btn btn-primary">Browse the store</a> <a href="/membership" className="btn btn-outline">About FairPass</a></div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <ProductImage id="atta-5" label="" /><ProductImage id="olive-1" label="" /><ProductImage id="ghee-500" label="" />
          </div>
        </section>
        <ul className="promises">
          {PROMISES.map((x) => <li key={x.title}><span className="promise-icon"><Icon name={x.icon} /></span><div><b>{x.title}</b><span>{x.text}</span></div></li>)}
        </ul>
        <section className="sponsored-slot">
          <h2>Sponsored</h2>
          <div className="grid">{sponsored.map((p) => <ProductCard key={p.id} p={p} />)}</div>
        </section>
        <section>
          <h2>Fresh this week</h2>
          <div className="grid">{PRODUCTS.filter((p) => !p.sponsored).map((p) => <ProductCard key={p.id} p={p} />)}</div>
        </section>
        <section>
          <h2>Creator picks</h2>
          <div className="creator-grid">
            {CREATOR_PICKS.map((c) => (
              <blockquote key={c.creator} className="creator">
                <ProductImage id={c.productId} label="" />
                <div><p>“{c.quote}”</p><span className="creator-by"><span className="avatar">{c.creator[1].toUpperCase()}</span>{c.creator}</span> <a href={`/product/${c.productId}`} className="btn btn-outline btn-sm">Shop now</a></div>
              </blockquote>
            ))}
          </div>
        </section>
        <p className="note-banner"><Icon name="truck" /> Free delivery on orders above ₹499. Below that, delivery is ₹30.</p>
      </main>
      <NewsletterModal />
      <Footer />
    </>
  );
}
