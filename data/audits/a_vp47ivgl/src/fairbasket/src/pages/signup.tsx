import { useState } from "react";
import { CONSENT_PURPOSES, defaultConsents } from "../lib/consent";

export default function Signup() {
  const [consents, setConsents] = useState<Record<string, boolean>>(defaultConsents());
  return (
    <main className="narrow">
      <section className="card form-card">
        <h1>Create your FairBasket account</h1>
        <p className="muted">You must be 18 or older to create an account.</p>
        <label className="field">Full name <input type="text" autoComplete="name" /></label>
        <label className="field">Mobile number <input type="tel" autoComplete="tel" placeholder="10-digit mobile number" /></label>
        <section aria-label="Privacy notice" className="notice">
          <p>We collect your name, phone and delivery address to deliver your orders. Optional uses are listed below; each is off unless you turn it on, and you can withdraw any of them later in Account → Privacy. <a href="/policies/privacy">Full privacy notice</a> (English, हिन्दी, ಕನ್ನಡ).</p>
        </section>
        <p className="field-label">Optional (all off by default)</p>
        {CONSENT_PURPOSES.filter((p) => !p.required).map((p) => (
          <label key={p.id} className="check">
            <input type="checkbox" checked={consents[p.id]} onChange={(e) => setConsents({ ...consents, [p.id]: e.target.checked })} /> {p.label}
          </label>
        ))}
        <button className="btn btn-primary btn-block">Create account</button>
      </section>
    </main>
  );
}
