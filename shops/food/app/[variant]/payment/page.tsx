"use client";
import { PaymentPage, useRiptide } from "@riptide/core";
import { Progress } from "@/components/ui";

export default function Page() {
  return (
    <main className="ff-paywrap">
      <div className="ff-wrap"><Progress current="payment" /></div>
      <PaymentPage backHref={`${useRiptide().base}/checkout`} backLabel="Back to checkout" />
    </main>
  );
}
