import { useState } from "react";
import { CONSENT_PURPOSES, defaultConsents } from "../lib/consent";

export default function Signup() {
  const [consents, setConsents] = useState<Record<string, boolean>>(defaultConsents());
  return (
    <main>
      <h1>Create your FairBasket account</h1>
      <p>You must be 18 or older to create an account.</p>
      <section aria-label="Privacy notice">
        <p>We collect your name, phone and delivery address to deliver your orders. Optional uses are listed below; each is off unless you turn it on, and you can withdraw any of them later in Account → Privacy. <a href="/policies/privacy">Full privacy notice</a> (English, हिन्दी, ಕನ್ನಡ).</p>
      </section>
      {CONSENT_PURPOSES.filter((p) => !p.required).map((p) => (
        <label key={p.id}>
          <input type="checkbox" checked={consents[p.id]} onChange={(e) => setConsents({ ...consents, [p.id]: e.target.checked })} /> {p.label}
        </label>
      ))}
      <button>Create account</button>
    </main>
  );
}
