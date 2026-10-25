import { useState } from "react";
import { CONSENT_PURPOSES, defaultConsents } from "../lib/consent";
import { Icon } from "../components/Icon";

export default function Signup() {
  const [consents, setConsents] = useState<Record<string, boolean>>(defaultConsents());
  return (
    <main className="page narrow">
      <section className="card auth">
        <span className="logo-mark big"><Icon name="bolt" size={26} /></span>
        <h1>Create your QuickKart account</h1>
        <p className="muted">You must be 18 or older to create an account.</p>
        <label className="field"><span>Mobile number</span><span className="phone"><i>+91</i><input type="tel" placeholder="10-digit mobile number" /></span></label>
        <section aria-label="Privacy notice" className="notice">
          <p>We collect your name, phone and delivery address to deliver your orders. Optional uses are listed below; each is off unless you turn it on, and you can withdraw any of them later in Account → Privacy. <a href="/policies/privacy">Full privacy notice</a> (English, हिन्दी, ಕನ್ನಡ).</p>
        </section>
        <label className="check">
          <input type="checkbox" defaultChecked /> Uncheck this box if you do not wish to not receive offers and messages from QuickKart and its partners.
        </label>
        {CONSENT_PURPOSES.filter((p) => !p.required).map((p) => (
          <label key={p.id} className="check">
            <input type="checkbox" checked={consents[p.id]} onChange={(e) => setConsents({ ...consents, [p.id]: e.target.checked })} /> {p.label}
          </label>
        ))}
        <button className="btn btn-primary btn-lg btn-block">Create account</button>
      </section>
    </main>
  );
}
