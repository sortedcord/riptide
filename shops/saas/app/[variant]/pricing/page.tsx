"use client";
import { useRouter } from "next/navigation";
import { Slot, SlotButton, formatINR, useFlow, useSession, useSlotDefault } from "@riptide/core";
import {
  APPS, PLANS, TEAM_MAX_SEATS, TEAM_MIN_SEATS, TERMS, TRIAL_DAYS, billingTerms, isPrepaid, round2, termById, trialTerms,
  type Mode, type PlanId, type TermId,
} from "@/catalog";
import type { SaasState } from "@/shop.config";
import { AppIcon } from "@/components/Art";
import { Steps, chargeOf, useHydrated, useQuote } from "@/components/ui";

export default function Pricing() {
  const [s, set] = useSession<SaasState>();
  const flow = useFlow("purchase");
  const router = useRouter();
  const defTerm = useSlotDefault<string>("plans.term.selector", "monthly");
  const defApp = useSlotDefault<string>("plans.single.app", "lumen");
  const defSeats = useSlotDefault<number>("plans.team.seats", TEAM_MIN_SEATS);
  const term = (s.term ?? (termById(defTerm) ? defTerm : "monthly")) as TermId;
  const app = s.app ?? defApp;
  const seats = Math.min(TEAM_MAX_SEATS, Math.max(TEAM_MIN_SEATS, s.seats ?? Number(defSeats)));

  const choose = (plan: PlanId, mode: Mode) => {
    set({ plan, mode, term, app, seats });
    router.push(flow.next("plans"));
  };

  return (
    <main data-riptide-step="plans" className="ps-wrap py-8">
      <Steps current="plans" />
      <Slot id="plans.promo.banner" className="mt-4 empty:hidden" />
      <header className="mt-8 max-w-3xl">
        <p className="ps-eyebrow">Pricing</p>
        <h1 className="mt-2 text-4xl font-extrabold sm:text-5xl">Pick a plan and how you&apos;d like to pay</h1>
        <p className="mt-4 text-lg text-muted">
          Every plan includes a {TRIAL_DAYS}-day free trial. Prices are shown with 18% GST added, so the total you see is what you pay.
        </p>
      </header>

      <Slot id="plans.term.selector" as="fieldset" className="mt-8">
        <legend className="mb-3 text-sm font-semibold">Billing term</legend>
        <div className="ps-seg">
          {TERMS.map((t) => (
            <label key={t.id}>
              <input type="radio" name="term" value={t.id} checked={term === t.id} onChange={() => set({ term: t.id })} />
              {t.name}<small>{t.short}</small>
            </label>
          ))}
        </div>
      </Slot>

      <Slot id="plans.cards.list" className="mt-8 grid gap-5 lg:grid-cols-3">
        {PLANS.map((p) => (
          <PlanCard key={p.id} id={`plans.card.${p.id}`} plan={p.id} term={term} app={app} seats={seats}
            onApp={(a) => set({ app: a })} onSeats={(n) => set({ seats: n })} onChoose={(m) => choose(p.id, m)} />
        ))}
      </Slot>

      <section className="mt-14 grid gap-8 lg:grid-cols-2">
        <div className="ps-panel min-w-0 overflow-x-auto p-6">
          <h2 className="text-xl font-bold">How the billing terms compare</h2>
          <table className="ps-table mt-4">
            <thead><tr><th>Term</th><th>Billed</th><th>Commitment</th><th>If you cancel after 14 days</th></tr></thead>
            <tbody>
              <tr><td>Monthly</td><td>Every month</td><td>None</td><td>No fee. Access until the paid month ends.</td></tr>
              <tr><td>Annual, billed monthly</td><td>Every month for 12 months</td><td>12 months</td><td>Fee of 50% of the remaining monthly payments.</td></tr>
              <tr><td>Annual, prepaid</td><td>Once a year</td><td>12 months, paid upfront</td><td>No fee, no refund. Access until the year ends.</td></tr>
            </tbody>
          </table>
          <p className="mt-3 text-sm text-muted">Cancel within 14 days of a first payment on any term for a full refund.</p>
        </div>
        <div className="ps-panel p-6">
          <h2 className="text-xl font-bold">Good to know</h2>
          <ul className="mt-4 flex flex-col gap-3 text-[0.95rem]">
            <li><b>Trials:</b> nothing is charged during the trial. We show the date and amount of the first charge before you start.</li>
            <li><b>Cancelling:</b> Account → Cancel plan → confirm. Two clicks, no phone call.</li>
            <li><b>Switching:</b> change plan or term any time from Account; the new price starts on your next billing date.</li>
            <li><b>GST invoices:</b> every payment gets a GST invoice. Team plans can add a GSTIN.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}

function PlanCard({ id, plan, term, app, seats, onApp, onSeats, onChoose }: {
  id: string; plan: PlanId; term: TermId; app: string; seats: number;
  onApp: (a: string) => void; onSeats: (n: number) => void; onChoose: (m: Mode) => void;
}) {
  const hydrated = useHydrated();
  const p = PLANS.find((x) => x.id === plan)!;
  const n = plan === "team" ? seats : 1;
  const q = useQuote({ plan, app, term, seats: n });
  const base = q?.lines.find((l) => l.key === "plan")?.amount ?? 0;
  const gst = q?.lines.find((l) => l.key === "gst")?.amount ?? 0;
  const charge = chargeOf(q);
  const div = (isPrepaid(term) ? 12 : 1) * n;
  const perMonth = round2(base / div);
  const perMonthTotal = round2((base + gst) / div);
  const chargeText = `${formatINR(charge)} incl. GST`;

  return (
    <Slot id={id} as="article" data-plan={plan} className="ps-panel ps-plan" aria-label={`${p.name} plan`}>
      <div>
        <h2 className="text-2xl font-extrabold">{p.name}</h2>
        <p className="mt-1 text-sm text-muted">{p.blurb}</p>
      </div>

      {plan === "single" && (
        <div>
          <Slot id="plans.single.app" as="label" htmlFor="ps-single-app" className="text-sm font-semibold">Choose your app</Slot>
          <div className="mt-2 flex items-center gap-3">
            <AppIcon id={app} size={40} />
            <select id="ps-single-app" className="rt-input" value={app} onChange={(e) => onApp(e.target.value)}>
              {APPS.map((a) => <option key={a.id} value={a.id}>Prism {a.name} · {a.category}</option>)}
            </select>
          </div>
        </div>
      )}
      {plan === "team" && (
        <Slot id="plans.team.seats" as="div" role="group" aria-label="Number of seats" className="flex items-center gap-3">
          <span className="text-sm font-semibold">Seats</span>
          <button type="button" className="rt-btn" data-variant="secondary" aria-label="Remove a seat" disabled={seats <= TEAM_MIN_SEATS} onClick={() => onSeats(seats - 1)}>−</button>
          <output className="ps-mono w-8 text-center text-lg" aria-live="polite">{seats}</output>
          <button type="button" className="rt-btn" data-variant="secondary" aria-label="Add a seat" disabled={seats >= TEAM_MAX_SEATS} onClick={() => onSeats(seats + 1)}>+</button>
          <span className="text-xs text-muted">min {TEAM_MIN_SEATS}</span>
        </Slot>
      )}

      <div className="min-h-[5.5rem]">
        {hydrated ? (
          <>
            <p className="flex items-baseline gap-1">
              <Slot id={`plans.${plan}.price`} as="span" className="text-4xl font-extrabold">{`${formatINR(perMonth)}/mo`}</Slot>
              <span className="text-sm text-muted">{plan === "team" ? "per seat" : ""}{isPrepaid(term) ? " · paid yearly" : ""}</span>
            </p>
            <p className="ps-mono mt-1 text-sm">+ {formatINR(round2(gst / div))} GST (18%) = {formatINR(perMonthTotal)}/mo{plan === "team" ? " per seat" : ""}</p>
            <p className="mt-1 text-sm text-muted">
              {isPrepaid(term) ? `One payment of ${chargeText} per year` : `${chargeText} per month`}{plan === "team" ? ` for ${n} seats` : ""}
            </p>
          </>
        ) : <div className="ps-skel h-[5.5rem]" aria-hidden />}
      </div>

      <Slot id={`plans.${plan}.terms`} as="p" className="text-sm leading-relaxed">
        {billingTerms(term, chargeText, "buy")}
      </Slot>

      <ul className="flex flex-col gap-1.5 text-sm">
        {p.includes.map((x) => <li key={x} className="flex gap-2"><span aria-hidden className="text-success">✓</span>{x}</li>)}
      </ul>

      <div className="mt-auto flex flex-col gap-2 border-t border-line pt-4">
        <Slot id={`plans.${plan}.trial-terms`} as="p" className="rounded-[var(--rt-radius-sm)] bg-surface-2 p-3 text-[0.82rem] leading-relaxed">
          {trialTerms(term, chargeText)}
        </Slot>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <SlotButton id={`plans.${plan}.trial`} variant="secondary" onClick={() => onChoose("trial")} disabled={!hydrated}>Start 14-day free trial</SlotButton>
          <SlotButton id={`plans.${plan}.buy`} variant="secondary" onClick={() => onChoose("buy")} disabled={!hydrated}>Buy now</SlotButton>
        </div>
      </div>
    </Slot>
  );
}
