"use client";
import Link from "next/link";
import { Slot, formatINR, useHydrated, useRiptide } from "@riptide/core";
import { artColor, productById } from "@/data/catalog";
import { DEMO_ADDRESS, DEMO_USER, PAST_ORDERS } from "@/data/content";
import { Art } from "@/components/Art";
import { Icon } from "@/components/Icons";
import { Crumbs, Skeleton } from "@/components/Ui";
import { fmtDate, useCart, useMembership } from "@/components/hooks";

export default function Account() {
  const { base } = useRiptide();
  const hydrated = useHydrated();
  const { state } = useCart();
  const { membership } = useMembership();
  const last = state.lastOrder;

  return (
    <main data-riptide-step="account" className="cw-wrap pt-5">
      <Crumbs items={[["Home", base], ["Your account"]]} />
      <h1 className="mt-4 text-3xl font-semibold">Your account</h1>
      <div className="mt-5 grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="flex flex-col gap-6">
          <Slot id="account.profile.card" as="section" aria-labelledby="prof-h" className="cw-panel-flat p-5 text-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink font-semibold text-saffron">AS</span>
              <div><h2 id="prof-h" className="text-lg font-semibold">{DEMO_USER.name}</h2><p className="text-muted">Demo profile · member since {DEMO_USER.since}</p></div>
            </div>
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5">
              <dt className="text-muted">Email</dt><dd>{DEMO_USER.email}</dd>
              <dt className="text-muted">Phone</dt><dd>{DEMO_USER.phone}</dd>
              <dt className="text-muted">Address</dt><dd>{DEMO_ADDRESS.line1}, {DEMO_ADDRESS.line2}, {DEMO_ADDRESS.city} {DEMO_ADDRESS.pin}</dd>
              <dt className="text-muted">Marketing</dt><dd>{hydrated && state.optin ? "Subscribed to offer emails" : "Not subscribed"}</dd>
            </dl>
          </Slot>

          <Slot id="account.membership.card" as="section" aria-labelledby="mem-h" className="overflow-hidden rounded-[var(--rt-radius)] border border-line bg-cream p-5 text-sm">
            <p className="flex items-center gap-2"><span className="text-clay"><Icon name="spark" size={18} /></span><span className="cw-eyebrow !text-[#7a5a1a]">Membership</span></p>
            <h2 id="mem-h" className="mt-1 text-lg font-semibold">Cartwheel Plus</h2>
            {!hydrated ? <Skeleton className="mt-2 h-10" /> : membership?.status === "active" ? (
              <p className="mt-1">Active · renews on <strong>{fmtDate(new Date(`${membership.renews}T00:00:00`))}</strong> at ₹999.</p>
            ) : membership?.status === "cancelled" ? (
              <p className="mt-1">Cancelled{membership.refunded ? " and refunded" : `. Benefits continue until ${fmtDate(new Date(`${membership.renews}T00:00:00`))}`}. You won&apos;t be charged again.</p>
            ) : (
              <p className="mt-1">You&apos;re not a member. Plus is ₹999 a year and can be added at checkout.</p>
            )}
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
              <Slot id="account.membership.manage" as={Link} href={`${base}/account/membership`} className="rt-link">Manage membership</Slot>
              {hydrated && membership?.status === "active" && (
                <Slot id="account.membership.cancel" as={Link} href={`${base}/account/membership/cancel`} className="rt-link">Cancel membership</Slot>
              )}
            </div>
          </Slot>
        </div>

        <Slot id="account.orders.list" as="section" aria-labelledby="orders-h">
          <h2 id="orders-h" className="cw-h2">Your orders</h2>
          <ul className="mt-3 flex flex-col gap-3">
            {hydrated && last && (
              <li className="cw-panel-flat p-4 text-sm">
                <div className="flex flex-wrap justify-between gap-2 border-b border-line pb-2">
                  <span><strong>Order {last.orderId}</strong> · placed this session</span>
                  <span className="font-semibold">{formatINR(last.total)}</span>
                </div>
                <p className="mt-2 text-success">Sandbox order · no payment was taken</p>
                <ul className="mt-1 text-muted">{last.lines.filter((l) => l.key.startsWith("item:")).map((l) => <li key={l.key}>{l.label}</li>)}</ul>
              </li>
            )}
            {PAST_ORDERS.map((o) => (
              <li key={o.id} className="cw-panel-flat p-4 text-sm">
                <div className="flex flex-wrap justify-between gap-2 border-b border-line pb-2">
                  <span><strong>Order {o.id}</strong> · placed {o.date}</span>
                  <span className="font-semibold">{formatINR(o.total)}</span>
                </div>
                <p className={`mt-2 font-semibold ${o.status.startsWith("Returned") ? "text-muted" : "text-success"}`}>{o.status}</p>
                <ul className="mt-2 flex flex-col gap-2">
                  {o.items.map((it) => {
                    const p = productById(it.pid)!;
                    return (
                      <li key={it.pid} className="flex items-center gap-3">
                        <span className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-line"><Art kind={p.art} color={artColor(p)} accent={p.colors[1]} className="h-full w-full" /></span>
                        <Link href={`${base}/product/${p.id}`} className="hover:underline">{p.title}</Link>
                        <span className="text-muted">× {it.qty}</span>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        </Slot>
      </div>
    </main>
  );
}
