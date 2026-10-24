"use client";
import { useRouter } from "next/navigation";
import { Slot, SlotButton, cn, formatINR, useFlow, useHydrated, useSession } from "@riptide/core";
import { FARES, FARE_KEYS, cityName, fmtDate, type FareKey } from "@/lib/air";
import { BookingShell, FlightLine, Loading, NeedEarlier } from "@/components/Booking";
import { Icon, ICONS } from "@/components/Chrome";
import { segmentsOf, type AirState } from "@/shop.config";

const ROWS: [keyof (typeof FARES)["saver"], string][] = [
  ["cabin", "Cabin baggage"], ["checkin", "Check-in baggage"], ["change", "Date or flight change"],
  ["cancel", "Cancellation"], ["seats", "Seat selection"], ["meal", "Meals"],
];

export default function Fare() {
  const [st, set] = useSession<AirState>();
  const hydrated = useHydrated();
  const router = useRouter();
  const flow = useFlow("purchase");
  if (!hydrated) return <Loading step="fare" />;
  const segs = segmentsOf(st);
  if (!segs.length) return <NeedEarlier step="fare" what="Choose a flight first" href={flow.href("results")} />;
  const fare = st.fare ?? "saver";
  const perPax = (k: FareKey) => segs.reduce((t, [, f]) => t + f.fares[k], 0);
  const choose = (k: FareKey) => set({ fare: k });

  return (
    <BookingShell step="fare">
      <header className="sk-pagehead">
        <h1 className="sk-h1">Choose your fare family</h1>
        <p className="sk-muted">One fare family applies to every flight in this booking. Compare what each one includes; you can change it here until you pay.</p>
      </header>
      <div className="sk-card sk-itin-mini">
        {segs.map(([seg, f]) => (
          <div key={seg}>
            <p className="sk-eyebrow">{seg === "out" ? "Outbound" : "Return"} · {fmtDate(f.date)} · <span className="sk-mono">{f.number}</span></p>
            <FlightLine f={f} compact />
          </div>
        ))}
      </div>
      <Slot id="fare.family.list" as="div" className="sk-fares">
        {FARE_KEYS.map((k) => {
          const F = FARES[k], on = fare === k, diff = perPax(k) - perPax(fare);
          return (
            <Slot key={k} id={`fare.family.${k}`} as="section" className={cn("sk-card sk-fare", on && "is-on")} aria-label={`${F.name} fare`}>
              <header>
                <h2 className="sk-fare__name">{F.name}</h2>
                <p className="sk-muted">{F.blurb}</p>
                <p className="sk-fare__price"><strong>{formatINR(perPax(k))}</strong> <span>per traveller{segs.length > 1 ? `, ${segs.length} flights` : ""}, before taxes</span></p>
                {!on && <p className="sk-fine">{diff > 0 ? `${formatINR(diff)} more` : `${formatINR(-diff)} less`} per traveller than {FARES[fare].name}</p>}
              </header>
              <dl>
                {ROWS.map(([key, label]) => (
                  <div key={key}><dt>{label}</dt><dd>{F[key]}</dd></div>
                ))}
              </dl>
              <button type="button" className="rt-btn sk-fare__btn" data-variant="secondary" aria-pressed={on} onClick={() => choose(k)}>
                {on ? <><Icon d={ICONS.check} /> {F.name} selected</> : `Select ${F.name}`}
              </button>
            </Slot>
          );
        })}
      </Slot>
      <p className="sk-fine">Change and cancellation fees are charged per traveller per flight. Taxes are always refunded on cancellation. The ₹275 convenience fee is not refundable. Full details: Fare rules and Cancellation &amp; refunds in the footer.</p>
      <div className="sk-actions">
        <span className="sk-muted">{FARES[fare].name} · {segs.map(([, f]) => `${cityName(f.from)} → ${cityName(f.to)}`).join(", ")}</span>
        <SlotButton id="fare.cta.continue" variant="primary" onClick={() => router.push(flow.next("fare"))}>Continue</SlotButton>
      </div>
    </BookingShell>
  );
}
