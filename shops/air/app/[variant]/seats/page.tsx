"use client";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { Slot, SlotButton, cn, formatINR, useFlow, useHydrated, useSession } from "@riptide/core";
import { EXIT_ROWS, FARES, LETTERS, ROWS, SEAT_BANDS, cityName, occupiedSeats, seatBand, seatPrice, type SeatBand } from "@/lib/air";
import { BookingShell, Loading, NeedEarlier } from "@/components/Booking";
import { paxCount, segmentsOf, type AirState, type Segment } from "@/shop.config";

const BANDS: SeatBand[] = ["xl", "front", "standard", "free"];

export default function Seats() {
  const [st, set] = useSession<AirState>();
  const hydrated = useHydrated();
  const router = useRouter();
  const flow = useFlow("purchase");
  const [segSel, setSeg] = useState<Segment>("out");
  const [who, setWho] = useState(0);
  if (!hydrated) return <Loading step="seats" />;
  const segs = segmentsOf(st);
  if (!segs.length) return <NeedEarlier step="seats" what="Choose a flight first" href={flow.href("results")} />;
  const n = paxCount(st.search);
  const fare = st.fare ?? "saver";
  const [seg, f] = segs.find(([s]) => s === segSel) ?? segs[0];
  const taken = occupiedSeats(f.id);
  const mine = new Map(Array.from({ length: n }, (_, i) => [st.seats[`${seg}:${i}`], i] as const).filter(([s]) => s));
  const name = (i: number) => st.pax[i]?.first || `Traveller ${i + 1}`;

  const toggle = (seat: string) => {
    const key = `${seg}:${who}`;
    const seats = { ...st.seats };
    if (seats[key] === seat) delete seats[key];
    else seats[key] = seat;
    set({ seats });
    const nextFree = Array.from({ length: n }, (_, i) => i).find((i) => i !== who && !seats[`${seg}:${i}`]);
    if (seats[key] && nextFree !== undefined) setWho(nextFree);
  };
  const skip = () => { set({ seats: {} }); router.push(flow.next("seats")); };

  return (
    <BookingShell step="seats">
      <header className="sk-pagehead">
        <h1 className="sk-h1">Choose seats</h1>
        <p className="sk-muted">Optional. Free seats are marked on the map. If you skip, we assign free seats at check-in, keeping your group together where we can.</p>
      </header>

      {segs.length > 1 && (
        <div className="sk-seg" role="tablist" aria-label="Flight">
          {segs.map(([s, fl]) => (
            <button key={s} type="button" role="tab" aria-selected={s === seg} className={cn(s === seg && "is-on")} onClick={() => setSeg(s)}>
              {cityName(fl.from)} → {cityName(fl.to)}
            </button>
          ))}
        </div>
      )}

      <div className="sk-seatwrap">
        <div className="sk-seatside">
          <div className="sk-card">
            <h2 className="sk-h3">Who is choosing?</h2>
            <ul className="sk-whos">
              {Array.from({ length: n }, (_, i) => {
                const seat = st.seats[`${seg}:${i}`];
                return (
                  <li key={i}>
                    <button type="button" className={cn("sk-who", who === i && "is-on")} aria-pressed={who === i} onClick={() => setWho(i)}>
                      <span>{name(i)}</span>
                      <small>{seat ? `${seat} · ${seatPrice(seat, fare) ? formatINR(seatPrice(seat, fare)) : "Free"}` : "No seat yet"}</small>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          <Slot id="seats.legend.panel" as="section" className="sk-card sk-legend" aria-label="Seat legend">
            <h2 className="sk-h3">Seat prices · {FARES[fare].name}</h2>
            <ul>
              {BANDS.map((b) => {
                const p = b === "free" ? 0 : seatPrice(b === "xl" ? "1A" : b === "front" ? "2A" : "6A", fare);
                return (
                  <li key={b}>
                    <i className={`sk-seat sk-seat--${b}`} aria-hidden />
                    <span>{SEAT_BANDS[b].label}<small>{SEAT_BANDS[b].where}</small></span>
                    <strong>{p ? formatINR(p) : b === "free" ? "Free" : `Included in ${FARES[fare].name}`}</strong>
                  </li>
                );
              })}
              <li><i className="sk-seat sk-seat--taken" aria-hidden /><span>Occupied</span><strong /></li>
              <li><i className="sk-seat sk-seat--mine" aria-hidden /><span>Your selection</span><strong /></li>
            </ul>
            <p className="sk-fine">Prices are per seat, per flight, incl. GST. Exit rows 12–13 are for adults able to assist in an evacuation.</p>
          </Slot>
        </div>

        <div className="sk-card sk-cabin" aria-label={`Seat map for ${f.number}, ${cityName(f.from)} to ${cityName(f.to)}`}>
          <p className="sk-cabin__nose">Front of aircraft · {f.aircraft} · <span className="sk-mono">{f.number}</span></p>
          <div className="sk-cabin__grid" role="grid">
            <div className="sk-cabin__row sk-cabin__hdr" role="row">
              <span />{LETTERS.map((l, k) => <Fragment key={l}>{k === 3 && <span />}<span role="columnheader">{l}</span></Fragment>)}
            </div>
            {Array.from({ length: ROWS }, (_, r) => r + 1).map((row) => (
              <div key={row} className={cn("sk-cabin__row", EXIT_ROWS.includes(row) && "is-exit")} role="row">
                <span className="sk-cabin__num" role="rowheader">{row}</span>
                {LETTERS.map((l, k) => {
                  const seat = `${row}${l}`, band = seatBand(seat), price = seatPrice(seat, fare);
                  const isTaken = taken.has(seat) && !mine.has(seat);
                  const owner = mine.get(seat);
                  const label = `Seat ${seat}, ${SEAT_BANDS[band].label}, ${isTaken ? "occupied" : price ? formatINR(price) : "free"}${owner !== undefined ? `, selected for ${name(owner)}` : ""}`;
                  return (
                    <Fragment key={seat}>
                      {k === 3 && <span className="sk-cabin__aisle" aria-hidden>{row}</span>}
                      <Slot id={`seats.map.${band}`} as="button" type="button" data-seat={seat} role="gridcell"
                        className={cn("sk-seat", `sk-seat--${band}`, isTaken && "sk-seat--taken", owner !== undefined && "sk-seat--mine")}
                        disabled={isTaken || (owner !== undefined && owner !== who)} aria-label={label} title={label} onClick={() => toggle(seat)}>
                        {owner !== undefined ? owner + 1 : ""}
                      </Slot>
                    </Fragment>
                  );
                })}
              </div>
            ))}
          </div>
          <p className="sk-cabin__nose">Rear of aircraft</p>
        </div>
      </div>

      <div className="sk-actions sk-actions--pair">
        <SlotButton id="seats.skip.button" variant="secondary" onClick={skip}>Skip seat selection</SlotButton>
        <SlotButton id="seats.cta.continue" variant="secondary" onClick={() => router.push(flow.next("seats"))}>Continue</SlotButton>
      </div>
    </BookingShell>
  );
}
