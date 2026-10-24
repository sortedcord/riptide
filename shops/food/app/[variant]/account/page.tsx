"use client";
import Link from "next/link";
import { formatINR, useHydrated, useRiptide, useSession, type LastOrder } from "@riptide/core";
import { DEMO_USER, PASS_PRICE, SAVED_ADDRESSES } from "@/data/profile";
import type { FoodState } from "@/shop.config";
import { Icon } from "@/components/ui";

export default function AccountPage() {
  const { base } = useRiptide();
  const [s] = useSession<FoodState & { lastOrder?: LastOrder }>();
  const hydrated = useHydrated();
  return (
    <main data-riptide-step="account" className="ff-wrap ff-narrow ff-stack">
      <h1 className="ff-display ff-display--sm">Your account</h1>
      <section className="ff-card">
        <p className="ff-overline">Signed in as the demo user</p>
        <h2 className="ff-h3">{DEMO_USER.name}</h2>
        <p className="ff-muted">{DEMO_USER.phone} · {DEMO_USER.email}</p>
        <p className="rt-fine">This is a sandbox profile. No sign-in, OTP or verification is needed.</p>
      </section>

      <section className="ff-card">
        <h2 className="ff-h3"><Icon name="scooter" size={18} /> Forkful Pass</h2>
        <p>You don&apos;t have an active Pass. You can add one from your cart: {formatINR(PASS_PRICE)} for 1 month, charged once, free delivery on orders above ₹199 from your next order.</p>
        <p className="rt-fine">Pass never renews automatically. Unused Passes can be refunded within 7 days. See the <Link className="rt-link" href={`${base}/policies/terms`}>Terms</Link>.</p>
      </section>

      <section className="ff-card">
        <h2 className="ff-h3">Saved addresses</h2>
        <ul className="ff-stack">
          {SAVED_ADDRESSES.map((a) => <li key={a.id}><strong>{a.label}</strong> · {a.line1}, {a.line2}, {a.city} {a.pin}</li>)}
        </ul>
      </section>

      <section className="ff-card">
        <h2 className="ff-h3">Recent orders</h2>
        {hydrated && s.lastOrder ? (
          <p>Sandbox order <strong>{s.lastOrder.orderId}</strong> · {formatINR(s.lastOrder.total)} (no payment was taken)</p>
        ) : <p className="ff-muted">No orders in this session yet.</p>}
        <Link href={base} className="rt-btn" data-variant="secondary">Order food</Link>
      </section>
    </main>
  );
}
