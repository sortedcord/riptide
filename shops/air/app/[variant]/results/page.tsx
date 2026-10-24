"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Slot, SlotButton, cn, computePrice, formatINR, useFlow, useHydrated, useRiptide, useSession, useSlotDefault } from "@riptide/core";
import { FARES, FARE_KEYS, addDays, cityName, fmtDate, flightsFor, type FareKey, type Flight } from "@/lib/air";
import { BookingShell, FlightLine, Loading, NeedEarlier, useToday } from "@/components/Booking";
import { config, paxCount, type AirState, type Segment } from "@/shop.config";

type Sort = "price" | "departure" | "duration";
const SORTS: [Sort, string][] = [["price", "Cheapest"], ["departure", "Earliest departure"], ["duration", "Shortest"]];

export default function Results() {
  const [st, set] = useSession<AirState>();
  const hydrated = useHydrated();
  const router = useRouter();
  const flow = useFlow("purchase");
  const sortDefault = useSlotDefault<string>("results.sort.selector", "price");
  const [sort, setSort] = useState<Sort>(SORTS.some(([k]) => k === sortDefault) ? (sortDefault as Sort) : "price");
  const [nonstop, setNonstop] = useState(false);
  if (!hydrated) return <Loading step="results" />;
  const s = st.search;
  if (!s?.from || !s.to || !s.date) return <NeedEarlier step="results" what="Start with a flight search" href={flow.href("")} />;
  const round = s.trip === "round" && !!s.returnDate;
  const ready = !!st.out && (!round || !!st.ret);
  const n = paxCount(s);

  const pick = (seg: Segment, f: Flight, fare: FareKey) => set({ [seg]: f, fare, seats: {} });
  const legs: [Segment, string, string, string][] = [["out", s.from, s.to, s.date]];
  if (round) legs.push(["ret", s.to, s.from, s.returnDate]);

  return (
    <BookingShell step="results">
      <header className="sk-pagehead">
        <h1 className="sk-h1">{cityName(s.from)} → {cityName(s.to)}{round && " and back"}</h1>
        <p className="sk-muted">{fmtDate(s.date)}{round && ` – ${fmtDate(s.returnDate)}`} · {n} traveller{n > 1 ? "s" : ""} · Economy</p>
        <Slot id="results.notice.fees" as="p" className="sk-notice">
          Fares are per traveller before taxes. Taxes &amp; airport charges and a ₹275 convenience fee per traveller per flight are added in the fare summary.
        </Slot>
      </header>
      <div className="sk-toolbar">
        <Slot id="results.sort.selector" as="div" role="radiogroup" aria-label="Sort flights" className="sk-seg">
          {SORTS.map(([k, label]) => (
            <button key={k} type="button" role="radio" aria-checked={sort === k} className={cn(sort === k && "is-on")} onClick={() => setSort(k)}>{label}</button>
          ))}
        </Slot>
        <label className="rt-check"><input type="checkbox" checked={nonstop} onChange={(e) => setNonstop(e.target.checked)} /> <span>Non-stop only</span></label>
      </div>
      {legs.map(([seg, from, to, date]) => (
        <Leg key={seg} seg={seg} from={from} to={to} date={date} sort={sort} nonstop={nonstop} st={st} onPick={pick}
          onDate={(d) => set({ search: { ...s, [seg === "out" ? "date" : "returnDate"]: d }, [seg]: undefined, seats: {} })} />
      ))}
      <div className="sk-actions">
        {!ready && <p className="sk-muted">{round ? "Choose an outbound and a return flight to continue." : "Choose a fare on a flight to continue."}</p>}
        <SlotButton id="results.cta.continue" variant="primary" disabled={!ready} onClick={() => router.push(flow.next("results"))}>Continue</SlotButton>
      </div>
    </BookingShell>
  );
}

function Leg({ seg, from, to, date, sort, nonstop, st, onPick, onDate }: {
  seg: Segment; from: string; to: string; date: string; sort: Sort; nonstop: boolean; st: AirState;
  onPick: (seg: Segment, f: Flight, fare: FareKey) => void; onDate: (d: string) => void;
}) {
  const { manifest } = useRiptide();
  const today = useToday();
  const all = flightsFor(from, to, date);
  const list = all.filter((f) => !nonstop || !f.stops).sort((a, b) =>
    sort === "price" ? a.fares.saver - b.fares.saver : sort === "duration" ? a.duration - b.duration : a.dep - b.dep);
  const chosen = st[seg];
  const n = paxCount(st.search);
  /** Engine total for one flight on its own, so the card can state the all-in price for this flight. */
  const allIn = (f: Flight, fare: FareKey) =>
    computePrice(config, { ...st, out: f, ret: undefined, fare, seats: {}, selected: {} }, manifest.overrides, "results").total;
  const days = [-3, -2, -1, 0, 1, 2, 3].map((d) => addDays(date, d)).filter((d) => !today || d >= today);
  return (
    <section className="sk-leg" aria-label={`${seg === "out" ? "Outbound" : "Return"} flights`}>
      <h2 className="sk-h2">{seg === "out" ? "Outbound" : "Return"} · {cityName(from)} → {cityName(to)}</h2>
      <div className="sk-days" role="list" aria-label="Nearby dates">
        {days.map((d) => {
          const min = Math.min(...flightsFor(from, to, d).map((f) => f.fares.saver));
          return (
            <button key={d} type="button" role="listitem" className={cn("sk-day", d === date && "is-on")} aria-current={d === date ? "date" : undefined} onClick={() => onDate(d)}>
              <span>{fmtDate(d)}</span><small>from {formatINR(min)}</small>
            </button>
          );
        })}
      </div>
      {!list.length ? (
        <div className="sk-card sk-empty"><p>No non-stop flights on this date. Turn off “Non-stop only” to see connecting flights.</p></div>
      ) : (
        <ul className="sk-flights">
          {list.map((f) => (
            <li key={f.id} data-dp={`results.flight.${f.number.replace(" ", "").toLowerCase()}`} className={cn("sk-card sk-flight", chosen?.id === f.id && "is-chosen")}>
              <div className="sk-flight__info">
                <div className="sk-flight__meta"><span className="sk-mono">{f.number}</span> · {f.aircraft}</div>
                <FlightLine f={f} />
              </div>
              <div className="sk-flight__fares" role="group" aria-label={`Fares for ${f.number}`}>
                {FARE_KEYS.map((k) => {
                  const on = chosen?.id === f.id && st.fare === k;
                  return (
                    <button key={k} type="button" className={cn("sk-farebtn", on && "is-on")} aria-pressed={on} onClick={() => onPick(seg, f, k)}
                      aria-label={`Select ${FARES[k].name} on ${f.number}, ${formatINR(f.fares[k])} per traveller before taxes`}>
                      <span>{FARES[k].name}</span>
                      <strong>{formatINR(f.fares[k])}</strong>
                      <small>{FARES[k].checkinKg} kg</small>
                    </button>
                  );
                })}
              </div>
              <p className="sk-flight__allin">
                Saver all-in for {n} traveller{n > 1 ? "s" : ""}: <strong>{formatINR(allIn(f, "saver"))}</strong> incl. taxes &amp; convenience fee
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
