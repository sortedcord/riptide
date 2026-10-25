/** Each purpose is a separate, unticked choice. Withdrawing is one click in Account → Privacy. */
export const CONSENT_PURPOSES = [
  { id: "orders", label: "Use my name, phone and address to deliver my orders", required: true, note: "Needed to fulfil orders." },
  { id: "offers_email", label: "Send me offers by email", required: false },
  { id: "offers_sms", label: "Send me offers by SMS", required: false },
  { id: "personalised", label: "Personalise recommendations from my order history", required: false },
] as const;

export const defaultConsents = () => Object.fromEntries(CONSENT_PURPOSES.filter((p) => !p.required).map((p) => [p.id, false]));

export function withdrawConsent(consents: Record<string, boolean>, id: string) {
  return { ...consents, [id]: false };
}
