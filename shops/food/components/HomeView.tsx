"use client";
import Link from "next/link";
import { useState } from "react";
import { Slot, formatINR, useHydrated, useRiptide, useSession, useSlotDefault } from "@riptide/core";
import { CUISINES, cuisineArt, restaurants, type Restaurant } from "@/data/restaurants";
import { CITIES, restaurantOffers } from "@/data/profile";
import type { FoodState } from "@/shop.config";
import { CoverArt, FoodArt } from "./FoodArt";
import { Icon, Rating } from "./ui";

export const areaOf = (r: Restaurant, city: string | null) => {
  const c = city && CITIES[city] ? city : "Bengaluru";
  return { area: CITIES[c][r.areaIndex % CITIES[c].length], city: c };
};

type Sort = "relevance" | "rating" | "eta" | "cost-low" | "cost-high";
const SORTS: { id: Sort; label: string }[] = [
  { id: "relevance", label: "Relevance" },
  { id: "rating", label: "Rating: high to low" },
  { id: "eta", label: "Delivery time" },
  { id: "cost-low", label: "Cost for two: low to high" },
  { id: "cost-high", label: "Cost for two: high to low" },
];

export function HomeView({ q, offers: offersParam, cuisine: cuisineParam }: { q: string; offers: boolean; cuisine: string | null }) {
  const { base } = useRiptide();
  const [s] = useSession<FoodState>();
  const hydrated = useHydrated();
  const [veg, setVeg] = useState(useSlotDefault<boolean>("home.filters.veg", false));
  const [rating, setRating] = useState(useSlotDefault<boolean>("home.filters.rating", false));
  const [fast, setFast] = useState(useSlotDefault<boolean>("home.filters.fast", false));
  const [offers, setOffers] = useState(useSlotDefault<boolean>("home.filters.offers", offersParam) || offersParam);
  const [sort, setSort] = useState<Sort>(useSlotDefault<string>("home.sort.selector", "relevance") as Sort);
  const [cuisine, setCuisine] = useState<string | null>(cuisineParam);

  const query = q.trim().toLowerCase();
  const dishHits = (r: Restaurant) => (query ? r.items.filter((i) => i.name.toLowerCase().includes(query)) : []);
  let list = restaurants.filter((r) =>
    (!veg || r.pureVeg) && (!rating || r.rating >= 4) && (!fast || r.eta[1] <= 30) && (!offers || restaurantOffers(r.id).length > 0) &&
    (!cuisine || r.cuisines.some((c) => c.toLowerCase().includes(cuisine.toLowerCase().split(" ")[0]))) &&
    (!query || r.name.toLowerCase().includes(query) || r.cuisines.some((c) => c.toLowerCase().includes(query)) || dishHits(r).length > 0));
  const sorters: Record<Sort, (a: Restaurant, b: Restaurant) => number> = {
    relevance: () => 0,
    rating: (a, b) => b.rating - a.rating,
    eta: (a, b) => a.eta[0] - b.eta[0],
    "cost-low": (a, b) => a.costForTwo - b.costForTwo,
    "cost-high": (a, b) => b.costForTwo - a.costForTwo,
  };
  list = [...list].sort(sorters[sort]);
  const anyFilter = veg || rating || fast || offers || cuisine || query;
  const clear = () => { setVeg(false); setRating(false); setFast(false); setOffers(false); setCuisine(null); };
  const city = hydrated ? s.city : null;

  return (
    <main data-riptide-step="home" className="ff-wrap ff-home">
      <section className="ff-hero">
        <div className="ff-hero__text">
          <Slot id="home.hero.title" as="h1" className="ff-display">Good food from neighbourhood kitchens.</Slot>
          <Slot id="home.hero.subtitle" as="p" className="ff-hero__sub">Fees are shown upfront on every restaurant. No surprises at checkout.</Slot>
          <div className="ff-hero__loc">
            {hydrated && !s.city ? (
              <>
                <span>Choose where you&apos;d like your food delivered.</span>
                <Link href={`${base}/location`} className="rt-btn" data-variant="primary"><Icon name="pin" size={18} /> Set delivery location</Link>
              </>
            ) : (
              <span><Icon name="pin" size={16} /> Showing kitchens delivering in <strong>{city ?? "Bengaluru"}</strong> · <Link className="rt-link" href={`${base}/location`}>Change</Link></span>
            )}
          </div>
        </div>
        <div className="ff-hero__art" aria-hidden>
          <FoodArt art="rice" seed="hero-1" className="ff-hero__plate ff-hero__plate--a" bare />
          <FoodArt art="dosa" seed="hero-2" className="ff-hero__plate ff-hero__plate--b" bare />
          <FoodArt art="pizza" seed="hero-3" className="ff-hero__plate ff-hero__plate--c" bare />
        </div>
      </section>

      <Slot id="home.promo.banner" className="ff-promo" />

      <section aria-labelledby="ff-cuisines">
        <h2 id="ff-cuisines" className="ff-h2">What&apos;s on your mind?</h2>
        <Slot id="home.cuisines.carousel" role="group" aria-label="Cuisines" className="ff-cuisines">
          {CUISINES.map((c) => (
            <button key={c} type="button" className="ff-cuisine" aria-pressed={cuisine === c} onClick={() => setCuisine(cuisine === c ? null : c)}>
              <FoodArt art={cuisineArt[c]} seed={`cuisine-${c}`} className="ff-cuisine__art" />
              <span>{c}</span>
            </button>
          ))}
        </Slot>
      </section>

      <section aria-labelledby="ff-list-title" className="ff-listing">
        <div className="ff-listing__head">
          <h2 id="ff-list-title" className="ff-h2">
            {query ? <>Results for &ldquo;{q}&rdquo;</> : cuisine ? `${cuisine} near you` : "Restaurants near you"}
            <span className="ff-count">{list.length} {list.length === 1 ? "restaurant" : "restaurants"}</span>
          </h2>
          <Slot id="home.sort.selector" className="ff-sort">
            <label htmlFor="ff-sort">Sort by</label>
            <select id="ff-sort" className="rt-input" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              {SORTS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </Slot>
        </div>
        <Slot id="home.filters.bar" role="group" aria-label="Filters" className="ff-filters">
          <Slot id="home.filters.veg" as="button" type="button" className="ff-chip" aria-pressed={veg} onClick={() => setVeg(!veg)}>Pure veg</Slot>
          <Slot id="home.filters.rating" as="button" type="button" className="ff-chip" aria-pressed={rating} onClick={() => setRating(!rating)}>Rating 4.0+</Slot>
          <Slot id="home.filters.fast" as="button" type="button" className="ff-chip" aria-pressed={fast} onClick={() => setFast(!fast)}>Under 30 min</Slot>
          <Slot id="home.filters.offers" as="button" type="button" className="ff-chip" aria-pressed={offers} onClick={() => setOffers(!offers)}>Offers</Slot>
          {anyFilter && <button type="button" className="rt-btn" data-variant="link" onClick={clear}>Clear filters</button>}
        </Slot>

        <Slot id="home.restaurants.list" as="ul" className="ff-grid">
          {list.map((r) => {
            const { area } = areaOf(r, city);
            const offer = restaurantOffers(r.id)[0];
            const hits = dishHits(r);
            return (
              <li key={r.id} data-dp={`home.list.card.${r.id}`}>
                <Link href={`${base}/restaurant/${r.id}`} className="ff-rcard">
                  <div className="ff-rcard__media">
                    <CoverArt art={r.art} seed={r.id} hue={r.hue} />
                    {offer && <span className="ff-rcard__offer"><Icon name="tag" size={14} /> {offer.title} · {offer.code}</span>}
                  </div>
                  <div className="ff-rcard__body">
                    <div className="ff-rcard__row">
                      <h3 className="ff-rcard__name">{r.name}</h3>
                      <Rating value={r.rating} />
                    </div>
                    <p className="ff-rcard__meta">{r.cuisines.join(", ")}</p>
                    <p className="ff-rcard__meta">{area} · {r.eta[0]}–{r.eta[1]} min · {formatINR(r.costForTwo)} for two</p>
                    <p className="ff-rcard__fee"><Icon name="scooter" size={14} /> {formatINR(r.deliveryFee)} delivery{r.pureVeg && <span className="ff-pill ff-pill--veg">Pure veg</span>}</p>
                    {hits.length > 0 && <p className="ff-rcard__hits">{hits.length} matching {hits.length === 1 ? "dish" : "dishes"}: {hits.slice(0, 2).map((h) => h.name).join(", ")}</p>}
                  </div>
                </Link>
              </li>
            );
          })}
        </Slot>
        {list.length === 0 && (
          <div className="ff-empty">
            <FoodArt art="bowl" seed="empty" className="ff-empty__art" />
            <h3 className="ff-h3">No restaurants match</h3>
            <p>Try removing a filter or searching for something else.</p>
            <button type="button" className="rt-btn" data-variant="secondary" onClick={clear}>Clear filters</button>
          </div>
        )}
      </section>
    </main>
  );
}
