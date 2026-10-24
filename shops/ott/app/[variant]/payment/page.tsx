"use client";
import { PaymentPage, useRiptide } from "@riptide/core";
import { SignupProgress } from "@/components/ui";

export default function Page() {
  const { base } = useRiptide();
  return (
    <main className="rb-wrap rb-page rb-paywrap">
      <SignupProgress current="payment" />
      <PaymentPage backHref={`${base}/signup/plan`} backLabel="Back to review" heading="Payment" />
    </main>
  );
}
