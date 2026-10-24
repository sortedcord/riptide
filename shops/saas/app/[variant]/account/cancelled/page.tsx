"use client";
import Link from "next/link";
import { Slot, useRiptide, useSession } from "@riptide/core";
import { accessUntil, fmtDate, planLabel } from "@/catalog";
import type { SaasState } from "@/shop.config";
import { Skeleton, useHydrated } from "@/components/ui";

export default function Cancelled() {
  const { base } = useRiptide();
  const [s] = useSession<SaasState>();
  const hydrated = useHydrated();
  const done = s.sub.status === "cancelled";
  return (
    <main data-riptide-step="cancelled" className="ps-wrap max-w-2xl py-12">
      {!hydrated ? <Skeleton h={200} /> : (
        <>
          <h1 className="text-4xl font-extrabold">{done ? "Your plan is cancelled" : "Your plan is active"}</h1>
          <Slot id="cancelled.notice.text" as="p" role="status" className="mt-4 rounded-[var(--rt-radius-sm)] border-l-4 border-success bg-surface p-4">
            {done
              ? `${planLabel(s.sub)} is cancelled and won't renew. You keep access until ${fmtDate(accessUntil(s.sub))}. A confirmation email is on its way.`
              : "Nothing was cancelled. Your plan continues as before."}
          </Slot>
          <p className="mt-4 text-muted">Changed your mind? You can restart the same plan from Account at any time before or after access ends.</p>
          <Link href={`${base}/account`} className="rt-btn mt-6" data-variant="secondary">Back to account</Link>
        </>
      )}
    </main>
  );
}
