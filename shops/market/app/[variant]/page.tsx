"use client";
import Link from "next/link";
import { useState } from "react";
import { Slot, prng, useRiptide } from "@riptide/core";
import { categories, discountPct, products } from "@/data/catalog";
import { PLUS_BENEFITS } from "@/data/content";
import { Art } from "@/components/Art";
import { Icon } from "@/components/Icons";
import { ProductCard } from "@/components/Ui";

const deals = [...products].sort((a, b) => discountPct(b.price, b.mrp) - discountPct(a.price, a.mrp) || a.id.localeCompare(b.id)).slice(0, 6);
const rnd = prng("cartwheel-home-recommended");
const recommended = [...products].map((p) => ({ p, k: rnd() })).sort((a, b) => a.k - b.k).map((x) => x.p).filter((p) => !deals.includes(p)).slice(0, 6);
const kitchen = products.filter((p) => p.category === "home-kitchen").sort((a, b) => b.rating - a.rating).slice(0, 6);

function Rail({ title, titleId, railId, href, items }: { title: string; titleId?: string; railId?: string; href: string; items: typeof products }) {
  const { base } = useRiptide();
  const cards = items.map((p) => <ProductCard key={p.id} p={p} base={base} data-dp={railId ? `${railId.replace(/\.rail$/, "")}.item.${p.id}` : undefined} />);
  return (
    <section className="mt-12" aria-label={title}>
      <div className="mb-4 flex items-end justify-between gap-4">
        {titleId ? <Slot id={titleId} as="h2" className="cw-h2">{title}</Slot> : <h2 className="cw-h2">{title}</h2>}
        <Link href={href} className="rt-link text-sm">See all</Link>
      </div>
      {railId ? <Slot id={railId} className="cw-rail">{cards}</Slot> : <div className="cw-rail">{cards}</div>}
    </section>
  );
}

export default function Home() {
  const { base } = useRiptide();
  const [slide, setSlide] = useState(0);
  const slides = [
    {
      key: "electronics", bg: "#0b3328", fg: "#f6f1e4",
      body: (
        <>
          <p className="cw-eyebrow !text-saffron">New season, fair prices</p>
          <Slot id="home.hero.title" as="h1" className="mt-3 text-4xl font-semibold leading-[1.05] md:text-6xl">Everything, delivered right.</Slot>
          <p className="mt-4 max-w-md text-[#cfd6cc] md:text-lg">Phones, audio and laptops from independent sellers, with every fee shown before you check out.</p>
          <Slot id="home.hero.cta" as={Link} href={`${base}/search?cat=electronics`} className="rt-btn mt-6 !bg-saffron !text-ink" variant="primary">Shop electronics</Slot>
        </>
      ),
      art: [["headphones", "#2e3a33", "#c7a46a"], ["phone", "#7d9c87", "#7fa7c9"], ["earbuds", "#ece5d6", "#e2795b"]] as const,
    },
    {
      key: "grocery", bg: "#efe3c4", fg: "#2b2210",
      body: (
        <>
          <p className="cw-eyebrow !text-[#7a5a1a]">Pantry staples</p>
          <h2 className="mt-3 text-4xl font-semibold leading-[1.05] md:text-6xl">Rice, atta, tea. Here tomorrow.</h2>
          <p className="mt-4 max-w-md text-[#5a4a2a] md:text-lg">Next-day delivery on every grocery item in serviceable PIN codes. Free delivery when your items total ₹499 or more.</p>
          <Link href={`${base}/search?cat=grocery`} className="rt-btn mt-6" data-variant="primary">Shop grocery</Link>
        </>
      ),
      art: [["sack", "#e8dcc0", "#2f5b45"], ["pouch", "#7a2f2a", "#e7c66a"], ["jar", "#d99a2b", "#3a5a3a"]] as const,
    },
    {
      key: "offer", bg: "#c0532e", fg: "#fff6ec",
      body: (
        <>
          <p className="cw-eyebrow !text-[#ffd9b8]">Offer · valid until 31 Dec 2026</p>
          <h2 className="mt-3 text-4xl font-semibold leading-[1.05] md:text-6xl">₹100 off with WELCOME100</h2>
          <p className="mt-4 max-w-md text-[#ffe6d4] md:text-lg">On orders with items worth ₹999 or more. Enter the code in your cart; the discount shows as its own line.</p>
          <Link href={`${base}/policies/terms`} className="rt-btn mt-6 !border-white !bg-transparent !text-white" data-variant="secondary">Offer terms</Link>
        </>
      ),
      art: [["shoe", "#e8e4dc", "#e2643c"], ["backpack", "#3f5446", "#d9b26f"], ["analog", "#7a4a2b", "#efe6d2"]] as const,
    },
  ];
  return (
    <main data-riptide-step="home" className="cw-wrap pt-5">
      <Slot id="home.promo.banner" className="mb-4 empty:hidden" />

      <Slot id="home.hero.carousel" as="section" aria-roledescription="carousel" aria-label="Featured" className="relative overflow-hidden rounded-[22px]">
        {slides.map((s, i) => (
          <div key={s.key} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${slides.length}`} hidden={i !== slide}
            className="grid min-h-[400px] items-center gap-6 px-6 pb-20 pt-10 md:grid-cols-[1.1fr_1fr] md:px-14" style={{ background: s.bg, color: s.fg }}>
            <div>{s.body}</div>
            <div className="relative hidden h-[300px] md:block" aria-hidden>
              {s.art.map(([k, c, a], j) => (
                <div key={k} className="absolute overflow-hidden rounded-[18px] shadow-xl"
                  style={{ width: j === 0 ? 240 : 170, height: j === 0 ? 240 : 170, left: [90, 0, 300][j], top: [20, 130, 120][j], transform: `rotate(${[-3, 4, 6][j]}deg)` }}>
                  <Art kind={k} color={c} accent={a} view={j === 0 ? 0 : 1} className="h-full w-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="absolute bottom-6 left-6 flex items-center gap-2 md:left-14">
          <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink shadow" aria-label="Previous slide" onClick={() => setSlide((slide + slides.length - 1) % slides.length)}><Icon name="chevronL" size={18} /></button>
          {slides.map((s, i) => (
            <button key={s.key} type="button" aria-label={`Show slide ${i + 1}`} aria-current={i === slide} onClick={() => setSlide(i)}
              className={`h-2.5 rounded-full transition-all ${i === slide ? "w-7 bg-white" : "w-2.5 bg-white/50"}`} />
          ))}
          <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink shadow" aria-label="Next slide" onClick={() => setSlide((slide + 1) % slides.length)}><Icon name="chevronR" size={18} /></button>
        </div>
      </Slot>

      <ul className="mt-5 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3" aria-label="Why shop with us">
        {([["tag", "Prices include GST", "Platform and delivery fees are shown in your cart, before checkout."], ["return", "7-day returns", "On most items. Grocery returns if damaged or expired."], ["truck", "Free delivery over ₹499", "Otherwise ₹40 standard delivery. Faster options at checkout."]] as const).map(([i, t, d]) => (
          <li key={t} className="cw-panel-flat flex items-start gap-3 p-4">
            <span className="mt-0.5 rounded-full bg-[#e4f1ea] p-2 text-primary"><Icon name={i} size={18} /></span>
            <span><strong className="block">{t}</strong><span className="text-muted">{d}</span></span>
          </li>
        ))}
      </ul>

      <section className="mt-12" aria-labelledby="cats">
        <h2 id="cats" className="cw-h2 mb-4">Shop by category</h2>
        <Slot id="home.categories.list" as="ul" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => (
            <li key={c.slug} data-dp={`home.categories.${c.slug}`}>
              <Link href={`${base}/search?cat=${c.slug}`} className="group flex h-full flex-col overflow-hidden rounded-[var(--rt-radius)] border border-line bg-surface no-underline hover:shadow-[var(--rt-shadow)]">
                <span className="block aspect-[4/3] overflow-hidden" style={{ background: c.tint }}>
                  <Art kind={c.art} color={products.find((p) => p.art === c.art)?.colors[0] ?? "#888888"} accent={products.find((p) => p.art === c.art)?.colors[1] ?? "#cccccc"} className="h-full w-full transition-transform group-hover:scale-105" />
                </span>
                <span className="p-3"><strong className="block">{c.name}</strong><span className="text-xs text-muted">{c.blurb}</span></span>
              </Link>
            </li>
          ))}
        </Slot>
      </section>

      <Rail title="Today's deals" titleId="home.deals.title" railId="home.deals.rail" href={`${base}/search?sort=discount`} items={deals} />
      <Rail title="Recommended for you" titleId="home.recommended.title" railId="home.recommended.rail" href={`${base}/search`} items={recommended} />

      <Slot id="home.plus.card" as="section" className="mt-12 grid gap-6 overflow-hidden rounded-[22px] bg-cream p-6 md:grid-cols-[auto_1fr_auto] md:items-center md:p-8">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink text-saffron"><Icon name="spark" size={28} /></span>
        <div>
          <h2 className="cw-h2">Cartwheel Plus</h2>
          <p className="mt-1 text-[#5a4a2a]">₹999 a year, renews yearly until you cancel. {PLUS_BENEFITS.join(". ")}. You can add it at checkout if you want it; it&apos;s never added for you.</p>
        </div>
        <Link href={`${base}/account/membership`} className="rt-btn" data-variant="secondary">How Plus works</Link>
      </Slot>

      <Rail title="Top rated in Home & Kitchen" href={`${base}/search?cat=home-kitchen&sort=rating`} items={kitchen} />
    </main>
  );
}
