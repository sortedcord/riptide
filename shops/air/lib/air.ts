import { hashString, prng } from "@riptide/core";
import cities from "@/data/cities.json";

export type City = (typeof cities)[number];
export const CITIES: City[] = cities;
export const cityById = (id: string) => CITIES.find((c) => c.id === id);
export const cityName = (id: string) => cityById(id)?.name ?? id;

/* ---------- Fare families ---------- */
export type FareKey = "saver" | "flexi" | "plus";
export const FARE_KEYS: FareKey[] = ["saver", "flexi", "plus"];
export const FARES: Record<FareKey, {
  name: string; blurb: string; cabin: string; checkin: string; change: string; cancel: string; seats: string; meal: string;
  checkinKg: number; changeFee: number; cancelFee: number;
}> = {
  saver: {
    name: "Saver", blurb: "Lowest fare. Changes and cancellations cost extra.",
    cabin: "1 cabin bag up to 7 kg", checkin: "15 kg check-in baggage", checkinKg: 15,
    change: "₹2,999 per traveller per flight, plus any fare difference", changeFee: 2999,
    cancel: "₹3,999 per traveller per flight; the rest of the base fare and all taxes are refunded", cancelFee: 3999,
    seats: "Middle and rear seats free; other seats at the price shown", meal: "Meals available to buy",
  },
  flexi: {
    name: "Flexi", blurb: "Free changes and a lower cancellation fee.",
    cabin: "1 cabin bag up to 7 kg", checkin: "20 kg check-in baggage", checkinKg: 20,
    change: "No change fee; you pay only any fare difference", changeFee: 0,
    cancel: "₹1,499 per traveller per flight; the rest is refunded", cancelFee: 1499,
    seats: "Window and aisle seats (rows 6–15) included; Up front and Extra legroom at the price shown", meal: "Meals available to buy",
  },
  plus: {
    name: "Plus", blurb: "Most flexible. Any seat and a snack box included.",
    cabin: "1 cabin bag up to 7 kg plus 1 personal item", checkin: "25 kg check-in baggage", checkinKg: 25,
    change: "No change fee; you pay only any fare difference", changeFee: 0,
    cancel: "₹499 per traveller per flight; the rest is refunded", cancelFee: 499,
    seats: "Any available seat included, including Extra legroom", meal: "Complimentary snack box; hot meals available to buy",
  },
};

/* ---------- Mandatory charges (the engine prices them; these are the rates) ---------- */
export const RATES = {
  gst: 0.05,           // GST on base fare (economy)
  airport: 450,        // airport charges per traveller per flight
  convenience: 275,    // convenience fee per traveller per flight
};

/* ---------- Optional add-ons ---------- */
export const ADDONS = {
  baggage: { title: "Extra check-in baggage +10 kg", price: 2250, unit: "per traveller per flight", body: "Prepaid now is cheaper than paying at the airport counter (₹5,500 per 10 kg)." },
  meal: { title: "Hot meal and a drink", price: 400, unit: "per traveller per flight", body: "Choose veg or non-veg on board. Served on flights over 75 minutes; otherwise a cold meal box." },
  insurance: { title: "Travel insurance", price: 249, unit: "per traveller for the whole trip", body: "Underwritten by Suraksha General (fictional). Covers trip cancellation for medical reasons up to ₹20,000, baggage delay over 6 hours (₹2,000) and medical emergencies up to ₹5,00,000." },
} as const;
export type AddonKey = keyof typeof ADDONS;

/* ---------- Flights ---------- */
export type Flight = {
  id: string; number: string; from: string; to: string; date: string;
  dep: number; arr: number; duration: number; stops: number; via?: string; aircraft: string;
  fares: Record<FareKey, number>;
};

const rad = (d: number) => (d * Math.PI) / 180;
export function distanceKm(a: City, b: City): number {
  const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lon - a.lon) / 2) ** 2;
  return Math.round(6371 * 2 * Math.asin(Math.sqrt(h)));
}
const HUBS = ["delhi", "mumbai", "bengaluru", "hyderabad"];
const round5 = (n: number) => Math.round(n / 5) * 5;

/** Deterministic schedule for a route + date: prng(hashString(route + date)). Same inputs, same flights. */
export function flightsFor(from: string, to: string, date: string): Flight[] {
  const a = cityById(from), b = cityById(to);
  if (!a || !b || from === to || !date) return [];
  const rnd = prng(hashString(`${from}>${to}@${date}`));
  const km = distanceKm(a, b);
  const direct = round5((km / 760) * 60 + 35);
  const n = 6 + Math.floor(rnd() * 4);
  const routeNo = 100 + (hashString(`${from}>${to}`) % 80) * 10;
  const out: Flight[] = [];
  for (let i = 0; i < n; i++) {
    const dep = round5(330 + (i + rnd() * 0.8) * (1050 / n));
    const stops = rnd() < (km > 1300 ? 0.3 : 0.12) ? 1 : 0;
    const via = stops ? HUBS.filter((h) => h !== from && h !== to)[Math.floor(rnd() * 3)] : undefined;
    const duration = direct + (stops ? 60 + Math.floor(rnd() * 8) * 10 + 25 : 0);
    const demand = dep < 480 || dep > 1200 ? 0.88 : dep > 1020 ? 1.18 : 1;
    const saver = Math.round(((1700 + km * 2.4) * (0.85 + rnd() * 0.45) * demand * (stops ? 0.9 : 1)) / 50) * 50 - 1;
    const num = routeNo + i;
    out.push({
      id: `SK${num}-${date}`, number: `SK ${num}`, from, to, date, dep, arr: dep + duration, duration, stops, via,
      aircraft: rnd() < 0.7 ? "A320neo" : "A320",
      fares: { saver, flexi: saver + Math.round((900 + km * 0.35) / 50) * 50, plus: saver + Math.round((2600 + km * 0.6) / 50) * 50 },
    });
  }
  return out.sort((x, y) => x.dep - y.dep);
}

export const hhmm = (min: number) => `${String(Math.floor(min / 60) % 24).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
export const dur = (min: number) => `${Math.floor(min / 60)}h ${String(min % 60).padStart(2, "0")}m`;
export function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
export function fmtDate(iso: string, opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" }): string {
  return iso ? new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", { ...opts, timeZone: "UTC" }) : "";
}

/* ---------- Seats (A320-like, 30 rows, 3-3) ---------- */
export const ROWS = 30;
export const LETTERS = ["A", "B", "C", "D", "E", "F"] as const;
export const EXIT_ROWS = [12, 13];
export type SeatBand = "xl" | "front" | "standard" | "free";
export const SEAT_BANDS: Record<SeatBand, { label: string; price: number; where: string }> = {
  xl: { label: "Extra legroom", price: 1450, where: "Rows 1, 12 and 13 (exit rows)" },
  front: { label: "Up front", price: 650, where: "Rows 2–5" },
  standard: { label: "Window & aisle", price: 300, where: "Rows 6–15, seats A, C, D, F" },
  free: { label: "Free seat", price: 0, where: "Middle seats from row 6 and every seat from row 16" },
};
export function seatBand(seat: string): SeatBand {
  const row = parseInt(seat, 10), l = seat.slice(-1);
  if (row === 1 || EXIT_ROWS.includes(row)) return "xl";
  if (row <= 5) return "front";
  if (row <= 15 && l !== "B" && l !== "E") return "standard";
  return "free";
}
/** Price of a seat under a fare family (Flexi includes Window & aisle, Plus includes all). */
export function seatPrice(seat: string, fare: FareKey): number {
  const b = seatBand(seat);
  if (fare === "plus" || (fare === "flexi" && b === "standard")) return 0;
  return SEAT_BANDS[b].price;
}
/** Seats already taken on a flight; deterministic per flight id. */
export function occupiedSeats(flightId: string): Set<string> {
  const rnd = prng(hashString(`seats:${flightId}`));
  const s = new Set<string>();
  for (let r = 1; r <= ROWS; r++) for (const l of LETTERS) if (rnd() < 0.38) s.add(`${r}${l}`);
  return s;
}
