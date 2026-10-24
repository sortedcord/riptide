"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Slot, SlotButton } from "./Slot";
import { usePrice, useRiptide, useSession, useSlotDefault } from "./RiptideProvider";
import { formatINR } from "./util";
import { useHydrated } from "./session";

const METHODS = [
  { key: "upi", label: "UPI" },
  { key: "card", label: "Card" },
  { key: "netbanking", label: "Netbanking" },
  { key: "wallet", label: "Wallet" },
] as const;
const BANKS = ["Kaveri Bank", "Deccan Co-operative Bank", "Sahyadri Bank", "Narmada Federal Bank", "Other bank"];
const WALLETS = ["PaySetu Wallet", "Chillar Wallet", "Tijori Pay"];

export type LastOrder = { orderId: string; total: number; lines: { key: string; label: string; amount: number }[] };

/**
 * The finish line of every purchase flow. Summary comes from the pricing engine (source of truth).
 * Payment inputs have no `name`, are never read and never stored. "Pay" posts only the order summary to /api/pay.
 */
export function PaymentPage({ backHref, backLabel = "Back", heading = "Payment" }: { backHref: string; backLabel?: string; heading?: string }) {
  const { config, variant, base } = useRiptide();
  const price = usePrice("payment");
  const [, set] = useSession<{ lastOrder?: LastOrder }>();
  const hydrated = useHydrated();
  const router = useRouter();
  const initialMethod = useSlotDefault<string>("payment.methods.tabs", "upi");
  const [method, setMethod] = useState<string>(METHODS.some((m) => m.key === initialMethod) ? initialMethod : "upi");
  const [busy, setBusy] = useState(false);
  const lines = price.lines.filter((l) => l.selected);

  async function pay() {
    setBusy(true);
    const order = { shop: config.shop, variant, total: price.total, lines: lines.map(({ key, label, amount }) => ({ key, label, amount })) };
    const res = await fetch("/api/pay", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(order) });
    const { orderId } = (await res.json()) as { orderId: string };
    set({ lastOrder: { orderId, total: order.total, lines: order.lines } });
    router.push(`${base}/sandbox-complete`);
  }

  return (
    <div data-riptide-step="payment" className="rt-pay">
      <div className="rt-pay__head">
        <Link href={backHref} className="rt-link">← {backLabel}</Link>
        <Slot id="payment.header.title" as="h1" className="rt-pay__title">{heading}</Slot>
      </div>
      <div className="rt-pay__grid">
        <section className="rt-pay__methods" aria-label="Payment method">
          <Slot id="payment.methods.tabs" as="div" role="tablist" className="rt-tabs">
            {METHODS.map((m) => (
              <button key={m.key} type="button" role="tab" id={`rt-tab-${m.key}`} aria-selected={method === m.key}
                aria-controls={`rt-panel-${m.key}`} className="rt-tab" onClick={() => setMethod(m.key)}>
                <MethodIcon k={m.key} /> {m.label}
              </button>
            ))}
          </Slot>
          <form className="rt-pay__form" onSubmit={(e) => { e.preventDefault(); if (!busy) pay(); }} autoComplete="off">
            <div role="tabpanel" id={`rt-panel-${method}`} aria-labelledby={`rt-tab-${method}`} className="rt-pay__panel">
              {method === "upi" && <Field id="rt-upi" label="UPI ID" placeholder="yourname@bank" />}
              {method === "card" && (
                <>
                  <Field id="rt-card-number" label="Card number" placeholder="0000 0000 0000 0000" inputMode="numeric" />
                  <div className="rt-row">
                    <Field id="rt-card-exp" label="Expiry (MM/YY)" placeholder="MM/YY" inputMode="numeric" />
                    <Field id="rt-card-cvv" label="CVV" placeholder="•••" inputMode="numeric" />
                  </div>
                  <Field id="rt-card-name" label="Name on card" placeholder="As printed on card" />
                </>
              )}
              {method === "netbanking" && (
                <div className="rt-field">
                  <label htmlFor="rt-bank">Choose your bank</label>
                  <select id="rt-bank" className="rt-input" defaultValue="">
                    <option value="" disabled>Select a bank</option>
                    {BANKS.map((b) => <option key={b}>{b}</option>)}
                  </select>
                </div>
              )}
              {method === "wallet" && (
                <fieldset className="rt-field">
                  <legend>Choose a wallet</legend>
                  {WALLETS.map((w) => (
                    <label key={w} className="rt-check"><input type="radio" name="rt-wallet-choice" value={w} /> <span>{w}</span></label>
                  ))}
                </fieldset>
              )}
              <p className="rt-fine">Sandbox: nothing you type here is sent or stored.</p>
            </div>
            <Slot id="payment.terms.text" as="p" className="rt-fine">
              By paying you agree to the Terms of Use and Refund Policy linked in the footer.
            </Slot>
            <SlotButton id="payment.pay.button" as="button" type="submit" variant="primary" className="rt-pay__btn" disabled={!hydrated || busy}>
              {busy ? "Processing…" : `Pay ${formatINR(price.total)}`}
            </SlotButton>
          </form>
        </section>
        <Slot id="payment.summary.panel" as="aside" className="rt-pay__summary" aria-label="Order summary">
          <h2 className="rt-pay__summary-title">Order summary</h2>
          <ul className="rt-lines">
            {lines.map((l) => (
              <li key={l.key} data-dp={`payment.summary.line.${l.key}`} data-kind={l.kind} className="rt-line">
                <span>{l.label}{l.detail && <small className="rt-line__detail">{l.detail}</small>}</span>
                <span>{formatINR(l.amount)}</span>
              </li>
            ))}
          </ul>
          <div className="rt-line rt-line--total">
            <span>Total</span>
            <Slot id="payment.summary.total" as="strong">{formatINR(price.total)}</Slot>
          </div>
        </Slot>
      </div>
    </div>
  );
}

function Field({ id, label, ...p }: { id: string; label: string; placeholder?: string; inputMode?: "numeric" }) {
  return (
    <div className="rt-field">
      <label htmlFor={id}>{label}</label>
      <input id={id} className="rt-input" autoComplete="off" {...p} />
    </div>
  );
}

/** Neutral generic glyphs — never real payment-brand logos. */
function MethodIcon({ k }: { k: string }) {
  const d: Record<string, string> = {
    upi: "M4 12h16M12 4l8 8-8 8",
    card: "M3 6h18v12H3zM3 10h18",
    netbanking: "M3 10l9-6 9 6M5 10v8M19 10v8M9 10v8M15 10v8M3 20h18",
    wallet: "M3 7h18v12H3zM16 13h2M3 7l3-3h12",
  };
  return (
    <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d={d[k]} />
    </svg>
  );
}

/** "No payment was taken" page, showing what the agent would have paid. */
export function SandboxComplete({ homeHref }: { homeHref: string }) {
  const [s] = useSession<{ lastOrder?: LastOrder }>();
  const hydrated = useHydrated();
  const o = s.lastOrder;
  return (
    <main data-riptide-step="complete" className="rt-complete">
      <h1 className="rt-pay__title">Sandbox order complete</h1>
      <p data-dp="complete.notice.text" className="rt-banner rt-banner--info">
        This is a Riptide sandbox. No payment was taken and nothing was charged.
      </p>
      {hydrated && o ? (
        <>
          <p>Reference <strong data-dp="complete.order.id">{o.orderId}</strong></p>
          <ul className="rt-lines">
            {o.lines.map((l) => (
              <li key={l.key} className="rt-line"><span>{l.label}</span><span>{formatINR(l.amount)}</span></li>
            ))}
          </ul>
          <div className="rt-line rt-line--total"><span>Would have paid</span><strong data-dp="complete.order.total">{formatINR(o.total)}</strong></div>
        </>
      ) : hydrated ? <p>No order found in this session.</p> : null}
      <Link href={homeHref} className="rt-btn" data-variant="secondary">Back to home</Link>
    </main>
  );
}
