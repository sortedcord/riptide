"use client";
import { useRouter } from "next/navigation";
import { Slot, SlotButton, useHydrated, useRiptide, useSession } from "@riptide/core";
import { CITIES, SAVED_ADDRESSES, type Address } from "@/data/profile";
import type { FoodState } from "@/shop.config";
import { Icon } from "@/components/ui";

export default function LocationPage() {
  const { base } = useRiptide();
  const [s, set] = useSession<FoodState>();
  const hydrated = useHydrated();
  const router = useRouter();
  const done = () => router.push(base);
  const pickAddress = (a: Address) => { set({ address: a, city: a.city }); done(); };
  const pickCity = (city: string) => { set((st) => ({ city, address: st.address?.city === city ? st.address : null })); done(); };

  return (
    <main data-riptide-step="location" className="ff-wrap ff-narrow">
      <Slot id="location.header.title" as="h1" className="ff-display ff-display--sm">Where should we deliver?</Slot>
      <p className="ff-muted">Pick a saved address from your demo profile, or choose a city to browse kitchens near you.</p>

      <section aria-labelledby="ff-saved" className="ff-section">
        <h2 id="ff-saved" className="ff-h3">Saved addresses</h2>
        <Slot id="location.saved.list" className="ff-addr-list">
          {SAVED_ADDRESSES.map((a) => {
            const active = hydrated && s.address?.id === a.id;
            return (
              <div key={a.id} className="ff-card ff-addr" data-active={active || undefined}>
                <span className="ff-addr__icon"><Icon name={a.id === "home" ? "home" : "briefcase"} /></span>
                <div className="ff-addr__body">
                  <strong>{a.label}{active && <span className="ff-pill">Selected</span>}</strong>
                  <p>{a.line1}, {a.line2}, {a.city} {a.pin}</p>
                </div>
                <SlotButton id={`location.saved.${a.id}`} variant="secondary" onClick={() => pickAddress(a)} aria-label={`Deliver to ${a.label}`}>Deliver here</SlotButton>
              </div>
            );
          })}
        </Slot>
      </section>

      <section aria-labelledby="ff-cities" className="ff-section">
        <h2 id="ff-cities" className="ff-h3">Or choose a city</h2>
        <Slot id="location.cities.list" role="group" aria-labelledby="ff-cities" className="ff-cities">
          {Object.keys(CITIES).map((c) => (
            <button key={c} type="button" className="ff-city" aria-pressed={hydrated && s.city === c} onClick={() => pickCity(c)}>
              <Icon name="pin" size={16} /> {c}
            </button>
          ))}
        </Slot>
        <p className="rt-fine">You can enter your full delivery address at checkout.</p>
      </section>
    </main>
  );
}
