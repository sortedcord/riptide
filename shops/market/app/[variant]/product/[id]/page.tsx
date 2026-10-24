"use client";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { use, useRef, useState } from "react";
import { Slot, SlotButton, formatINR, useHydrated, useLineToggle, useRiptide, useSlotDefault } from "@riptide/core";
import { artColor, categoryBySlug, discountPct, productById, products, unitPrice, type Product } from "@/data/catalog";
import { COUPONS, FEES } from "@/shop.config";
import { Art } from "@/components/Art";
import { Icon } from "@/components/Icons";
import { Crumbs, ProductCard, Rating, Stars } from "@/components/Ui";
import { deliveryDate, fmtDate, useCart, useQuote, useToday } from "@/components/hooks";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const p = productById(id);
  if (!p) notFound();
  return <ProductView key={p.id} p={p} />;
}

const VIEW_NAMES = ["Front", "Angle", "Detail", "In the box"];
const METROS = ["11", "40", "41", "50", "56", "60", "70"];

function ProductView({ p }: { p: Product }) {
  const { base } = useRiptide();
  const router = useRouter();
  const cart = useCart();
  const hydrated = useHydrated();
  const today = useToday();
  const cat = categoryBySlug(p.category)!;

  const preset = useSlotDefault<string>("product.variants.selector", "");
  const [opts, setOpts] = useState<(number | undefined)[]>(() =>
    p.variants.map((g) => {
      const i = preset ? g.options.findIndex((o) => preset.split("|").includes(o.label)) : -1;
      return i >= 0 ? i : g.required ? undefined : 0;
    }));
  const [missing, setMissing] = useState(false);
  const [view, setView] = useState(0);
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const chosen = opts.map((o) => o ?? 0);
  const { price, mrp } = unitPrice(p, chosen);
  const off = discountPct(price, mrp);
  const quote = useQuote({ pid: p.id, opts: chosen, qty: 1 });
  const fee = (k: string) => quote.lines.find((l) => l.key === k);
  const delivery = fee("delivery"), platform = fee("platform");

  const [warranty, setWarranty] = useLineToggle("warranty");
  const [wrap, setWrap] = useLineToggle("giftwrap");
  const [warrantyChoice, setWarrantyChoice] = useState<"add" | "decline" | null>(null);

  const [pinInput, setPinInput] = useState("");
  const [pinResult, setPinResult] = useState<{ ok: boolean; text: string } | null>(null);
  const checkPin = () => {
    const pin = pinInput.trim();
    if (!/^[1-8]\d{5}$/.test(pin)) return setPinResult({ ok: false, text: "Enter a valid 6-digit PIN code." });
    cart.set({ pin });
    const from = today ?? new Date("2026-10-24T00:00:00");
    const fast = p.delivery === "nextday" && METROS.includes(pin.slice(0, 2)) ? 1 : p.delivery !== "standard" ? 2 : 0;
    const std = deliveryDate(from, METROS.includes(pin.slice(0, 2)) ? 4 : 6);
    const parts = [`Standard delivery by ${fmtDate(std, { weekday: "short", day: "numeric", month: "short" })}`];
    if (fast) parts.push(`${fast === 1 ? "Next-day" : "Express"} by ${fmtDate(deliveryDate(from, fast), { weekday: "short", day: "numeric", month: "short" })} (+${formatINR(fast === 1 ? FEES.nextday : FEES.express)}, choose at checkout)`);
    setPinResult({ ok: true, text: `Delivering to ${pin}. ${parts.join(". ")}.` });
  };

  const add = (go: boolean) => {
    if (opts.some((o) => o === undefined)) { setMissing(true); return; }
    cart.add({ pid: p.id, opts: chosen, qty });
    if (go) router.push(`${base}/cart`);
    else {
      setToast(true);
      clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(false), 6000);
    }
  };

  const offers = COUPONS.filter((c) => !c.category || c.category === p.category);
  const similar = products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 6);
  const hist = [5, 4, 3, 2, 1].map((n) => ({ n, c: p.reviews.filter((r) => r.rating === n).length }));
  const lowStock = p.stock <= 5;

  return (
    <main data-riptide-step="product" className="cw-wrap pt-5">
      <Crumbs items={[["Home", base], [cat.name, `${base}/search?cat=${cat.slug}`], [p.title]]} />
      <Slot id="product.promo.banner" className="mt-4 empty:hidden" />

      <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)_340px]">
        {/* Gallery */}
        <Slot id="product.gallery.main" as="section" aria-label="Product images" className="flex flex-col-reverse gap-3 md:flex-row lg:sticky lg:top-4 lg:self-start">
          <div className="flex gap-2 md:flex-col" role="group" aria-label="Choose image">
            {Array.from({ length: p.images }, (_, i) => (
              <button key={i} type="button" onClick={() => setView(i)} aria-label={`Show image ${i + 1}: ${VIEW_NAMES[i]}`} aria-pressed={view === i}
                className={`h-16 w-16 overflow-hidden rounded-[10px] border-2 ${view === i ? "border-primary" : "border-line"}`}>
                <Art kind={p.art} color={artColor(p, chosen)} accent={p.colors[1]} view={i} className="h-full w-full" />
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-hidden rounded-[var(--rt-radius)] border border-line">
            <Art kind={p.art} color={artColor(p, chosen)} accent={p.colors[1]} view={view} className="block aspect-square w-full" label={`${p.title}, ${VIEW_NAMES[view].toLowerCase()} view`} />
          </div>
        </Slot>

        {/* Details */}
        <section aria-label="Product details" className="min-w-0">
          <Link href={`${base}/search?brand=${encodeURIComponent(p.brand)}`} className="rt-link text-sm">Visit the {p.brand} store</Link>
          <Slot id="product.title.text" as="h1" className="mt-1 text-2xl font-semibold leading-tight md:text-[1.9rem]">{p.title}</Slot>
          <div className="mt-2 flex items-center gap-3"><Rating value={p.rating} count={p.reviewCount} /><a href="#reviews" className="rt-link text-sm">{p.reviews.length} reviews · {p.qa.length} answered questions</a></div>

          <div className="mt-5 border-t border-line pt-4">
            <div className="flex flex-wrap items-baseline gap-x-3">
              {off > 0 && <Slot id="product.price.discount" as="span" className="cw-off text-2xl">{`−${off}%`}</Slot>}
              <Slot id="product.price.current" as="span" className="cw-price text-[2rem]">{formatINR(price)}</Slot>
            </div>
            <p className="mt-0.5 text-sm text-muted">M.R.P.: <Slot id="product.price.mrp" as="span" className="cw-mrp">{formatINR(mrp)}</Slot> · Inclusive of all taxes</p>
            <Slot id="product.fees.note" as="p" className="mt-2 text-sm">
              {delivery && platform
                ? `${delivery.amount === 0 ? "Free standard delivery" : `+ ${formatINR(delivery.amount)} delivery (free on orders over ${formatINR(FEES.freeDeliveryOver)})`} · + ${formatINR(platform.amount)} platform fee per order`
                : ""}
            </Slot>
          </div>

          {p.variants.length > 0 && (
            <Slot id="product.variants.selector" className="mt-5 flex flex-col gap-4">
              {p.variants.map((g, gi) => (
                <fieldset key={g.name}>
                  <legend className="mb-2 text-sm">
                    <span className="font-semibold">{g.name}:</span> {opts[gi] !== undefined ? g.options[opts[gi]!].label : <span className="text-muted">Select a {g.name.toLowerCase().replace(/ \(.*\)/, "")}</span>}
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {g.options.map((o, oi) => (
                      <button key={o.label} type="button" className="cw-chip" aria-pressed={opts[gi] === oi}
                        onClick={() => { setOpts(opts.map((x, k) => (k === gi ? oi : x))); setMissing(false); }}>
                        {o.swatch && <span className="cw-swatch" style={{ background: o.swatch }} />}
                        {o.label}
                        {o.delta > 0 && <span className="text-xs text-muted">+{formatINR(o.delta)}</span>}
                      </button>
                    ))}
                  </div>
                  {missing && opts[gi] === undefined && <p className="cw-error mt-1.5" role="alert">Please select a {g.name.toLowerCase().replace(/ \(.*\)/, "")} to continue.</p>}
                </fieldset>
              ))}
            </Slot>
          )}

          <Slot id="product.offers.list" as="section" className="mt-6" aria-label="Offers">
            <h2 className="text-base font-semibold" style={{ fontFamily: "var(--rt-font-body)" }}>Offers</h2>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2">
              {offers.map((c) => (
                <li key={c.code} className="cw-panel-flat flex gap-2.5 p-3 text-sm">
                  <span className="text-clay"><Icon name="tag" size={18} /></span>
                  <span><strong className="block font-semibold">{c.code}</strong>{c.title}. Apply in cart.</span>
                </li>
              ))}
              <li className="cw-panel-flat flex gap-2.5 p-3 text-sm">
                <span className="text-clay"><Icon name="truck" size={18} /></span>
                <span><strong className="block font-semibold">Free delivery</strong>On orders with items worth {formatINR(FEES.freeDeliveryOver)} or more.</span>
              </li>
            </ul>
          </Slot>

          <section className="mt-6" aria-label="About this item">
            <h2 className="text-base font-semibold" style={{ fontFamily: "var(--rt-font-body)" }}>About this item</h2>
            <p className="mt-1.5 text-[#2f3a34]">{p.about}</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[#2f3a34]">
              {p.specs.slice(0, 4).map(([k, v]) => <li key={k}><strong className="font-semibold">{k}:</strong> {v}</li>)}
            </ul>
          </section>
        </section>

        {/* Buy box */}
        <aside aria-label="Buy" className="flex flex-col gap-4 lg:col-span-2 xl:col-span-1">
          <div className="cw-panel flex flex-col gap-4 p-5">
            <div>
              <span className="cw-price text-2xl">{formatINR(price * qty)}</span>
              {qty > 1 && <span className="ml-2 text-sm text-muted">{qty} × {formatINR(price)}</span>}
            </div>
            <Slot id="product.stock.status" as="p" className={`text-sm font-semibold ${lowStock ? "text-clay" : "text-success"}`}>
              {lowStock ? `Only ${p.stock} left in stock` : "In stock"}
            </Slot>

            <Slot id="product.delivery.check" as="section" aria-label="Delivery" className="rounded-[var(--rt-radius-sm)] bg-surface-2 p-3">
              <form className="flex flex-col gap-2" onSubmit={(e) => { e.preventDefault(); checkPin(); }} noValidate>
                <label htmlFor="pin" className="flex items-center gap-1.5 text-sm font-semibold"><Icon name="pin" size={16} /> Check delivery</label>
                <div className="flex gap-2">
                  <input id="pin" inputMode="numeric" maxLength={6} placeholder="Enter PIN code" value={pinInput} onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
                    className="rt-input !min-h-10 flex-1" aria-invalid={pinResult?.ok === false} aria-describedby="pin-result" />
                  <SlotButton id="product.delivery.pin-check" as="button" type="submit" variant="secondary" className="!min-h-10">Check</SlotButton>
                </div>
                <p id="pin-result" aria-live="polite" className={`min-h-5 text-sm ${pinResult?.ok === false ? "cw-error" : ""}`}>
                  {pinResult?.text ?? (p.delivery === "nextday" ? "Next-day delivery available in most metro PIN codes." : p.delivery === "express" ? "Express (2-day) delivery available at checkout." : "Standard delivery in 4–6 days.")}
                </p>
              </form>
            </Slot>

            <div className="flex items-center gap-3">
              <label htmlFor="qty" className="text-sm font-semibold">Quantity</label>
              <select id="qty" value={qty} onChange={(e) => setQty(Number(e.target.value))} className="rt-input !min-h-10 !w-20">
                {Array.from({ length: Math.min(5, p.stock) }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
              </select>
            </div>

            {p.warranty && (
              <Slot id="product.addons.warranty" as="section" aria-label="Extended warranty" className="rounded-[var(--rt-radius-sm)] border border-line p-3">
                <div className="flex items-start gap-2.5">
                  <span className="text-primary"><Icon name="shield" size={20} /></span>
                  <div className="text-sm">
                    <p className="font-semibold">Extended warranty, 1 extra year · {formatINR(p.warranty)} per item</p>
                    <p className="mt-0.5 text-muted">Covers manufacturing defects after the brand warranty ends. Applies to every eligible item in your cart; you can remove it in the cart. Refundable within 30 days.</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <SlotButton id="product.addons.warranty-add" variant="secondary" aria-pressed={hydrated && warranty} className="!min-h-10 !text-sm"
                    onClick={() => { setWarranty(true); setWarrantyChoice("add"); }}>Add protection</SlotButton>
                  <SlotButton id="product.addons.warranty-decline" variant="secondary" aria-pressed={hydrated && !warranty && warrantyChoice === "decline"} className="!min-h-10 !text-sm"
                    onClick={() => { setWarranty(false); setWarrantyChoice("decline"); }}>No, thanks</SlotButton>
                </div>
                <p className="mt-2 min-h-5 text-xs text-muted" aria-live="polite">{hydrated && warranty ? "Protection added. It will show as its own line in your cart." : ""}</p>
              </Slot>
            )}

            <Slot id="product.addons.giftwrap" as="label" className="rt-check text-sm">
              <input type="checkbox" checked={hydrated && wrap} onChange={(e) => setWrap(e.target.checked)} />
              <span>Add gift wrap (+{formatINR(FEES.giftwrap)} per order)<span className="block text-xs text-muted">Wraps every item in the order, with a printed note.</span></span>
            </Slot>

            <div className="flex flex-col gap-2">
              <SlotButton id="product.cta.add" variant="primary" onClick={() => add(false)} disabled={!hydrated}>Add to cart</SlotButton>
              <SlotButton id="product.cta.buy" variant="secondary" onClick={() => add(true)} disabled={!hydrated}>Buy now</SlotButton>
            </div>
            <p className="flex items-center gap-1.5 text-xs text-muted"><Icon name="lock" size={14} /> Secure checkout · {p.seller.returns} · GST invoice</p>
          </div>

          <Slot id="product.seller.card" as="section" aria-label="Seller" className="cw-panel-flat p-4 text-sm">
            <p className="cw-eyebrow">Sold by</p>
            <p className="mt-1 flex items-center gap-2 text-base font-semibold"><Icon name="store" size={18} /> {p.seller.name}</p>
            <p className="mt-1 text-muted">{p.seller.city} · On Cartwheel since {p.seller.since}</p>
            <p className="mt-2 flex items-center gap-2"><span className="cw-rating">{p.seller.rating.toFixed(1)}<Icon name="star" size={11} fill="currentColor" strokeWidth={0} /></span> Seller rating · {p.seller.returns}</p>
            <p className="mt-2 text-muted">Shipped by Cartwheel Logistics.</p>
          </Slot>
        </aside>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <Slot id="product.specs.table" as="section" aria-labelledby="specs-h">
          <h2 id="specs-h" className="cw-h2 mb-3">Specifications</h2>
          <div className="overflow-hidden rounded-[var(--rt-radius)] border border-line bg-surface">
            <table className="cw-specs">
              <tbody>
                <tr><th scope="row">Brand</th><td>{p.brand}</td></tr>
                {p.specs.map(([k, v]) => <tr key={k}><th scope="row">{k}</th><td>{v}</td></tr>)}
                {p.warranty && <tr><th scope="row">Brand warranty</th><td>1 year from the date of delivery</td></tr>}
              </tbody>
            </table>
          </div>
        </Slot>

        <Slot id="product.qa.list" as="section" aria-labelledby="qa-h">
          <h2 id="qa-h" className="cw-h2 mb-3">Questions &amp; answers</h2>
          <ul className="flex flex-col gap-3">
            {p.qa.map((x) => (
              <li key={x.q} className="cw-panel-flat p-4 text-sm">
                <p className="font-semibold">Q: {x.q}</p>
                <p className="mt-1 text-[#2f3a34]">A: {x.a}</p>
                <p className="mt-1 text-xs text-muted">Answered by {x.by}</p>
              </li>
            ))}
          </ul>
        </Slot>
      </div>

      <Slot id="product.reviews.list" as="section" aria-labelledby="reviews" className="mt-12 grid gap-8 lg:grid-cols-[300px_1fr]">
        <div>
          <h2 id="reviews" className="cw-h2 scroll-mt-4">Ratings &amp; reviews</h2>
          <p className="mt-3 flex items-center gap-2"><span className="text-4xl font-semibold">{p.rating.toFixed(1)}</span><Stars value={p.rating} size={18} /></p>
          <p className="text-sm text-muted">{p.reviewCount.toLocaleString("en-IN")} ratings · {p.reviews.length} written reviews shown</p>
          <ul className="mt-4 flex flex-col gap-1.5 text-sm">
            {hist.map(({ n, c }) => (
              <li key={n} className="flex items-center gap-2">
                <span className="w-8">{n}★</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2"><span className="block h-full rounded-full bg-saffron" style={{ width: `${(c / p.reviews.length) * 100}%` }} /></span>
                <span className="w-6 text-right text-muted">{c}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted">Bars show the reviews listed here.</p>
        </div>
        <ul className="flex flex-col gap-4">
          {p.reviews.map((r) => (
            <li key={r.name} className="border-b border-line pb-4">
              <div className="flex items-center gap-2"><Stars value={r.rating} /><strong>{r.title}</strong></div>
              <p className="mt-1 text-xs text-muted">{r.name}, {r.city} · {r.date}{r.verified ? " · Verified purchase" : ""}</p>
              <p className="mt-2 text-[#2f3a34]">{r.body}</p>
              <p className="mt-1 text-xs text-muted">{r.helpful} people found this helpful</p>
            </li>
          ))}
        </ul>
      </Slot>

      <section className="mt-12" aria-label="Similar products">
        <h2 className="cw-h2 mb-4">More in {cat.name}</h2>
        <div className="cw-rail">{similar.map((x) => <ProductCard key={x.id} p={x} base={base} />)}</div>
      </section>

      {toast && (
        <div className="cw-toast" role="status">
          <Icon name="check" size={18} /> <span>Added to cart</span>
          <Link href={`${base}/cart`}>View cart ({cart.count})</Link>
          <button type="button" aria-label="Dismiss" onClick={() => setToast(false)} className="rounded-full p-1 hover:bg-white/10"><Icon name="close" size={16} /></button>
        </div>
      )}
    </main>
  );
}
