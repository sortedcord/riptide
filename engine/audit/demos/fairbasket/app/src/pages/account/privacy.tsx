import { useState } from "react";
import { CONSENT_PURPOSES, withdrawConsent } from "../../lib/consent";
import { AccountNav } from "../../components/SideNav";

/** Account → Privacy: every optional consent can be withdrawn in one click, as easily as it was given. */
export default function Privacy({ initial }: { initial: Record<string, boolean> }) {
  const [consents, setConsents] = useState(initial);
  return (
    <main className="with-side">
      <AccountNav current="/account/privacy" />
      <div className="stack">
        <h1>Privacy and consents</h1>
        <section className="card">
          <p className="muted">Each optional use of your data is listed separately. Turn any of them off here at any time; it does not affect your orders.</p>
          {CONSENT_PURPOSES.filter((p) => !p.required).map((p) => (
            <label key={p.id} className="check toggle-row">
              <input type="checkbox" checked={!!consents[p.id]} onChange={(e) => setConsents(e.target.checked ? { ...consents, [p.id]: true } : withdrawConsent(consents, p.id))} />
              {p.label}
            </label>
          ))}
        </section>
        <p className="muted"><a href="/policies/privacy">Privacy notice</a> · Data protection contact: dpo@fairbasket.example</p>
      </div>
    </main>
  );
}
