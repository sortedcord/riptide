"use client";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useState } from "react";
import { Slot, SlotButton, formatINR, useHydrated, usePrice, useRiptide, useSession, useSlotDefault } from "@riptide/core";
import { itemByIdLookup, restaurantById, type MenuItem } from "@/data/restaurants";
import { PLATFORM_FEE, restaurantOffers } from "@/data/profile";
import { lineDetail, type FoodState } from "@/shop.config";
import { areaOf } from "@/components/HomeView";
import { CoverArt, FoodArt } from "@/components/FoodArt";
import { CustomiseModal } from "@/components/CustomiseModal";
import { Breadcrumbs, Icon, QtyStepper, Rating, Skeleton, Toast, VegMark } from "@/components/ui";

const catId = (c: string) => `cat-${c.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

export default function RestaurantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const r = restaurantById(id);
  if (!r) notFound();
  const { base } = useRiptide();
  const [s, set] = useSession<FoodState>();
  const hydrated = useHydrated();
  const cartPrice = usePrice("cart");
  const [query, setQuery] = useState(useSlotDefault<string>("restaurant.menu.search", ""));
  const [vegOnly, setVegOnly] = useState(useSlotDefault<boolean>("restaurant.menu.veg-toggle", false));
  const [open, setOpen] = useState<MenuItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const { area, city } = areaOf(r, hydrated ? s.city : null);
  const offers = restaurantOffers(r.id);
  const q = query.trim().toLowerCase();
  const visible = r.items.filter((i) => (!vegOnly || i.veg) && (!q || i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q)));
  const mine = hydrated && s.restaurantId === r.id ? s.cart : [];
  const other = hydrated && s.cart.length > 0 && s.restaurantId !== r.id ? restaurantById(s.restaurantId) : undefined;
  const inCart = (itemId: string) => mine.filter((l) => l.itemId === itemId).reduce((t, l) => t + l.qty, 0);
  const count = mine.reduce((t, l) => t + l.qty, 0);
  const itemTotal = cartPrice.lines.filter((l) => l.kind === "item").reduce((t, l) => t + l.amount, 0);
  const setQty = (uid: string, qty: number) =>
    set((st) => ({ cart: qty <= 0 ? st.cart.filter((l) => l.uid !== uid) : st.cart.map((l) => (l.uid === uid ? { ...l, qty: Math.min(20, qty) } : l)) }));
  const showToast = (m: string) => { setToast(m); window.setTimeout(() => setToast(null), 2600); };

  return (
    <main data-riptide-step="restaurant" className="ff-wrap ff-rest">
      <Breadcrumbs items={[{ label: "Home", href: base }, { label: city, href: base }, { label: r.name }]} />

      <section className="ff-rest__head ff-card">
        <CoverArt art={r.art} seed={r.id} hue={r.hue} className="ff-rest__cover" />
        <div className="ff-rest__info">
          <Slot id="restaurant.header.title" as="h1" className="ff-display ff-display--sm">{r.name}</Slot>
          <p className="ff-muted">{r.tagline}</p>
          <p className="ff-rest__cuisines">{r.cuisines.join(" · ")} · {area}, {city}{r.pureVeg && <span className="ff-pill ff-pill--veg">Pure veg</span>}</p>
          <ul className="ff-rest__facts">
            <li><Rating value={r.rating} /><span>{r.ratingCount.toLocaleString("en-IN")} ratings</span></li>
            <li><Icon name="clock" size={18} /><Slot id="restaurant.info.eta" as="span">{r.eta[0]}–{r.eta[1]} min</Slot><span>delivery time</span></li>
            <li><Icon name="bag" size={18} /><Slot id="restaurant.info.cost-for-two" as="span">{formatINR(r.costForTwo)} for two</Slot><span>approx.</span></li>
          </ul>
          <Slot id="restaurant.info.fees" as="p" className="ff-rest__fees">
            Delivery {formatINR(r.deliveryFee)} · Packaging {formatINR(r.packaging)} · Platform fee {formatINR(PLATFORM_FEE)} · GST extra (5% on food)
          </Slot>
          <p className="rt-fine">{r.license}</p>
        </div>
      </section>

      <Slot id="restaurant.promo.banner" className="ff-promo" />

      <Slot id="restaurant.offers.list" as="section" aria-label="Offers" className="ff-offers">
        {offers.map((o) => (
          <div key={o.code} className="ff-offer"><Icon name="tag" size={18} /><div><strong>{o.title}</strong><span>Use {o.code} · {o.terms}</span></div></div>
        ))}
        <div className="ff-offer"><Icon name="tag" size={18} /><div><strong>₹60 off</strong><span>Use WELCOME60 · On item total of ₹249 or more.</span></div></div>
      </Slot>

      <div className="ff-rest__grid">
        <nav aria-label="Menu categories" className="ff-cats">
          <h2 className="ff-overline">Menu</h2>
          <ul>
            {r.categories.map((c) => (
              <li key={c}><a href={`#${catId(c)}`}>{c}<span>{r.items.filter((i) => i.category === c).length}</span></a></li>
            ))}
          </ul>
        </nav>

        <section aria-label="Menu" className="ff-menu">
          <div className="ff-menu__tools">
            <Slot id="restaurant.menu.search" className="ff-menu__search">
              <label htmlFor="ff-menu-q" className="sr-only">Search in menu</label>
              <Icon name="search" size={18} />
              <input id="ff-menu-q" type="search" placeholder={`Search in ${r.name}`} value={query} onChange={(e) => setQuery(e.target.value)} />
            </Slot>
            <Slot id="restaurant.menu.veg-toggle" as="button" type="button" className="ff-chip" aria-pressed={vegOnly} onClick={() => setVegOnly(!vegOnly)}>
              <VegMark veg /> Veg only
            </Slot>
          </div>

          {r.categories.map((c) => {
            const items = visible.filter((i) => i.category === c);
            if (!items.length) return null;
            return (
              <section key={c} id={catId(c)} className="ff-menu__cat" aria-labelledby={`${catId(c)}-h`}>
                <h2 id={`${catId(c)}-h`} className="ff-h2">{c} <span className="ff-count">{items.length}</span></h2>
                <ul>
                  {items.map((i) => {
                    const n = inCart(i.id);
                    return (
                      <li key={i.id} className="ff-dish" data-dp={`restaurant.menu.item.${i.id.split("--")[1]}`}>
                        <div className="ff-dish__text">
                          <div className="flex items-center gap-2">
                            <VegMark veg={i.veg} />
                            {i.bestseller && <span className="ff-pill ff-pill--best">Bestseller</span>}
                          </div>
                          <h3 className="ff-dish__name">{i.name}</h3>
                          <p className="ff-dish__price">{formatINR(i.price)}</p>
                          {i.rating && <p className="ff-dish__rating"><Rating value={i.rating} count={i.ratingCount} /></p>}
                          <p className="ff-dish__desc">{i.description}</p>
                        </div>
                        <div className="ff-dish__side">
                          <FoodArt art={i.art} seed={i.id} className="ff-dish__art" label={i.name} />
                          <SlotButton id="restaurant.item.add" variant="secondary" className="ff-dish__add" onClick={() => setOpen(i)} aria-label={`Add ${i.name}`}>Add</SlotButton>
                          <span className="ff-dish__note">{n ? `${n} in cart` : "Customisable"}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
          {visible.length === 0 && (
            <div className="ff-empty">
              <h3 className="ff-h3">No dishes match &ldquo;{query}&rdquo;</h3>
              <button type="button" className="rt-btn" data-variant="secondary" onClick={() => { setQuery(""); setVegOnly(false); }}>Show full menu</button>
            </div>
          )}

          <section aria-labelledby="ff-reviews" className="ff-reviews">
            <h2 id="ff-reviews" className="ff-h2">What diners say</h2>
            <ul>
              {r.reviews.map((rv) => (
                <li key={rv.name} className="ff-card">
                  <div className="ff-review__head"><strong>{rv.name}</strong><Rating value={rv.rating} /></div>
                  <p>{rv.text}</p>
                  <span className="rt-fine">{rv.when}</span>
                </li>
              ))}
            </ul>
          </section>
        </section>

        <Slot id="restaurant.cart.panel" as="aside" aria-label="Your cart" className="ff-card ff-drawer">
          <h2 className="ff-h3">Your cart</h2>
          {!hydrated ? (
            <><Skeleton className="h-6" /><Skeleton className="h-6" /><Skeleton className="h-11" /></>
          ) : count > 0 ? (
            <>
              <p className="ff-muted text-sm">From {r.name}</p>
              <ul className="ff-drawer__lines">
                {mine.map((l) => {
                  const it = itemByIdLookup(l.itemId)!;
                  const amt = cartPrice.lines.find((x) => x.key === `item-${l.uid}`)?.amount ?? 0;
                  return (
                    <li key={l.uid} data-dp={`restaurant.cart.line.${l.uid}`}>
                      <VegMark veg={it.veg} />
                      <div><strong>{it.name}</strong><small>{lineDetail(it, l)}</small></div>
                      <QtyStepper qty={l.qty} label={it.name} onChange={(q) => setQty(l.uid, q)} />
                      <span className="ff-drawer__amt">{formatINR(amt)}</span>
                    </li>
                  );
                })}
              </ul>
              <div className="rt-line"><span>Item total</span><span>{formatINR(itemTotal)}</span></div>
              <div className="rt-line ff-muted"><span>Fees &amp; GST</span><span>{formatINR(cartPrice.total - itemTotal)}</span></div>
              <div className="rt-line rt-line--total"><span>To pay</span><strong>{formatINR(cartPrice.total)}</strong></div>
              <Slot id="restaurant.cart.cta" as={Link} href={`${base}/cart`} className="rt-btn ff-block" variant="primary">View cart</Slot>
            </>
          ) : (
            <div className="ff-drawer__empty">
              <FoodArt art="bowl" seed="empty-cart" className="ff-drawer__art" />
              {other ? (
                <p>Your cart has items from <strong>{other.name}</strong>. <Link className="rt-link" href={`${base}/cart`}>View that cart</Link></p>
              ) : <p>Your cart is empty. Add a dish to get started.</p>}
            </div>
          )}
        </Slot>
      </div>

      {hydrated && count > 0 && (
        <div className="ff-mobilebar">
          <span>{count} item{count === 1 ? "" : "s"} · {formatINR(cartPrice.total)} incl. fees</span>
          <Link href={`${base}/cart`} className="rt-btn" data-variant="primary">View cart</Link>
        </div>
      )}
      {open && <CustomiseModal key={open.id} item={open} restaurant={r} onClose={() => setOpen(null)} onAdded={showToast} />}
      {toast && <Toast>{toast}</Toast>}
    </main>
  );
}
