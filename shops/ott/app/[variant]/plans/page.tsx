"use client";
import { useRouter } from "next/navigation";
import { Slot, SlotButton, formatINR, useFlow, useHydrated, usePrice } from "@riptide/core";
import { Icon, SignupProgress, useOtt, usePlanQuote } from "@/components/ui";
import { PLANS, planById, refDate, type Plan } from "@/lib/plans";

function PlanCard({ id, p, selected, onSelect }: { id: string; p: Plan; selected: boolean; onSelect: () => void }) {
  const q = usePlanQuote(p.id);
  const gst = q.lines.find((l) => l.key === "gst")?.amount ?? 0;
  return (
    <Slot id={id} as="article" className="rb-plan" data-selected={selected ? "" : undefined} aria-label={`${p.name} plan`}>
      <header className="rb-plan__head">
        <h2 className="rb-plan__name">{p.name}</h2>
        <span className="rb-plan__res">{p.resolution}</span>
      </header>
      <p className="rb-plan__price"><b>{formatINR(q.total)}</b><span>/month</span></p>
      <p className="rb-fine">{formatINR(p.price)} + {formatINR(gst)} GST (18%). Billed monthly.</p>
      <dl className="rb-plan__specs">
        <div><dt>Video quality</dt><dd>{p.quality}</dd></div>
        <div><dt>Resolution</dt><dd>{p.resolution}</dd></div>
        <div><dt>Screens at once</dt><dd>{p.screens}</dd></div>
        <div><dt>Download devices</dt><dd>{p.downloads}</dd></div>
        <div><dt>Devices</dt><dd>{p.devices}</dd></div>
        <div><dt>Audio</dt><dd>{p.audio}</dd></div>
      </dl>
      <button type="button" className="rt-btn rb-plan__btn" data-variant="secondary" aria-pressed={selected} onClick={onSelect}>
        {selected ? <><Icon name="check" size={18} /> Selected</> : `Select ${p.name}`}
      </button>
    </Slot>
  );
}

export default function Plans() {
  const [s, set] = useOtt();
  const hydrated = useHydrated();
  const price = usePrice("plans");
  const flow = useFlow("purchase");
  const router = useRouter();
  const chosen = hydrated ? planById(s.plan) : undefined;

  return (
    <main data-riptide-step="plans" className="rb-wrap rb-page">
      <SignupProgress current="plans" />
      <Slot id="plans.header.title" as="h1" className="rb-h1">Choose the plan that fits</Slot>
      <p className="rb-lede">Every plan has the full catalogue, no ads and Kids profiles. Prices include 18% GST, shown separately.</p>

      <Slot id="plans.cards.list" className="rb-plans">
        {PLANS.map((p) => (
          <PlanCard key={p.id} id={`plans.card.${p.id}`} p={p} selected={chosen?.id === p.id} onSelect={() => set({ plan: p.id })} />
        ))}
      </Slot>

      <div className="rb-plans__foot">
        <Slot id="plans.summary.panel" as="aside" className="rb-summary" aria-label="Monthly price breakdown">
          <h2 className="rb-h3">Your monthly price</h2>
          {!hydrated ? <div className="rb-skel" style={{ height: 96 }} /> : chosen ? (
            <ul className="rt-lines">
              {price.lines.filter((l) => l.selected).map((l) => (
                <li key={l.key} data-dp={`plans.summary.line.${l.key}`} data-kind={l.kind} className="rt-line">
                  <span>{l.label}{l.detail && <small className="rt-line__detail">{l.detail}</small>}</span><span>{formatINR(l.amount)}</span>
                </li>
              ))}
            </ul>
          ) : <p className="rb-muted">Select a plan above to see its breakdown. Nothing is selected yet.</p>}
          <div className="rt-line rt-line--total"><span>Total per month</span><Slot id="plans.summary.total" as="strong">{formatINR(price.total)}</Slot></div>
        </Slot>
        <div className="rb-plans__next">
          <Slot id="plans.terms.text" as="p" className="rb-muted">
            {`Billed monthly from today. Renews on ${refDate(1)} at the same price. No commitment: cancel anytime from Account.`}
          </Slot>
          <SlotButton id="plans.cta.continue" variant="primary" className="rb-wide" disabled={!chosen} onClick={() => router.push(flow.next("plans"))}>
            Continue
          </SlotButton>
          {hydrated && !chosen && <p className="rb-fine">Select a plan to continue.</p>}
        </div>
      </div>

      <section className="rb-compare" aria-labelledby="cmp-h">
        <h2 id="cmp-h" className="rb-h2">Compare plans</h2>
        <div className="rb-table-wrap">
          <table className="rb-table">
            <thead><tr><th scope="col">Feature</th>{PLANS.map((p) => <th key={p.id} scope="col">{p.name}</th>)}</tr></thead>
            <tbody>
              {([["Monthly price before GST", (p: Plan) => formatINR(p.price)], ["Video quality", (p: Plan) => p.quality], ["Resolution", (p: Plan) => p.resolution],
                ["Screens at the same time", (p: Plan) => String(p.screens)], ["Download devices", (p: Plan) => String(p.downloads)], ["Watch on", (p: Plan) => p.devices],
                ["Audio", (p: Plan) => p.audio], ["Ads", () => "None"], ["Kids profiles", () => "Included"]] as const).map(([label, f]) => (
                <tr key={label}><th scope="row">{label}</th>{PLANS.map((p) => <td key={p.id}>{f(p)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
