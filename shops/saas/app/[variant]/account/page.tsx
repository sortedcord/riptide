"use client";
import Link from "next/link";
import { useState } from "react";
import { Slot, SlotButton, formatINR, useFlow, useSession, useSlotDefault } from "@riptide/core";
import {
  APPS, DEMO_USER, PLANS, TERMS, accessUntil, fmtDate, nextBillingDate, pastCharges, planLabel, termById,
  type PlanId, type Selection, type Subscription, type TermId,
} from "@/catalog";
import type { SaasState } from "@/shop.config";
import { AppIcon } from "@/components/Art";
import { Crumbs, Skeleton, chargeOf, useHydrated, useQuote } from "@/components/ui";

export default function Account() {
  const [s, set] = useSession<SaasState>();
  const hydrated = useHydrated();
  const flow = useFlow("cancel");
  const sub = s.sub;
  const quote = useQuote(sub, "payment");
  const nextQuote = useQuote(sub.scheduled ?? sub, "payment");
  const charge = chargeOf(quote);
  const next = nextBillingDate(sub);
  const active = sub.status === "active";

  return (
    <main data-riptide-step="account" className="ps-wrap py-8">
      <Crumbs items={[["Home", flow.href("")], ["Account"]]} />
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="ps-eyebrow">{DEMO_USER.id}</p>
          <h1 className="mt-1 text-4xl font-extrabold">Hi, {DEMO_USER.name.split(" ")[0]}</h1>
          <p className="mt-1 text-muted">{DEMO_USER.email} · {DEMO_USER.city}</p>
        </div>
        <span className="ps-chip">Signed in as demo user</span>
      </div>

      {!hydrated ? <Skeleton h={360} className="mt-8" /> : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="flex flex-col gap-6">
            <Slot id="account.plan.card" as="section" className="ps-panel p-6" aria-label="Current plan">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  {sub.plan === "single" ? <AppIcon id={sub.app ?? "lumen"} size={52} /> : <div className="ps-spectrum h-12 w-12 !rounded-[14px]" aria-hidden />}
                  <div>
                    <p className="ps-eyebrow">Current plan</p>
                    <h2 className="text-2xl font-bold">{planLabel(sub)}</h2>
                    <p className="text-sm text-muted">{termById(sub.term)?.name} · member since {fmtDate(sub.startedOn)}</p>
                  </div>
                </div>
                <span className={`ps-chip ${active ? "text-success" : "text-warning"}`}>{active ? "Active" : `Cancelled · access until ${fmtDate(accessUntil(sub))}`}</span>
              </div>
              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[var(--rt-radius-sm)] bg-surface-2 p-4">
                  <dt className="text-sm text-muted">Next payment</dt>
                  <Slot id="account.billing.next" as="dd" className="mt-1 text-lg font-bold">
                    {active ? `${formatINR(chargeOf(nextQuote))} on ${fmtDate(next)}` : "None. Your plan won't renew."}
                  </Slot>
                </div>
                <div className="rounded-[var(--rt-radius-sm)] bg-surface-2 p-4">
                  <dt className="text-sm text-muted">Each payment</dt>
                  <dd className="mt-1 text-lg font-bold">{formatINR(charge)} <span className="text-sm font-normal text-muted">incl. 18% GST</span></dd>
                </div>
              </dl>
              {sub.scheduled && active && (
                <p className="mt-4 rounded-[var(--rt-radius-sm)] border border-line p-3 text-sm">
                  Scheduled: switching to <b>{planLabel(sub.scheduled)}</b>, {termById(sub.scheduled.term)?.name}, on {fmtDate(next)}.{" "}
                  <button type="button" className="rt-btn" data-variant="link" onClick={() => set({ sub: { ...sub, scheduled: undefined } })}>Undo switch</button>
                </p>
              )}
              <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-line pt-4">
                <a href="#manage" className="rt-link">Manage plan</a>
                {active ? (
                  <Slot id="account.plan.cancel" as={Link} href={flow.next("account")} className="rt-link">Cancel plan</Slot>
                ) : (
                  <button type="button" className="rt-btn" data-variant="secondary" onClick={() => set({ sub: { ...sub, status: "active", cancelledOn: undefined, reason: undefined } })}>Restart plan</button>
                )}
              </div>
            </Slot>

            {active && <Manage sub={sub} next={next} onSave={(sel) => set({ sub: { ...sub, scheduled: sel } })} />}
          </div>

          <Slot id="account.history.table" as="section" className="ps-panel p-6" aria-label="Billing history">
            <h2 className="text-xl font-bold">Billing history</h2>
            <table className="ps-table mt-3">
              <thead><tr><th>Date</th><th>Invoice</th><th className="!text-right">Amount</th></tr></thead>
              <tbody>
                {pastCharges(sub).slice().reverse().map((d) => (
                  <tr key={d}>
                    <td>{fmtDate(d)}</td>
                    <td><span className="ps-mono text-xs">PS-INV-{d.replace(/-/g, "")}</span><br /><span className="text-xs text-success">Paid · UPI</span></td>
                    <td className="ps-mono text-right">{formatINR(charge)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-xs text-muted">GST invoices are emailed to {DEMO_USER.email} after each payment.</p>
          </Slot>
        </div>
      )}
    </main>
  );
}

function Manage({ sub, next, onSave }: { sub: Subscription; next: string; onSave: (s: Selection) => void }) {
  const defaultSel = useSlotDefault<string>("account.manage.selector", "");
  const cur = sub.scheduled ?? sub;
  const [plan, setPlan] = useState<PlanId>(PLANS.some((p) => p.id === defaultSel) ? (defaultSel as PlanId) : cur.plan);
  const [term, setTerm] = useState<TermId>(cur.term);
  const [app, setApp] = useState(cur.app ?? "lumen");
  const [saved, setSaved] = useState(false);
  const sel: Selection = { plan, term, app: plan === "single" ? app : undefined, seats: plan === "team" ? Math.max(2, cur.seats) : 1 };
  const q = useQuote(sel, "payment");
  const same = plan === cur.plan && term === cur.term && (plan !== "single" || app === cur.app);
  return (
    <section id="manage" className="ps-panel scroll-mt-24 p-6" aria-label="Manage plan">
      <h2 className="text-xl font-bold">Manage plan</h2>
      <p className="mt-1 text-sm text-muted">Switch plan or billing term. The change starts on your next billing date, {fmtDate(next)}; nothing is charged today.</p>
      <Slot id="account.manage.selector" as="div" className="mt-4 grid gap-4 sm:grid-cols-2">
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Plan</legend>
          {PLANS.map((p) => (
            <label key={p.id} className="rt-check mb-2"><input type="radio" name="m-plan" checked={plan === p.id} onChange={() => { setPlan(p.id); setSaved(false); }} /><span>{p.name}</span></label>
          ))}
          {plan === "single" && (
            <select aria-label="App for Single app plan" className="rt-input mt-1" value={app} onChange={(e) => { setApp(e.target.value); setSaved(false); }}>
              {APPS.map((a) => <option key={a.id} value={a.id}>Prism {a.name}</option>)}
            </select>
          )}
        </fieldset>
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Billing term</legend>
          {TERMS.map((t) => (
            <label key={t.id} className="rt-check mb-2"><input type="radio" name="m-term" checked={term === t.id} onChange={() => { setTerm(t.id); setSaved(false); }} /><span>{t.name} <small className="text-muted">· {t.short}</small></span></label>
          ))}
        </fieldset>
      </Slot>
      <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-line pt-4">
        <p className="text-sm">New payment: <b className="ps-mono">{formatINR(chargeOf(q))}</b> {term === "annual-prepaid" ? "per year" : "per month"} incl. GST, from {fmtDate(next)}.</p>
        <SlotButton id="account.manage.save" variant="secondary" disabled={same} onClick={() => { onSave(sel); setSaved(true); }}>Switch plan</SlotButton>
        {saved && <span role="status" className="text-sm text-success">Saved. Your plan switches on {fmtDate(next)}.</span>}
      </div>
    </section>
  );
}
