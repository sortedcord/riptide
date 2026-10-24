"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Slot, SlotButton, cn, useFlow, useHydrated, useSession, useSlotDefault } from "@riptide/core";
import { CITIES, addDays, cityById, distanceKm, dur, type City } from "@/lib/air";
import { useToday } from "@/components/Booking";
import { Icon, ICONS } from "@/components/Chrome";
import type { AirState, Search } from "@/shop.config";

const POPULAR: [string, string][] = [
  ["delhi", "mumbai"], ["bengaluru", "delhi"], ["mumbai", "goa"], ["hyderabad", "chennai"],
  ["kolkata", "bengaluru"], ["pune", "jaipur"], ["ahmedabad", "kochi"], ["lucknow", "mumbai"], ["guwahati", "delhi"],
];

const FAQ = [
  ["What does the price on the results page include?", "The fare shown on each flight is the base fare per traveller. The fare summary beside it adds GST, airport charges and a ₹275 convenience fee per traveller per flight, so you see the full total before you enter any details."],
  ["Is seat selection mandatory?", "No. You can skip it and we assign a free seat at check-in. Free seats are always available to choose on the seat map too."],
  ["Are any add-ons pre-selected?", "No. Extra baggage, meals and insurance are all optional and start unselected."],
  ["Can I cancel?", "Yes. Each fare family has a fixed cancellation fee; the rest of the base fare and all taxes are refunded to your original payment method within 7 working days."],
];

export default function SearchPage() {
  const [st, set] = useSession<AirState>();
  const router = useRouter();
  const flow = useFlow("purchase");
  const today = useToday();
  const hydrated = useHydrated();
  const tripDefault = useSlotDefault<string>("search.form.trip", "oneway");
  const s: Search = st.search ?? { trip: tripDefault === "round" ? "round" : "oneway", from: "", to: "", date: "", returnDate: "", adults: 1, children: 0 };
  const date = s.date || (today && addDays(today, 1));
  const returnDate = s.returnDate || (date && addDays(date, 3));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const upd = (p: Partial<Search>) => set({ search: { ...s, ...p } });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!s.from) err.from = "Choose where you're flying from.";
    if (!s.to) err.to = "Choose where you're flying to.";
    if (s.from && s.from === s.to) err.to = "Departure and arrival cities must be different.";
    if (!date || (today && date < today)) err.date = "Choose a departure date from today onwards.";
    if (s.trip === "round" && (!returnDate || returnDate < date)) err.returnDate = "Return date must be on or after the departure date.";
    setErrors(err);
    if (Object.keys(err).length) return;
    set({ search: { ...s, date, returnDate: s.trip === "round" ? returnDate : "" }, out: undefined, ret: undefined, seats: {} });
    router.push(flow.next("search"));
  }

  return (
    <main data-riptide-step="search" className="sk-home">
      <section className="sk-hero">
        <div className="sk-hero__in">
          <Slot id="search.hero.title" as="h1" className="sk-hero__title">Fly across India with the fare and every fee upfront.</Slot>
          <Slot id="search.hero.subtitle" as="p" className="sk-hero__sub">13 cities, A320 family jets, and a fare summary that never surprises you.</Slot>
          <Slot id="search.promo.banner" className="sk-promo" />
          <form className="sk-search" onSubmit={submit} noValidate aria-label="Search flights">
            <Slot id="search.form.trip" as="fieldset" className="sk-trip">
              <legend className="sr-only">Trip type</legend>
              {(["oneway", "round"] as const).map((t) => (
                <label key={t} className={cn("sk-pill", s.trip === t && "is-on")}>
                  <input type="radio" name="trip" value={t} checked={s.trip === t} onChange={() => upd({ trip: t })} />
                  {t === "oneway" ? "One way" : "Round trip"}
                </label>
              ))}
            </Slot>
            <div className="sk-search__row">
              <CityField id="from" label="From" value={s.from} onPick={(from) => upd({ from })} error={errors.from} />
              <button type="button" className="sk-swap" aria-label="Swap from and to cities" onClick={() => upd({ from: s.to, to: s.from })}>
                <Icon d={ICONS.swap} />
              </button>
              <CityField id="to" label="To" value={s.to} onPick={(to) => upd({ to })} error={errors.to} exclude={s.from} />
              <div className="sk-field">
                <label htmlFor="date">Departure</label>
                <input id="date" type="date" className="rt-input" min={today || undefined} value={hydrated ? date : ""} onChange={(e) => upd({ date: e.target.value })} />
                {errors.date && <p className="sk-err" role="alert">{errors.date}</p>}
              </div>
              {s.trip === "round" && (
                <div className="sk-field">
                  <label htmlFor="returnDate">Return</label>
                  <input id="returnDate" type="date" className="rt-input" min={date || undefined} value={hydrated ? returnDate : ""} onChange={(e) => upd({ returnDate: e.target.value })} />
                  {errors.returnDate && <p className="sk-err" role="alert">{errors.returnDate}</p>}
                </div>
              )}
              <fieldset className="sk-field sk-paxsel">
                <legend>Travellers</legend>
                <Counter label="Adults" hint="12+ yrs" value={s.adults} min={1} max={9 - s.children} onChange={(adults) => upd({ adults })} />
                <Counter label="Children" hint="2–11 yrs" value={s.children} min={0} max={Math.min(8, 9 - s.adults)} onChange={(children) => upd({ children })} />
              </fieldset>
            </div>
            <div className="sk-search__foot">
              <p className="sk-muted">Economy · up to 9 travellers per booking · infants not bookable online in this sandbox</p>
              <SlotButton id="search.cta.search" as="button" type="submit" variant="primary" className="sk-search__btn">Search flights</SlotButton>
            </div>
          </form>
        </div>
      </section>

      <section className="sk-section">
        <h2 className="sk-h2">Popular routes</h2>
        <ul className="sk-routes">
          {POPULAR.map(([a, b]) => {
            const ca = cityById(a)!, cb = cityById(b)!;
            return (
              <li key={a + b}>
                <button type="button" className="sk-route" onClick={() => { upd({ from: a, to: b }); setErrors({}); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                  <span className="sk-route__cities">{ca.name} <span aria-hidden>→</span> {cb.name}</span>
                  <span className="sk-muted">{distanceKm(ca, cb).toLocaleString("en-IN")} km · about {dur(Math.round((distanceKm(ca, cb) / 760) * 60 / 5) * 5 + 35)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="sk-section sk-promise">
        {[
          [ICONS.ticket, "One price, shown early", "Taxes and our convenience fee appear in the fare summary from the first flight you pick."],
          [ICONS.seat, "Free seats, always", "Middle seats and every seat from row 16 are free. Skipping seat selection is fine too."],
          [ICONS.shield, "Nothing pre-ticked", "Baggage, meals and insurance are optional and start unselected."],
          [ICONS.bag, "Clear baggage", "15, 20 or 25 kg check-in depending on fare family, stated before you choose."],
        ].map(([d, t, b]) => (
          <div key={t} className="sk-card sk-promise__item">
            <span className="sk-promise__icon"><Icon d={d} size={22} /></span>
            <h3>{t}</h3>
            <p className="sk-muted">{b}</p>
          </div>
        ))}
      </section>

      <section className="sk-section">
        <h2 className="sk-h2">Questions before you book</h2>
        <div className="sk-faq">
          {FAQ.map(([q, a]) => (
            <details key={q} className="sk-card">
              <summary>{q}</summary>
              <p className="sk-muted">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}

function CityField({ id, label, value, onPick, error, exclude }: { id: string; label: string; value: string; onPick: (id: string) => void; error?: string; exclude?: string }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const city = cityById(value);
  const ql = q.trim().toLowerCase();
  const list = CITIES.filter((c: City) => c.id !== exclude && (!ql || `${c.name} ${c.airport} ${c.state}`.toLowerCase().includes(ql)));
  return (
    <div className="sk-field sk-city" onKeyDown={(e) => { if (e.key === "Escape") setOpen(false); }}>
      <label htmlFor={id}>{label}</label>
      <button id={id} type="button" className={cn("sk-city__btn", error && "is-err")} aria-expanded={open} aria-controls={`${id}-list`} onClick={() => setOpen(!open)}>
        <strong>{city ? city.name : "Select city"}</strong>
        <small>{city ? `${city.airport}, ${city.terminal}` : "Tap to choose"}</small>
      </button>
      {error && <p className="sk-err" role="alert">{error}</p>}
      {open && (
        <div className="sk-city__pop" id={`${id}-list`}>
          <div className="sk-city__head">
            <input className="rt-input" aria-label={`Filter ${label.toLowerCase()} cities`} placeholder="Type to filter (optional)" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
            <button type="button" className="sk-x" aria-label="Close city list" onClick={() => setOpen(false)}>×</button>
          </div>
          <ul>
            {list.map((c) => (
              <li key={c.id}>
                <button type="button" onClick={() => { onPick(c.id); setOpen(false); setQ(""); }} aria-label={`${label}: ${c.name}`}>
                  <span>{c.name}<small>{c.airport}</small></span><span className="sk-muted">{c.state}</span>
                </button>
              </li>
            ))}
            {!list.length && <li className="sk-muted sk-city__none">No Skyline Air city matches “{q}”.</li>}
          </ul>
        </div>
      )}
    </div>
  );
}

function Counter({ label, hint, value, min, max, onChange }: { label: string; hint: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <div className="sk-counter">
      <span>{label}<small>{hint}</small></span>
      <button type="button" aria-label={`Fewer ${label.toLowerCase()}`} disabled={value <= min} onClick={() => onChange(value - 1)}>−</button>
      <output aria-live="polite" aria-label={`${label}: ${value}`}>{value}</output>
      <button type="button" aria-label={`More ${label.toLowerCase()}`} disabled={value >= max} onClick={() => onChange(value + 1)}>+</button>
    </div>
  );
}

