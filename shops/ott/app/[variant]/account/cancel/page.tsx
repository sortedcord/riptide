"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Slot, SlotButton, useHydrated, useRiptide, useSlotDefault } from "@riptide/core";
import { useOtt } from "@/components/ui";
import { DEMO, planById } from "@/lib/plans";

const REASONS = ["It costs too much", "I don't watch enough", "I can't find what I want to watch", "Technical problems", "I'm taking a break", "Something else"];

/** Cancel flow: one page (optional reason + confirm). Reached from Account in one click. */
export default function Cancel() {
  const { base } = useRiptide();
  const [s, set] = useOtt();
  const hydrated = useHydrated();
  const router = useRouter();
  const reasonDefault = useSlotDefault<string>("account.cancel.reason", "");
  const [reason, setReason] = useState(reasonDefault);
  const plan = planById(s.membership.plan)!;

  if (hydrated && s.membership.status === "cancelled") {
    return (
      <main data-riptide-step="cancel" className="rb-wrap rb-page rb-narrow">
        <div className="rb-panel">
          <h1 className="rb-h1">Already cancelled</h1>
          <p className="rb-muted">Your membership is cancelled. You can keep watching until {DEMO.accessEnds()}.</p>
          <Link href={`${base}/account`} className="rt-btn" data-variant="secondary">Back to Account</Link>
        </div>
      </main>
    );
  }

  return (
    <main data-riptide-step="cancel" className="rb-wrap rb-page rb-narrow">
      <nav aria-label="Breadcrumb" className="rb-crumbs"><Link href={`${base}/account`}>Account</Link><span aria-hidden>/</span><span aria-current="page">Cancel membership</span></nav>
      <div className="rb-panel rb-stack">
        <h1 className="rb-h1">Cancel your membership?</h1>
        <p>You&apos;re on the <b>{plan.name}</b> plan, paid until {DEMO.accessEnds()}.</p>
        <Slot id="account.cancel.notice" as="p" className="rt-banner rt-banner--info">
          {`If you cancel, you can keep watching until ${DEMO.accessEnds()}. You won't be charged again, and there's no cancellation fee.`}
        </Slot>
        <Slot id="account.cancel.reason" as="fieldset" className="rt-field rb-reasons">
          <legend>Why are you leaving? (optional)</legend>
          {REASONS.map((r) => (
            <label key={r} className="rt-check"><input type="radio" name="cancel-reason" value={r} checked={reason === r} onChange={() => setReason(r)} /> <span>{r}</span></label>
          ))}
        </Slot>
        <p className="rb-fine">The current month isn&apos;t refunded, but you keep access to it. You can restart anytime from Account.</p>
        <div className="rb-actions rb-actions--even">
          <SlotButton id="account.cancel.keep" as={Link} href={`${base}/account`} variant="secondary">Keep membership</SlotButton>
          <SlotButton id="account.cancel.confirm" variant="secondary"
            onClick={() => { set({ membership: { ...s.membership, status: "cancelled" } }); router.push(`${base}/account`); }}>
            Cancel membership
          </SlotButton>
        </div>
      </div>
    </main>
  );
}
