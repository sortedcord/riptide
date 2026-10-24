"use client";
import { PaymentPage, useRiptide } from "@riptide/core";
import { CheckoutSteps } from "@/components/Ui";

export default function Page() {
  return (
    <main className="pt-6">
      <div className="cw-wrap"><CheckoutSteps current={3} /></div>
      <PaymentPage backHref={`${useRiptide().base}/review`} backLabel="Back to review" />
    </main>
  );
}
