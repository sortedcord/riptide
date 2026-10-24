"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Slot, SlotButton, useHydrated, useRiptide, useSlotDefault } from "@riptide/core";
import { Crumbs, Skeleton } from "@/components/Ui";
import { fmtDate, useMembership, useToday } from "@/components/hooks";

const REASONS = ["I don't order often enough", "It costs too much", "I'm not using the benefits", "I'm moving to another store", "Other reason"];

/** Two steps: optional reason → confirm. */
export default function Cancel() {
  const { base } = useRiptide();
  const router = useRouter();
  const hydrated = useHydrated();
  const today = useToday();
  const { membership: m, set } = useMembership();
  const [stage, setStage] = useState<"reason" | "confirm" | "done">("reason");
  const reasonDefault = useSlotDefault<string>("cancel.reason.list", "");
  const [reason, setReason] = useState(reasonDefault);

  const wrap = (body: React.ReactNode) => (
    <main data-riptide-step="cancel" className="cw-wrap max-w-2xl pt-5">
      <Crumbs items={[["Home", base], ["Your account", `${base}/account`], ["Cartwheel Plus", `${base}/account/membership`], ["Cancel"]]} />
      {body}
    </main>
  );

  if (!hydrated) return wrap(<Skeleton className="mt-6 h-64" />);
  if (stage !== "done" && m?.status !== "active") {
    return wrap(
      <section className="cw-panel-flat mt-6 p-6">
        <h1 className="cw-h2">No active membership to cancel</h1>
        <p className="mt-2 text-sm text-muted">{m?.status === "cancelled" ? "Your Cartwheel Plus membership is already cancelled." : "You're not a Cartwheel Plus member."}</p>
        <Link href={`${base}/account`} className="rt-btn mt-4" data-variant="secondary">Back to your account</Link>
      </section>,
    );
  }

  const started = m ? new Date(`${m.started}T00:00:00`) : null;
  const refundable = !!(started && today && (today.getTime() - started.getTime()) / 86400000 <= 14);
  const renews = m ? fmtDate(new Date(`${m.renews}T00:00:00`)) : "";

  if (stage === "done") {
    return wrap(
      <section className="cw-panel mt-6 p-6" role="status">
        <h1 className="cw-h2">Your membership is cancelled</h1>
        <p className="mt-2 text-sm">{m?.refunded ? "We've started a full refund of ₹999 to your original payment method. It arrives in 5–7 working days." : `Your benefits continue until ${renews}. You won't be charged again.`}</p>
        <Link href={`${base}/account`} className="rt-btn mt-4" data-variant="secondary">Back to your account</Link>
      </section>,
    );
  }

  return wrap(
    <>
      <p className="mt-5 text-sm text-muted">Step {stage === "reason" ? 1 : 2} of 2</p>
      <h1 className="mt-1 text-3xl font-semibold">{stage === "reason" ? "Cancel Cartwheel Plus" : "Confirm cancellation"}</h1>
      {stage === "reason" ? (
        <section className="cw-panel-flat mt-5 p-6">
          <form onSubmit={(e) => { e.preventDefault(); setStage("confirm"); }}>
            <Slot id="cancel.reason.list" as="fieldset">
              <legend className="font-semibold">Why are you cancelling? <span className="font-normal text-muted">(optional)</span></legend>
              <div className="mt-3 flex flex-col gap-2">
                {REASONS.map((r) => (
                  <label key={r} className="rt-check"><input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)} /> <span>{r}</span></label>
                ))}
              </div>
            </Slot>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <SlotButton id="cancel.flow.continue" as="button" type="submit" variant="secondary">Continue</SlotButton>
              <SlotButton id="cancel.flow.keep" variant="secondary" onClick={() => router.push(`${base}/account/membership`)}>Keep membership</SlotButton>
            </div>
          </form>
        </section>
      ) : (
        <section className="cw-panel-flat mt-5 p-6">
          <Slot id="cancel.refund.text" as="p" className="text-sm">
            {refundable
              ? "You joined within the last 14 days, so you'll get a full refund of ₹999 to your original payment method and your Plus benefits end today."
              : `Your Plus benefits continue until ${renews}. You won't be charged again, and there's no cancellation fee.`}
          </Slot>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <SlotButton id="account.cancel.confirm" variant="secondary"
              onClick={() => { if (m) set({ ...m, status: "cancelled", reason: reason || undefined, refunded: refundable }); setStage("done"); }}>Cancel membership</SlotButton>
            <SlotButton id="cancel.confirm.back" variant="secondary" onClick={() => setStage("reason")}>Go back</SlotButton>
          </div>
        </section>
      )}
    </>,
  );
}
