"use client";
import Link from "next/link";
import { Slot, formatINR, usePrice, useRiptide, useSession } from "@riptide/core";
import { TRIAL_DAYS, firstChargeDate, fmtDate, termById } from "@/catalog";
import type { SaasState } from "@/shop.config";
import { PriceLines, Skeleton, useHydrated } from "./ui";

/** Order summary for the purchase steps. Every amount comes from usePrice(step). */
export function Summary({ step, children }: { step: "signup" | "review"; children?: React.ReactNode }) {
  const price = usePrice(step);
  const [s] = useSession<SaasState>();
  const hydrated = useHydrated();
  const { registryIds } = useRiptide();
  const totalId = `${step}.summary.total`;
  if (!hydrated) return <Skeleton h={260} />;
  const trial = s.mode === "trial";
  return (
    <Slot id={`${step}.summary.panel`} as="aside" className="ps-panel flex flex-col gap-3 p-6" aria-label="Order summary">
      <h2 className="text-lg font-bold">Order summary</h2>
      <p className="text-sm text-muted">{termById(s.term)?.name}{trial ? ` · ${TRIAL_DAYS}-day free trial` : ""}</p>
      <PriceLines price={price} step={step} />
      <div className="rt-line rt-line--total">
        <span>Due today</span>
        {registryIds.has(totalId)
          ? <Slot id={totalId} as="strong" className="ps-mono">{formatINR(price.total)}</Slot>
          : <strong data-dp={totalId} className="ps-mono">{formatINR(price.total)}</strong>}
      </div>
      {trial && <p className="text-sm text-muted">First charge on {fmtDate(firstChargeDate("trial"))}. Cancel before then and you pay nothing.</p>}
      {children}
    </Slot>
  );
}

export function NoPlan() {
  const { base } = useRiptide();
  return (
    <div className="ps-panel flex flex-col items-start gap-3 p-8">
      <h1 className="text-2xl font-bold">No plan selected yet</h1>
      <p className="text-muted">Choose a plan and billing term first. You&apos;ll see the full price with GST before you continue.</p>
      <Link href={`${base}/pricing`} className="rt-btn" data-variant="primary">View plans</Link>
    </div>
  );
}
