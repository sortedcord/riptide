"use client";
import { useRouter } from "next/navigation";
import { SlotButton, useFlow, useSession } from "@riptide/core";
import { DEMO_USER } from "@/catalog";
import type { SaasState } from "@/shop.config";
import { NoPlan, Summary } from "@/components/Summary";
import { Steps, useHydrated } from "@/components/ui";

export default function Signup() {
  const flow = useFlow("purchase");
  const router = useRouter();
  const [s] = useSession<SaasState>();
  const hydrated = useHydrated();
  return (
    <main data-riptide-step="signup" className="ps-wrap py-8">
      <Steps current="signup" />
      {hydrated && !s.plan ? <div className="mt-8"><NoPlan /></div> : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          <section className="ps-panel p-8">
            <p className="ps-eyebrow">Step 2 · Account</p>
            <h1 className="mt-2 text-3xl font-extrabold">Create your Prism ID</h1>
            <p className="mt-3 text-muted">Your Prism ID signs you in to every app and holds your plan, invoices and cloud files.</p>
            <div className="mt-6 rounded-[var(--rt-radius)] border border-line bg-surface-2 p-5">
              <p className="text-sm font-semibold">Demo profile</p>
              <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                <dt className="text-muted">Name</dt><dd>{DEMO_USER.name}</dd>
                <dt className="text-muted">Email</dt><dd>{DEMO_USER.email}</dd>
                <dt className="text-muted">Billing city</dt><dd>{DEMO_USER.city}</dd>
              </dl>
            </div>
            <SlotButton id="signup.demo.continue" variant="primary" className="mt-6 w-full sm:w-auto" disabled={!hydrated}
              onClick={() => router.push(flow.next("signup"))}>
              Continue as demo user
            </SlotButton>
            <p className="mt-4 text-sm text-muted">This sandbox uses a demo account: no password, email or OTP verification is needed.</p>
          </section>
          <Summary step="signup" />
        </div>
      )}
    </main>
  );
}
