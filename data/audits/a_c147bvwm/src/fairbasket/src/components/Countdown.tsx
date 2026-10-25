/** Shows the real end of an offer, from the catalogue. No timer is shown when an offer has no end date. */
export function OfferEnds({ endsAt }: { endsAt?: string }) {
  if (!endsAt) return null;
  return <p>Offer ends {new Date(endsAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>;
}
