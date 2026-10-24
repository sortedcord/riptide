"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Slot, SlotButton, cn, formatINR, useFlow, useHydrated, useLineToggle, useSession } from "@riptide/core";
import { ADDONS, FARES, type AddonKey } from "@/lib/air";
import { BookingShell, Loading, NeedEarlier } from "@/components/Booking";
import { Icon, ICONS } from "@/components/Chrome";
import { paxCount, segmentsOf, type AirState } from "@/shop.config";

const ICON: Record<AddonKey, string> = { baggage: ICONS.bag, meal: ICONS.meal, insurance: ICONS.shield };
const ADD_TEXT: Record<AddonKey, string> = { baggage: "Add baggage", meal: "Add meal", insurance: "Add insurance" };

export default function Addons() {
  const [st] = useSession<AirState>();
  const hydrated = useHydrated();
  const router = useRouter();
  const flow = useFlow("purchase");
  if (!hydrated) return <Loading step="addons" />;
  const segs = segmentsOf(st);
  if (!segs.length) return <NeedEarlier step="addons" what="Choose a flight first" href={flow.href("results")} />;
  const n = paxCount(st.search);

  return (
    <BookingShell step="addons">
      <header className="sk-pagehead">
        <h1 className="sk-h1">Add-ons</h1>
        <p className="sk-muted">All optional and not added unless you choose them. Your fare already includes {FARES[st.fare ?? "saver"].cabin.toLowerCase()} and {FARES[st.fare ?? "saver"].checkin.toLowerCase()}.</p>
      </header>
      {(st.fare ?? "saver") === "saver" && <Upgrade />}
      <Slot id="addons.list.panel" as="div" className="sk-stack">
        {(Object.keys(ADDONS) as AddonKey[]).map((k) => <Addon key={k} k={k} n={n} flights={segs.length} />)}
      </Slot>
      <div className="sk-actions">
        <SlotButton id="addons.cta.continue" variant="primary" onClick={() => router.push(flow.next("addons"))}>Continue</SlotButton>
      </div>
    </BookingShell>
  );
}

function Addon({ k, n, flights }: { k: AddonKey; n: number; flights: number }) {
  const [on, setOn] = useLineToggle(k);
  const a = ADDONS[k];
  const qty = k === "insurance" ? n : n * flights;
  return (
    <Slot id={`addons.${k}.card`} as="section" className={cn("sk-card sk-addon", on && "is-on")} aria-label={a.title}>
      <span className="sk-addon__icon"><Icon d={ICON[k]} size={24} /></span>
      <div className="sk-addon__body">
        <h2 className="sk-h3">{a.title}</h2>
        <p className="sk-muted">{a.body}</p>
        <p className="sk-addon__price"><strong>{formatINR(a.price)}</strong> {a.unit} · {formatINR(a.price * qty)} for this booking</p>
        <p className="sk-addon__state" aria-live="polite">{on ? "Added to your booking" : "Not added"}</p>
      </div>
      <div className="sk-addon__btns">
        <SlotButton id={`addons.${k}.add`} variant="secondary" aria-pressed={on} onClick={() => setOn(true)}>{ADD_TEXT[k]}</SlotButton>
        <SlotButton id={`addons.${k}.decline`} variant="secondary" aria-pressed={!on} onClick={() => setOn(false)}>No, thanks</SlotButton>
      </div>
    </Slot>
  );
}

function Upgrade() {
  const [st, set] = useSession<AirState>();
  const [kept, setKept] = useState(false);
  const n = paxCount(st.search);
  const diff = segmentsOf(st).reduce((t, [, f]) => t + f.fares.flexi - f.fares.saver, 0);
  return (
    <Slot id="addons.upgrade.card" as="section" className="sk-card sk-upgrade" aria-label="Fare upgrade">
      <div>
        <h2 className="sk-h3">Want free changes? Switch to Flexi</h2>
        <p className="sk-muted">Flexi adds 5 kg check-in baggage, removes the ₹2,999 change fee and lowers the cancellation fee to ₹1,499. It costs {formatINR(diff)} more per traveller ({formatINR(diff * n)} in total, before GST).</p>
        {kept && <p className="sk-addon__state">You&apos;re keeping Saver.</p>}
      </div>
      <div className="sk-addon__btns">
        <SlotButton id="addons.upgrade.accept" variant="secondary" onClick={() => set({ fare: "flexi" })}>Switch to Flexi</SlotButton>
        <SlotButton id="addons.upgrade.decline" variant="secondary" aria-pressed={kept} onClick={() => setKept(true)}>Keep Saver</SlotButton>
      </div>
    </Slot>
  );
}
