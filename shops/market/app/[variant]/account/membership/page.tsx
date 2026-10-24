"use client";
import Link from "next/link";
import { Slot, SlotButton, useFlow, useHydrated, useRiptide } from "@riptide/core";
import { PLUS_BENEFITS } from "@/data/content";
import { Icon } from "@/components/Icons";
import { Crumbs, Skeleton } from "@/components/Ui";
import { fmtDate, useMembership } from "@/components/hooks";

export default function Membership() {
  const { base } = useRiptide();
  const flow = useFlow("cancel");
  const hydrated = useHydrated();
  const { membership: m } = useMembership();
  const d = (s: string) => fmtDate(new Date(`${s}T00:00:00`));

  return (
    <main data-riptide-step="membership" className="cw-wrap max-w-3xl pt-5">
      <Crumbs items={[["Home", base], ["Your account", `${base}/account`], ["Cartwheel Plus"]]} />
      <h1 className="mt-4 text-3xl font-semibold">Cartwheel Plus</h1>

      <Slot id="membership.status.card" as="section" aria-labelledby="st-h" className="cw-panel mt-5 p-6">
        <h2 id="st-h" className="cw-eyebrow">Your membership</h2>
        {!hydrated ? <Skeleton className="mt-3 h-16" /> : m?.status === "active" ? (
          <>
            <p className="mt-2 flex items-center gap-2 text-xl font-semibold"><span className="text-success"><Icon name="check" /></span> Active</p>
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
              <dt className="text-muted">Plan</dt><dd>Yearly, ₹999 per year</dd>
              <dt className="text-muted">Joined</dt><dd>{d(m.started)}</dd>
              <dt className="text-muted">Next renewal</dt><dd><strong>{d(m.renews)}</strong>, ₹999 to your original payment method</dd>
            </dl>
            <div className="mt-5">
              <SlotButton id="membership.actions.cancel" as={Link} href={flow.next("membership")} variant="secondary">Cancel membership</SlotButton>
            </div>
          </>
        ) : m?.status === "cancelled" ? (
          <>
            <p className="mt-2 text-xl font-semibold">Cancelled</p>
            <p className="mt-1 text-sm">{m.refunded ? "Your ₹999 refund is on its way to your original payment method (5–7 working days). Benefits have ended." : `Your benefits continue until ${d(m.renews)}. You won't be charged again.`}</p>
          </>
        ) : (
          <>
            <p className="mt-2 text-xl font-semibold">You&apos;re not a member</p>
            <p className="mt-1 text-sm text-muted">Plus can be added as an optional extra on the checkout page. It&apos;s never selected for you.</p>
            <Link href={`${base}/cart`} className="rt-btn mt-4" data-variant="secondary">Go to cart</Link>
          </>
        )}
      </Slot>

      <section className="mt-6 cw-panel-flat p-6" aria-labelledby="ben-h">
        <h2 id="ben-h" className="text-lg font-semibold">What you get</h2>
        <ul className="mt-2 flex flex-col gap-2 text-sm">{PLUS_BENEFITS.map((b) => <li key={b} className="flex gap-2"><span className="text-primary"><Icon name="check" size={18} /></span>{b}</li>)}</ul>
        <Slot id="membership.plan.terms" as="p" className="mt-4 text-sm text-muted">
          ₹999 per year, renewing automatically each year on the date you joined until you cancel. No minimum term and no cancellation fee. Cancel within 14 days without using a benefit for a full refund; otherwise benefits continue to the end of the paid year.
        </Slot>
        <Link href={`${base}/policies/returns`} className="rt-link mt-3 inline-block text-sm">Membership refund policy</Link>
      </section>
    </main>
  );
}
