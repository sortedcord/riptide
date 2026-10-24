"use client";
import { PaymentPage, useFlow } from "@riptide/core";
import { Steps } from "@/components/ui";

export default function Page() {
  const flow = useFlow("purchase");
  const prev = flow.steps[flow.steps.findIndex((s) => s.step === "payment") - 1];
  return (
    <main className="pt-8">
      <div className="ps-wrap"><Steps current="payment" /></div>
      <PaymentPage backHref={flow.href(prev.path)} backLabel={`Back to ${prev.interstitial?.title ?? "review"}`} />
    </main>
  );
}
