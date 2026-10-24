"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Slot, SlotButton, formatINR, useFlow, useHydrated, useLineToggle, usePrice, useRiptide, useSlotDefault } from "@riptide/core";
import { Icon, SignupProgress, useOtt } from "@/components/ui";
import { EXTRA_MEMBER, REF_DATE, planById, refDate } from "@/lib/plans";

export default function SignupPlan() {
  const { base } = useRiptide();
  const [s, set] = useOtt();
  const hydrated = useHydrated();
  const price = usePrice("signup-plan");
  const flow = useFlow("purchase");
  const router = useRouter();
  const [extra, setExtra] = useLineToggle(EXTRA_MEMBER.key);
  const optinDefault = useSlotDefault("signup-plan.optin.marketing", false);
  const optin = s.optin ?? optinDefault;
  const plan = planById(s.plan);
  const extraLine = price.lines.find((l) => l.key === EXTRA_MEMBER.key);

  if (hydrated && !plan) {
    return (
      <main data-riptide-step="signup-plan" className="rb-wrap rb-page rb-narrow">
        <SignupProgress current="signup-plan" />
        <div className="rb-panel">
          <h1 className="rb-h1">Pick a plan first</h1>
          <p className="rb-muted">You haven&apos;t chosen a plan yet. Choose one and we&apos;ll bring you back here.</p>
          <Link href={`${base}/plans`} className="rt-btn" data-variant="primary">See plans</Link>
        </div>
      </main>
    );
  }

  return (
    <main data-riptide-step="signup-plan" className="rb-wrap rb-page">
      <SignupProgress current="signup-plan" />
      <h1 className="rb-h1">Review your membership</h1>
      <div className="rb-review">
        <div className="rb-stack">
          <Slot id="signup-plan.plan.summary" as="section" className="rb-panel rb-chosen" aria-label="Chosen plan">
            {plan ? (
              <>
                <div>
                  <p className="rb-eyebrow">Your plan</p>
                  <h2 className="rb-h2">{plan.name}</h2>
                  <p className="rb-muted">{plan.resolution} · {plan.screens} screen{plan.screens > 1 ? "s" : ""} at once · {plan.devices}</p>
                </div>
                <Link href={`${base}/plans`} className="rt-link">Change plan</Link>
              </>
            ) : <div className="rb-skel" style={{ height: 72, width: "100%" }} />}
          </Slot>

          <Slot id="signup-plan.addons.extra-member" as="section" className="rb-panel rb-addon" data-selected={extra ? "" : undefined} aria-labelledby="addon-h">
            <p className="rb-eyebrow">Optional add-on</p>
            <h2 id="addon-h" className="rb-h3">Extra member slot</h2>
            <p className="rb-muted">
              Give someone outside your household their own sign-in and profile on your plan. They share your plan&apos;s screens.{" "}
              {formatINR(EXTRA_MEMBER.base)} + {formatINR(EXTRA_MEMBER.gst)} GST = {formatINR(extraLine?.amount ?? EXTRA_MEMBER.base + EXTRA_MEMBER.gst)}/month, billed with your plan. Remove it anytime from Account.
            </p>
            <div className="rb-actions">
              <SlotButton id="signup-plan.addons.extra-member-add" variant="secondary" aria-pressed={extra} onClick={() => setExtra(true)}>
                {extra && <Icon name="check" size={18} />}Add extra member
              </SlotButton>
              <SlotButton id="signup-plan.addons.extra-member-decline" variant="secondary" onClick={() => setExtra(false)}>
                No, thanks
              </SlotButton>
            </div>
            <p className="rb-fine" aria-live="polite">{extra ? "Extra member slot added." : "Not added."}</p>
          </Slot>

          <Slot id="signup-plan.optin.marketing" as="label" className="rt-check rb-optin">
            <input type="checkbox" checked={optin} onChange={(e) => set({ optin: e.target.checked })} />
            <span>Send me new releases and offers by email. You can unsubscribe anytime.</span>
          </Slot>
        </div>

        <div className="rb-stack">
          <Slot id="signup-plan.summary.panel" as="aside" className="rb-summary" aria-label="Price breakdown">
            <h2 className="rb-h3">Due today</h2>
            {hydrated ? (
              <ul className="rt-lines">
                {price.lines.filter((l) => l.selected).map((l) => (
                  <li key={l.key} data-dp={`signup-plan.summary.line.${l.key}`} data-kind={l.kind} className="rt-line">
                    <span>{l.label}{l.detail && <small className="rt-line__detail">{l.detail}</small>}</span><span>{formatINR(l.amount)}</span>
                  </li>
                ))}
              </ul>
            ) : <div className="rb-skel" style={{ height: 96 }} />}
            <div className="rt-line rt-line--total"><span>Total</span><Slot id="signup-plan.summary.total" as="strong">{formatINR(price.total)}</Slot></div>
          </Slot>
          <Slot id="signup-plan.terms.renewal" as="p" className="rb-muted">
            {`Your membership renews on ${refDate(1)} for ${formatINR(price.total)}, then monthly on the ${REF_DATE.d}th. Cancel anytime before a renewal and you won't be charged again.`}
          </Slot>
          <SlotButton id="signup-plan.cta.continue" variant="primary" className="rb-wide" disabled={!plan} onClick={() => router.push(flow.next("signup-plan"))}>
            Continue to payment
          </SlotButton>
        </div>
      </div>
    </main>
  );
}
