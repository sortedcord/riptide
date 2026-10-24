"use client";
import Link from "next/link";
import { Slot, formatINR, useFlow, useHydrated } from "@riptide/core";
import { useOtt, usePlanQuote, useToast } from "@/components/ui";
import { DEMO, PLANS, planById, type Plan } from "@/lib/plans";

function SwitchRow({ p, current, onSwitch }: { p: Plan; current: boolean; onSwitch: () => void }) {
  const q = usePlanQuote(p.id);
  return (
    <li className="rb-switch" data-current={current ? "" : undefined}>
      <div><b>{p.name}</b> <span className="rb-muted">· {p.resolution} · {p.screens} screen{p.screens > 1 ? "s" : ""}</span></div>
      <span>{formatINR(q.total)}/month <span className="rb-fine">incl. GST</span></span>
      {current ? <span className="rb-chip">Current plan</span> : (
        <button type="button" className="rt-btn" data-variant="secondary" onClick={onSwitch}>Switch to {p.name}</button>
      )}
    </li>
  );
}

export default function Account() {
  const [s, set] = useOtt();
  const hydrated = useHydrated();
  const flow = useFlow("cancel");
  const [toast, show] = useToast();
  const m = s.membership;
  const plan = planById(m.plan)!;
  const quote = usePlanQuote(m.plan);
  const history = usePlanQuote("standard");
  const cancelled = hydrated && m.status === "cancelled";

  return (
    <main data-riptide-step="account" className="rb-wrap rb-page">
      <h1 className="rb-h1">Account</h1>
      {cancelled && (
        <p className="rt-banner rt-banner--info" role="status">
          Your membership is cancelled. You can keep watching until {DEMO.accessEnds()}, and you won&apos;t be charged again.
        </p>
      )}
      <div className="rb-account">
        <Slot id="account.membership.panel" as="section" className="rb-panel" aria-labelledby="mem-h">
          <h2 id="mem-h" className="rb-h3">Membership</h2>
          {hydrated ? (
            <dl className="rb-dl">
              <div><dt>Plan</dt><dd>{plan.name} · {plan.resolution} · {plan.screens} screen{plan.screens > 1 ? "s" : ""}</dd></div>
              <div><dt>Status</dt><dd>{cancelled ? <span className="rb-chip">Cancelled · access until {DEMO.accessEnds()}</span> : <span className="rb-chip rb-chip--ok">Active</span>}</dd></div>
              <div><dt>Member since</dt><dd>{DEMO.memberSince}</dd></div>
              <div><dt>Email</dt><dd>{DEMO.email}</dd></div>
              <div><dt>Payment method</dt><dd>{DEMO.method}</dd></div>
              <div>
                <dt>Next billing</dt>
                <Slot id="account.billing.next" as="dd">
                  {cancelled ? `No further charges` : `${formatINR(quote.total)} on ${DEMO.nextBilling()} (incl. ${formatINR(quote.lines.find((l) => l.key === "gst")?.amount ?? 0)} GST)`}
                </Slot>
              </div>
            </dl>
          ) : <div className="rb-skel" style={{ height: 220 }} />}
          <div className="rb-actions">
            {cancelled ? (
              <button type="button" className="rt-btn" data-variant="secondary" onClick={() => { set({ membership: { ...m, status: "active" } }); show("Membership restarted. Your next charge is unchanged."); }}>
                Restart membership
              </button>
            ) : (
              <Slot id="account.membership.cancel" as={Link} href={flow.next("account")} className="rt-btn" variant="secondary">Cancel membership</Slot>
            )}
          </div>
        </Slot>

        <Slot id="account.plan.change" as="section" className="rb-panel" aria-labelledby="chg-h">
          <h2 id="chg-h" className="rb-h3">Change plan</h2>
          <p className="rb-muted">The new plan and price apply from your next billing date, {DEMO.nextBilling()}. There&apos;s no fee to switch.</p>
          <ul className="rb-switches">
            {PLANS.map((p) => (
              <SwitchRow key={p.id} p={p} current={hydrated && p.id === m.plan}
                onSwitch={() => { set({ membership: { ...m, plan: p.id } }); show(`Plan changed to ${p.name}. It applies from ${DEMO.nextBilling()}.`); }} />
            ))}
          </ul>
        </Slot>

        <section className="rb-panel" aria-labelledby="hist-h">
          <h2 id="hist-h" className="rb-h3">Billing history</h2>
          <table className="rb-table">
            <thead><tr><th scope="col">Date</th><th scope="col">Description</th><th scope="col">Amount</th></tr></thead>
            <tbody>
              {DEMO.history().map((d) => (
                <tr key={d}><td>{d}</td><td>Standard plan · 1 month</td><td>{formatINR(history.total)}</td></tr>
              ))}
            </tbody>
          </table>
          <p className="rb-fine">Amounts include 18% GST. Invoices are emailed to {DEMO.email}.</p>
        </section>
      </div>
      {toast}
    </main>
  );
}
