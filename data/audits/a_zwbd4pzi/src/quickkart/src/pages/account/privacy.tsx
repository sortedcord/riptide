import { useState } from "react";
import { CONSENT_PURPOSES, withdrawConsent } from "../../lib/consent";

/** Account → Privacy: every optional consent can be withdrawn in one click, as easily as it was given. */
export default function Privacy({ initial }: { initial: Record<string, boolean> }) {
  const [consents, setConsents] = useState(initial);
  return (
    <main>
      <h1>Privacy and consents</h1>
      {CONSENT_PURPOSES.filter((p) => !p.required).map((p) => (
        <label key={p.id}>
          <input type="checkbox" checked={!!consents[p.id]} onChange={(e) => setConsents(e.target.checked ? { ...consents, [p.id]: true } : withdrawConsent(consents, p.id))} />
          {p.label}
        </label>
      ))}
      <p><a href="/policies/privacy">Privacy notice</a> · Data protection contact: dpo@quickkart.example</p>
    </main>
  );
}
