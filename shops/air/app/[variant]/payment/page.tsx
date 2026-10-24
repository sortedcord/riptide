"use client";
import { PaymentPage, useFlow } from "@riptide/core";
import { Stepper } from "@/components/Booking";

export default function Page() {
  const flow = useFlow("purchase");
  const prev = flow.steps[flow.steps.findIndex((s) => s.step === "payment") - 1];
  return (
    <main className="sk-page">
      <Stepper current="payment" />
      <PaymentPage backHref={flow.href(prev.path)} backLabel="Back to review" heading="Pay for your booking" />
    </main>
  );
}
