"use client";
import { PaymentPage, useRiptide } from "@riptide/core";

export default function Page() {
  return <PaymentPage backHref={`${useRiptide().base}`} backLabel="Back" />;
}
