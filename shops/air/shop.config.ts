import type { LineItem, ShopConfig } from "@riptide/core";
import { ADDONS, FARES, RATES, cityName, seatPrice, type FareKey, type Flight } from "./lib/air";
import { registry } from "./slots";

export type Search = { trip: "oneway" | "round"; from: string; to: string; date: string; returnDate: string; adults: number; children: number };
export type Pax = { type: "adult" | "child"; title: string; first: string; last: string; dob?: string };
export type Segment = "out" | "ret";

export type AirState = {
  search?: Search;
  out?: Flight;
  ret?: Flight;
  fare?: FareKey;
  pax: Pax[];
  contact?: { email: string; phone: string };
  optin?: boolean;
  /** `${segment}:${paxIndex}` → seat id, e.g. "out:0" → "14C" */
  seats: Record<string, string>;
  selected?: Record<string, boolean>;
};

export const paxCount = (s?: Search) => (s ? s.adults + s.children : 0);
export const segmentsOf = (st: AirState): [Segment, Flight][] =>
  ([["out", st.out], ["ret", st.ret]] as [Segment, Flight | undefined][]).filter((x): x is [Segment, Flight] => !!x[1]);

const L = (l: Omit<LineItem, "optional" | "selected"> & { optional?: boolean }): LineItem => ({ optional: false, selected: !l.optional, ...l });
const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export const config: ShopConfig<AirState> = {
  shop: "air",
  steps: ["search", "results", "fare", "passengers", "seats", "addons", "review", "account", "policies", "payment"],
  flows: {
    purchase: [
      { step: "search", path: "" },
      { step: "results", path: "results" },
      { step: "fare", path: "fare" },
      { step: "passengers", path: "passengers" },
      { step: "seats", path: "seats" },
      { step: "addons", path: "addons" },
      { step: "review", path: "review" },
      { step: "payment", path: "payment" },
    ],
  },
  registry,
  initialState: { pax: [], seats: {} },
  buildLines(st) {
    const n = paxCount(st.search);
    const segs = segmentsOf(st);
    if (!n || !segs.length) return [];
    const fare = st.fare ?? "saver";
    const lines: LineItem[] = segs.map(([seg, f]) => L({
      key: `fare-${seg}`, kind: "item", visibleFromStep: "results", amount: f.fares[fare] * n,
      label: `${cityName(f.from)} → ${cityName(f.to)} · ${FARES[fare].name}`, detail: `${n} × ${inr(f.fares[fare])} base fare · ${f.number}`,
    }));
    const base = segs.reduce((t, [, f]) => t + f.fares[fare] * n, 0);
    lines.push(
      L({ key: "taxes", kind: "tax", visibleFromStep: "results", amount: Math.round(base * RATES.gst) + RATES.airport * n * segs.length,
        label: "Taxes & airport charges", detail: `GST 5% on base fare + ${inr(RATES.airport)} airport charges per traveller per flight` }),
      L({ key: "convenience", kind: "fee", visibleFromStep: "results", amount: RATES.convenience * n * segs.length,
        label: "Convenience fee", detail: `${inr(RATES.convenience)} per traveller per flight` }),
    );
    for (const [seg, f] of segs) {
      for (let i = 0; i < n; i++) {
        const seat = st.seats[`${seg}:${i}`];
        const amount = seat ? seatPrice(seat, fare) : 0;
        if (amount) lines.push(L({ key: `seat-${seg}-${i}`, kind: "addon", visibleFromStep: "seats", amount,
          label: `Seat ${seat} · ${st.pax[i]?.first || `Traveller ${i + 1}`}`, detail: `${cityName(f.from)} → ${cityName(f.to)}` }));
      }
    }
    const perFlight = n * segs.length;
    lines.push(
      L({ key: "baggage", kind: "addon", visibleFromStep: "addons", optional: true, amount: ADDONS.baggage.price * perFlight,
        label: ADDONS.baggage.title, detail: `${perFlight} × ${inr(ADDONS.baggage.price)}` }),
      L({ key: "meal", kind: "addon", visibleFromStep: "addons", optional: true, amount: ADDONS.meal.price * perFlight,
        label: ADDONS.meal.title, detail: `${perFlight} × ${inr(ADDONS.meal.price)}` }),
      L({ key: "insurance", kind: "addon", visibleFromStep: "addons", optional: true, amount: ADDONS.insurance.price * n,
        label: ADDONS.insurance.title, detail: `${n} × ${inr(ADDONS.insurance.price)}` }),
    );
    return lines;
  },
};
