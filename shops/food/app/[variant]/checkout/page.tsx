"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Slot, SlotButton, formatINR, useFlow, useHydrated, useLineToggle, usePrice, useRiptide, useSession, useSlotDefault } from "@riptide/core";
import { restaurantById } from "@/data/restaurants";
import { CITIES, DONATION, SAVED_ADDRESSES, TIPS, type Address } from "@/data/profile";
import type { FoodState } from "@/shop.config";
import { FoodArt } from "@/components/FoodArt";
import { Bill, Icon, Progress, Skeleton } from "@/components/ui";

const CHIPS = ["Leave at the door", "Avoid ringing the bell", "Call when you arrive", "Pet at home"];
type Draft = Omit<Address, "id">;
const EMPTY: Draft = { label: "Other", name: "", line1: "", line2: "", city: "Bengaluru", pin: "" };

function validate(d: Draft): Partial<Record<keyof Draft, string>> {
  const e: Partial<Record<keyof Draft, string>> = {};
  if (!d.name.trim()) e.name = "Enter the receiver's name.";
  if (!d.line1.trim()) e.line1 = "Enter a flat, house or building.";
  if (!d.line2.trim()) e.line2 = "Enter an area or street.";
  if (!/^[1-9][0-9]{5}$/.test(d.pin.trim())) e.pin = "Enter a valid 6-digit PIN code.";
  return e;
}

export default function CheckoutPage() {
  const { base } = useRiptide();
  const router = useRouter();
  const [s, set] = useSession<FoodState>();
  const hydrated = useHydrated();
  const flow = useFlow("purchase");
  const price = usePrice("checkout");
  const [donation, setDonation] = useLineToggle("donation");
  const cutleryDefault = useSlotDefault<boolean>("checkout.cutlery.toggle", false);
  const marketingDefault = useSlotDefault<boolean>("checkout.optin.marketing", false);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Draft, string>>>({});
  const [addrError, setAddrError] = useState(false);
  const r = restaurantById(s.restaurantId);

  if (!hydrated) {
    return (
      <main data-riptide-step="checkout" className="ff-wrap ff-checkout">
        <Skeleton className="h-8 w-48" />
        <div className="ff-checkout__grid"><Skeleton className="h-96" /><Skeleton className="h-72" /></div>
      </main>
    );
  }
  if (!r || !s.cart.length) {
    return (
      <main data-riptide-step="checkout" className="ff-wrap ff-narrow">
        <div className="ff-empty">
          <FoodArt art="bowl" seed="empty-checkout" className="ff-empty__art" />
          <h1 className="ff-h2">Nothing to check out yet</h1>
          <p>Your cart is empty.</p>
          <Link href={base} className="rt-btn" data-variant="primary">Browse restaurants</Link>
        </div>
      </main>
    );
  }

  const tipOn = TIPS.find((t) => price.lines.find((l) => l.key === `tip-${t}`)?.selected) ?? 0;
  const setTip = (t: number) => set((st) => ({ selected: { ...st.selected, ...Object.fromEntries(TIPS.map((x) => [`tip-${x}`, x === t])) } }));
  const cutlery = s.cutlery ?? cutleryDefault;
  const marketing = s.marketing ?? marketingDefault;
  const chooseAddress = (a: Address) => { set({ address: a, city: a.city }); setShowForm(false); setAddrError(false); };
  const saveDraft = () => {
    const e = validate(draft);
    setErrors(e);
    if (Object.keys(e).length) return;
    chooseAddress({ ...draft, id: "new", name: draft.name.trim(), line1: draft.line1.trim(), line2: draft.line2.trim(), pin: draft.pin.trim() });
  };
  const toPayment = () => {
    if (!s.address) {
      setAddrError(true);
      document.getElementById("ff-address")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    router.push(flow.next("checkout"));
  };
  const field = (k: keyof Draft, label: string, extra: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div className="rt-field">
      <label htmlFor={`ff-addr-${k}`}>{label}</label>
      <input id={`ff-addr-${k}`} className="rt-input" value={draft[k]} aria-invalid={!!errors[k]} aria-describedby={errors[k] ? `ff-addr-${k}-err` : undefined}
        onChange={(e) => setDraft({ ...draft, [k]: e.target.value })} {...extra} />
      {errors[k] && <span id={`ff-addr-${k}-err`} className="ff-err">{errors[k]}</span>}
    </div>
  );

  return (
    <main data-riptide-step="checkout" className="ff-wrap ff-checkout">
      <Progress current="checkout" />
      <Slot id="checkout.header.title" as="h1" className="ff-display ff-display--sm">Checkout</Slot>

      <div className="ff-checkout__grid">
        <div className="ff-stack">
          <Slot id="checkout.address.panel" as="section" aria-labelledby="ff-address" className="ff-card" data-error={addrError || undefined}>
            <div className="ff-section__head">
              <h2 id="ff-address" className="ff-h3"><Icon name="pin" size={18} /> Delivery address</h2>
              <div className="ff-pair">
                <SlotButton id="checkout.address.use-saved" variant="secondary" onClick={() => chooseAddress(s.address && s.address.id !== "new" ? s.address : SAVED_ADDRESSES[0])}>Use saved address</SlotButton>
                <SlotButton id="checkout.address.new" variant="secondary" aria-expanded={showForm} onClick={() => setShowForm(!showForm)}>Add new address</SlotButton>
              </div>
            </div>
            {addrError && !s.address && <p role="alert" className="ff-err">Choose a delivery address to continue.</p>}
            <div className="ff-addr-list" role="radiogroup" aria-label="Saved addresses">
              {[...SAVED_ADDRESSES, ...(s.address?.id === "new" ? [s.address] : [])].map((a) => (
                <label key={a.id} className="ff-addr ff-addr--pick" data-active={s.address?.id === a.id || undefined}>
                  <input type="radio" name="ff-address" checked={s.address?.id === a.id} onChange={() => chooseAddress(a)} />
                  <div className="ff-addr__body">
                    <strong>{a.label}</strong>
                    <p>{a.name} · {a.line1}, {a.line2}, {a.city} {a.pin}</p>
                  </div>
                </label>
              ))}
            </div>
            {showForm && (
              <form className="ff-addr-form" onSubmit={(e) => { e.preventDefault(); saveDraft(); }} noValidate>
                {field("name", "Receiver's name", { autoComplete: "off" })}
                {field("line1", "Flat / house / building", { autoComplete: "off" })}
                {field("line2", "Area / street / landmark", { autoComplete: "off" })}
                <div className="rt-row">
                  <div className="rt-field">
                    <label htmlFor="ff-addr-city">City</label>
                    <select id="ff-addr-city" className="rt-input" value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })}>
                      {Object.keys(CITIES).map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  {field("pin", "PIN code", { inputMode: "numeric", maxLength: 6 })}
                </div>
                <fieldset className="rt-field">
                  <legend>Save as</legend>
                  <div className="ff-pair">
                    {["Home", "Work", "Other"].map((l) => (
                      <label key={l} className="rt-check"><input type="radio" name="ff-addr-label" checked={draft.label === l} onChange={() => setDraft({ ...draft, label: l })} /> <span>{l}</span></label>
                    ))}
                  </div>
                </fieldset>
                <button type="submit" className="rt-btn" data-variant="secondary">Save and deliver here</button>
              </form>
            )}
          </Slot>

          <section aria-labelledby="ff-instr" className="ff-card">
            <h2 id="ff-instr" className="ff-h3">Delivery instructions <span className="ff-req ff-req--opt">Optional</span></h2>
            <Slot id="checkout.instructions.options" role="group" aria-label="Quick instructions" className="ff-filters">
              {CHIPS.map((c) => {
                const on = s.instructionChips.includes(c);
                return (
                  <button key={c} type="button" className="ff-chip" aria-pressed={on}
                    onClick={() => set((st) => ({ instructionChips: on ? st.instructionChips.filter((x) => x !== c) : [...st.instructionChips, c] }))}>{c}</button>
                );
              })}
            </Slot>
            <Slot id="checkout.instructions.input" className="rt-field">
              <label htmlFor="ff-instr-text">Note for the delivery partner</label>
              <textarea id="ff-instr-text" className="rt-input" maxLength={200} placeholder="e.g. Gate 2, ask security for Block B"
                value={s.instructions} onChange={(e) => set({ instructions: e.target.value })} />
            </Slot>
          </section>

          <section aria-labelledby="ff-tip" className="ff-card">
            <h2 id="ff-tip" className="ff-h3">Tip your delivery partner <span className="ff-req ff-req--opt">Optional</span></h2>
            <p className="ff-muted text-sm">100% of the tip goes to your delivery partner. You can leave it at No tip.</p>
            <Slot id="checkout.tip.selector" role="radiogroup" aria-labelledby="ff-tip" className="ff-tips">
              <Slot id="checkout.tip.option-none" as="button" type="button" role="radio" aria-checked={tipOn === 0} className="ff-tip" onClick={() => setTip(0)}>No tip</Slot>
              {TIPS.map((t) => (
                <Slot key={t} id={`checkout.tip.option-${t}`} as="button" type="button" role="radio" aria-checked={tipOn === t} className="ff-tip" onClick={() => setTip(t)}>{formatINR(t)}</Slot>
              ))}
            </Slot>
          </section>

          <section aria-label="Extras" className="ff-card ff-extras">
            <Slot id="checkout.donation.checkbox" as="label" className="rt-check">
              <input type="checkbox" checked={donation} onChange={(e) => setDonation(e.target.checked)} />
              <span>Donate {formatINR(DONATION)} to Annapurna Meals Trust<small className="ff-sub">Funds school meals in partner cities. Optional, added to this order only.</small></span>
            </Slot>
            <Slot id="checkout.cutlery.toggle" as="label" className="rt-check">
              <input type="checkbox" checked={cutlery} onChange={(e) => set({ cutlery: e.target.checked })} />
              <span>Send cutlery and napkins<small className="ff-sub">Free. We only send cutlery when you ask, to cut plastic waste.</small></span>
            </Slot>
            <Slot id="checkout.optin.marketing" as="label" className="rt-check">
              <input type="checkbox" checked={marketing} onChange={(e) => set({ marketing: e.target.checked })} />
              <span>Send me offers and updates by email</span>
            </Slot>
          </section>
        </div>

        <div className="ff-stack ff-sticky">
          <div className="ff-card ff-deliver">
            <p className="ff-overline">Ordering from</p>
            <strong>{r.name}</strong>
            <p className="ff-muted text-sm">{s.address ? <>To {s.address.label}: {s.address.line1}, {s.address.line2}, {s.address.city} {s.address.pin}</> : "No delivery address chosen yet"}</p>
            <p className="ff-muted text-sm">Estimated delivery {r.eta[0]}–{r.eta[1]} min after the restaurant accepts.</p>
          </div>
          <Bill step="checkout" />
          <SlotButton id="checkout.cta.payment" variant="primary" className="ff-block" onClick={toPayment}>Proceed to payment</SlotButton>
          <p className="rt-fine ff-center">You can cancel for free until the restaurant accepts your order. <Link className="rt-link" href={`${base}/policies/refund`}>Refund policy</Link></p>
        </div>
      </div>
    </main>
  );
}
