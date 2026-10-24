"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Slot, SlotButton, useFlow, useHydrated, useSession, useSlotDefault } from "@riptide/core";
import { BookingShell, Loading, NeedEarlier } from "@/components/Booking";
import profile from "@/data/profile.json";
import type { AirState, Pax } from "@/shop.config";

const TITLES = { adult: ["Ms", "Mrs", "Mr", "Mx"], child: ["Miss", "Master"] };
const NAME_RE = /^[A-Za-z][A-Za-z .'-]*$/;

export default function Passengers() {
  const [st, set] = useSession<AirState>();
  const hydrated = useHydrated();
  const router = useRouter();
  const flow = useFlow("purchase");
  const optinDefault = useSlotDefault<boolean>("passengers.optin.marketing", false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [picker, setPicker] = useState<number | null>(null);
  if (!hydrated) return <Loading step="passengers" />;
  const s = st.search;
  if (!s || !st.out) return <NeedEarlier step="passengers" what="Choose a flight first" href={flow.href("results")} />;

  const types: Pax["type"][] = [...Array(s.adults).fill("adult"), ...Array(s.children).fill("child")];
  const pax: Pax[] = types.map((type, i) => (st.pax[i]?.type === type ? st.pax[i] : { type, title: "", first: "", last: "" }));
  const contact = st.contact ?? { email: "", phone: "" };
  const optin = st.optin ?? optinDefault;
  const setPax = (i: number, p: Partial<Pax>) => set({ pax: pax.map((x, j) => (j === i ? { ...x, ...p } : x)) });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const err: Record<string, string> = {};
    pax.forEach((p, i) => {
      if (!p.title) err[`${i}.title`] = "Choose a title.";
      if (!NAME_RE.test(p.first.trim())) err[`${i}.first`] = "Enter the first name as on the ID (letters only).";
      if (!NAME_RE.test(p.last.trim())) err[`${i}.last`] = "Enter the last name as on the ID (letters only).";
      if (p.type === "child" && !p.dob) err[`${i}.dob`] = "Enter the child's date of birth.";
    });
    if (!/^\S+@\S+\.\S+$/.test(contact.email)) err.email = "Enter a valid email address.";
    if (!/^[6-9]\d{9}$/.test(contact.phone)) err.phone = "Enter a 10-digit Indian mobile number.";
    setErrors(err);
    if (Object.keys(err).length) { document.getElementById(`f-${Object.keys(err)[0]}`)?.focus(); return; }
    set({ pax, optin });
    router.push(flow.next("passengers"));
  }

  const used = new Set(pax.map((p) => `${p.first} ${p.last}`));
  return (
    <BookingShell step="passengers">
      <header className="sk-pagehead">
        <h1 className="sk-h1">Traveller details</h1>
        <p className="sk-muted">Enter names exactly as they appear on a government photo ID. Signed in as {profile.name}: you can fill from saved travellers.</p>
      </header>
      <form onSubmit={submit} noValidate className="sk-stack">
        {pax.map((p, i) => (
          <fieldset key={i} className="sk-card sk-pax">
            <legend className="sk-pax__legend">Traveller {i + 1} · {p.type === "adult" ? "Adult (12+ yrs)" : "Child (2–11 yrs)"}</legend>
            <div className="sk-pax__saved">
              <SlotButton id="passengers.saved.button" variant="secondary" aria-expanded={picker === i} onClick={() => setPicker(picker === i ? null : i)}>Use saved traveller</SlotButton>
              {picker === i && (
                <ul className="sk-saved" aria-label="Saved travellers">
                  {profile.travellers.filter((t) => t.type === p.type).map((t) => (
                    <li key={t.id}>
                      <button type="button" className="sk-chip" disabled={used.has(`${t.first} ${t.last}`)}
                        onClick={() => { setPax(i, { title: t.title, first: t.first, last: t.last, dob: t.dob }); setPicker(null); }}>
                        {t.title} {t.first} {t.last}{t.dob ? ` · born ${t.dob}` : ""}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="sk-pax__grid">
              <Field id={`f-${i}.title`} label="Title" error={errors[`${i}.title`]}>
                <select id={`f-${i}.title`} className="rt-input" value={p.title} onChange={(e) => setPax(i, { title: e.target.value })}>
                  <option value="">Select</option>
                  {TITLES[p.type].map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field id={`f-${i}.first`} label="First and middle name" error={errors[`${i}.first`]}>
                <input id={`f-${i}.first`} className="rt-input" autoComplete="off" value={p.first} onChange={(e) => setPax(i, { first: e.target.value })} />
              </Field>
              <Field id={`f-${i}.last`} label="Last name" error={errors[`${i}.last`]}>
                <input id={`f-${i}.last`} className="rt-input" autoComplete="off" value={p.last} onChange={(e) => setPax(i, { last: e.target.value })} />
              </Field>
              {p.type === "child" && (
                <Field id={`f-${i}.dob`} label="Date of birth" error={errors[`${i}.dob`]}>
                  <input id={`f-${i}.dob`} type="date" className="rt-input" value={p.dob ?? ""} onChange={(e) => setPax(i, { dob: e.target.value })} />
                </Field>
              )}
            </div>
          </fieldset>
        ))}

        <fieldset className="sk-card sk-pax">
          <legend className="sk-pax__legend">Contact details</legend>
          <p className="sk-muted">We send the e-ticket and any schedule changes here.</p>
          <div className="sk-pax__saved">
            <SlotButton id="passengers.contact.saved" variant="secondary" onClick={() => set({ contact: { email: profile.email, phone: profile.phone } })}>Use saved contact details</SlotButton>
          </div>
          <div className="sk-pax__grid">
            <Field id="f-email" label="Email" error={errors.email}>
              <input id="f-email" type="email" className="rt-input" autoComplete="off" value={contact.email} onChange={(e) => set({ contact: { ...contact, email: e.target.value } })} />
            </Field>
            <Field id="f-phone" label="Mobile number (+91)" error={errors.phone}>
              <input id="f-phone" inputMode="numeric" className="rt-input" autoComplete="off" value={contact.phone} onChange={(e) => set({ contact: { ...contact, phone: e.target.value.replace(/\D/g, "").slice(0, 10) } })} />
            </Field>
          </div>
          <Slot id="passengers.optin.marketing" as="label" className="rt-check">
            <input type="checkbox" checked={optin} onChange={(e) => set({ optin: e.target.checked })} /> <span>Send me Skyline Air offers by email</span>
          </Slot>
        </fieldset>

        <div className="sk-actions">
          <SlotButton id="passengers.cta.continue" as="button" type="submit" variant="primary">Continue</SlotButton>
        </div>
      </form>
    </BookingShell>
  );
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="rt-field">
      <label htmlFor={id}>{label}</label>
      {children}
      {error && <p className="sk-err" role="alert">{error}</p>}
    </div>
  );
}
