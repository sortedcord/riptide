"use client";
import Link from "next/link";
import { useSyncExternalStore, type ReactNode } from "react";
import { Slot, cn, formatINR, useFlow, useHydrated, usePrice, useRiptide, useSession } from "@riptide/core";
import { FARES, cityName, dur, fmtDate, hhmm, type Flight } from "@/lib/air";
import { paxCount, segmentsOf, type AirState } from "@/shop.config";

const noop = () => () => {};
/** Today's local date (YYYY-MM-DD) after hydration; "" during SSR. Never read at server render. */
export function useToday(): string {
  return useSyncExternalStore(noop, () => new Date().toLocaleDateString("en-CA"), () => "");
}

const LABELS: Record<string, string> = {
  search: "Search", results: "Flights", fare: "Fare", passengers: "Travellers", seats: "Seats", addons: "Add-ons", review: "Review", payment: "Payment",
};

export function Stepper({ current }: { current: string }) {
  const flow = useFlow("purchase");
  const steps = flow.steps;
  const at = steps.findIndex((s) => s.step === current);
  return (
    <nav aria-label="Booking progress" className="sk-stepper">
      <ol>
        {steps.map((s, i) => {
          const label = LABELS[s.step] ?? s.interstitial?.title ?? s.step;
          const state = i < at ? "done" : i === at ? "current" : "todo";
          return (
            <li key={s.step} data-state={state} aria-current={state === "current" ? "step" : undefined}>
              <span className="sk-stepper__dot" aria-hidden>{i + 1}</span>
              {state === "done" ? <Link href={flow.href(s.path)}>{label}</Link> : <span>{label}</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Page frame for every booking step: <main data-riptide-step>, progress, content and the fare summary. */
export function BookingShell({ step, children, summary = true }: { step: string; children: ReactNode; summary?: boolean }) {
  return (
    <main data-riptide-step={step} className="sk-page">
      <Stepper current={step} />
      <div className={cn("sk-grid", !summary && "sk-grid--full")}>
        <div className="sk-main">{children}</div>
        {summary && <FareSummary step={step} />}
      </div>
    </main>
  );
}

export function FareSummary({ step }: { step: string }) {
  const price = usePrice(step);
  const [st] = useSession<AirState>();
  const { registryIds } = useRiptide();
  const hydrated = useHydrated();
  const segs = segmentsOf(st);
  const n = paxCount(st.search);
  const lines = price.lines.filter((l) => l.selected);
  return (
    <Slot id={`${step}.summary.panel`} as="aside" className="sk-summary" aria-label="Fare summary">
      <h2 className="sk-summary__title">Fare summary</h2>
      {!hydrated ? (
        <div className="sk-skel" style={{ height: 180 }} />
      ) : !segs.length ? (
        <p className="sk-muted">Select a flight to see the full price, including taxes and the convenience fee, before you continue.</p>
      ) : (
        <>
          <p className="sk-summary__meta">
            {segs.map(([seg, f]) => <span key={seg}>{cityName(f.from)} → {cityName(f.to)} · {fmtDate(f.date)}</span>)}
            <span>{n} traveller{n > 1 ? "s" : ""} · {FARES[st.fare ?? "saver"].name}</span>
          </p>
          <ul className="rt-lines">
            {lines.map((l) => {
              const id = `${step}.fees.${l.key}`;
              const body = <><span>{l.label}{l.detail && <small className="rt-line__detail">{l.detail}</small>}</span><span>{formatINR(l.amount)}</span></>;
              return registryIds.has(id)
                ? <Slot key={l.key} id={id} as="li" className="rt-line" data-kind={l.kind}>{body}</Slot>
                : <li key={l.key} data-dp={`${step}.summary.line.${l.key}`} className="rt-line" data-kind={l.kind}>{body}</li>;
            })}
          </ul>
          <div className="rt-line rt-line--total"><span>Total</span><Slot id={`${step}.summary.total`} as="strong">{formatINR(price.total)}</Slot></div>
          <p className="sk-fine">Includes GST. The total changes only when you change your flights, fare, seats or add-ons.</p>
        </>
      )}
    </Slot>
  );
}

/** Compact flight timeline used on cards, review and seats. */
export function FlightLine({ f, compact = false }: { f: Flight; compact?: boolean }) {
  const plusDays = Math.floor(f.arr / 1440);
  return (
    <div className={cn("sk-fl", compact && "sk-fl--compact")}>
      <div className="sk-fl__end">
        <strong className="sk-time">{hhmm(f.dep)}</strong>
        <span>{cityName(f.from)}</span>
      </div>
      <div className="sk-fl__mid" aria-label={`${dur(f.duration)}, ${f.stops ? `1 stop in ${cityName(f.via!)}` : "non-stop"}`}>
        <span className="sk-fl__dur">{dur(f.duration)}</span>
        <span className="sk-fl__track" aria-hidden>{f.stops ? <i className="sk-fl__stop" /> : null}</span>
        <span className={cn("sk-fl__stops", f.stops > 0 && "is-stop")}>{f.stops ? `1 stop · ${cityName(f.via!)}` : "Non-stop"}</span>
      </div>
      <div className="sk-fl__end sk-fl__end--r">
        <strong className="sk-time">{hhmm(f.arr)}{plusDays > 0 && <sup title="Arrives next day">+{plusDays}</sup>}</strong>
        <span>{cityName(f.to)}</span>
      </div>
    </div>
  );
}

/** Shown when a step is opened without the earlier choices it needs. */
export function NeedEarlier({ step, what, href }: { step: string; what: string; href: string }) {
  return (
    <BookingShell step={step} summary={false}>
      <div className="sk-card sk-empty">
        <h1 className="sk-h1">{what}</h1>
        <p className="sk-muted">This step needs a few details from earlier in your booking.</p>
        <Link href={href} className="rt-btn" data-variant="primary">Go back</Link>
      </div>
    </BookingShell>
  );
}

export function Loading({ step }: { step: string }) {
  return (
    <BookingShell step={step}>
      <div className="sk-skel" style={{ height: 120 }} />
      <div className="sk-skel" style={{ height: 320, marginTop: 16 }} />
    </BookingShell>
  );
}

