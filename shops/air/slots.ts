import { paymentSlots, type SlotDef } from "@riptide/core";

/** Steps that show the fare-summary sidebar (results onward). */
export const SUMMARY_STEPS = ["results", "fare", "passengers", "seats", "addons", "review"] as const;

const summarySlots: SlotDef[] = SUMMARY_STEPS.flatMap((step): SlotDef[] => [
  { id: `${step}.summary.panel`, step, kind: "card", description: `Fare summary sidebar on ${step}; other lines carry data-dp=${step}.summary.line.{key}`, default: null },
  { id: `${step}.fees.taxes`, step, kind: "fee", description: "Taxes & airport charges line", default: "Taxes & airport charges" },
  { id: `${step}.fees.convenience`, step, kind: "fee", description: "Convenience fee line (₹275 per traveller per flight)", default: "Convenience fee" },
  { id: `${step}.summary.total`, step, kind: "total", description: "Total from the pricing engine", default: "{total}" },
]);

const s = (id: string, step: string, kind: SlotDef["kind"], description: string, def: SlotDef["default"], lineKey?: string): SlotDef =>
  ({ id, step, kind, description, default: def, ...(lineKey ? { lineKey } : {}) });

/** Every mutable element in Skyline Air. GET /api/slots serves this. */
export const registry: SlotDef[] = [
  // search (home)
  s("search.hero.title", "search", "text", "Search page headline", "Fly across India with the fare and every fee upfront."),
  s("search.hero.subtitle", "search", "text", "Search page sub-headline", "13 cities, A320 family jets, and a fare summary that never surprises you."),
  s("search.promo.banner", "search", "banner", "Promo banner area above the search form (empty in the honest state)", null),
  s("search.form.trip", "search", "selector", "Trip type: oneway | round", "oneway"),
  s("search.cta.search", "search", "button", "Search flights button", "Search flights"),
  // footer (rendered on every page; declared on search)
  s("footer.links.list", "search", "link", "Footer policy links container (reorderable)", null),
  s("footer.links.baggage", "search", "link", "Footer link: Baggage policy", "Baggage"),
  s("footer.links.fare-rules", "search", "link", "Footer link: Fare rules", "Fare rules"),
  s("footer.links.cancellation", "search", "link", "Footer link: Cancellation & refunds", "Cancellation & refunds"),
  s("footer.links.terms", "search", "link", "Footer link: Terms of carriage", "Terms of carriage"),
  s("footer.links.privacy", "search", "link", "Footer link: Privacy", "Privacy"),
  // results
  s("results.sort.selector", "results", "selector", "Sort order: price | departure | duration", "price"),
  s("results.notice.fees", "results", "text", "Fee disclosure under the results heading", "Fares are per traveller before taxes. Taxes & airport charges and a ₹275 convenience fee per traveller per flight are added in the fare summary."),
  s("results.cta.continue", "results", "button", "Continue to fare options", "Continue"),
  // fare
  s("fare.family.list", "fare", "card", "Fare family cards container (reorderable)", null),
  s("fare.family.saver", "fare", "card", "Saver fare family card", "Saver"),
  s("fare.family.flexi", "fare", "card", "Flexi fare family card", "Flexi"),
  s("fare.family.plus", "fare", "card", "Plus fare family card", "Plus"),
  s("fare.cta.continue", "fare", "button", "Continue to passenger details", "Continue"),
  // passengers
  s("passengers.saved.button", "passengers", "button", "Use saved traveller (one per traveller form)", "Use saved traveller"),
  s("passengers.contact.saved", "passengers", "button", "Use saved contact details", "Use saved contact details"),
  s("passengers.optin.marketing", "passengers", "checkbox", "Marketing opt-in, unticked", false),
  s("passengers.cta.continue", "passengers", "button", "Continue to seats", "Continue"),
  // seats
  s("seats.map.xl", "seats", "seat", "Extra legroom seats (₹1,450); seat id in data-seat", 1450),
  s("seats.map.front", "seats", "seat", "Up front seats (₹650); seat id in data-seat", 650),
  s("seats.map.standard", "seats", "seat", "Window & aisle seats rows 6–15 (₹300); seat id in data-seat", 300),
  s("seats.map.free", "seats", "seat", "Free seats; seat id in data-seat", 0),
  s("seats.legend.panel", "seats", "card", "Seat legend with prices", null),
  s("seats.cta.continue", "seats", "button", "Continue with chosen seats", "Continue"),
  s("seats.skip.button", "seats", "button", "Skip seat selection (equal weight with continue)", "Skip seat selection"),
  // add-ons
  s("addons.upgrade.card", "addons", "card", "Optional Saver → Flexi upgrade card (shown on Saver)", null),
  s("addons.upgrade.accept", "addons", "button", "Switch to Flexi", "Switch to Flexi"),
  s("addons.upgrade.decline", "addons", "button", "Keep current fare", "Keep Saver"),
  s("addons.list.panel", "addons", "card", "Add-on cards container (reorderable)", null),
  s("addons.baggage.card", "addons", "card", "Extra baggage add-on, not added", false, "baggage"),
  s("addons.baggage.add", "addons", "button", "Add extra baggage", "Add baggage"),
  s("addons.baggage.decline", "addons", "button", "Decline extra baggage", "No, thanks"),
  s("addons.meal.card", "addons", "card", "Meal add-on, not added", false, "meal"),
  s("addons.meal.add", "addons", "button", "Add meal", "Add meal"),
  s("addons.meal.decline", "addons", "button", "Decline meal", "No, thanks"),
  s("addons.insurance.card", "addons", "card", "Travel insurance add-on, not added", false, "insurance"),
  s("addons.insurance.add", "addons", "button", "Add insurance", "Add insurance"),
  s("addons.insurance.decline", "addons", "button", "Decline insurance", "No, thanks"),
  s("addons.cta.continue", "addons", "button", "Continue to review", "Continue"),
  // review
  s("review.itinerary.panel", "review", "card", "Full itinerary", null),
  s("review.terms.text", "review", "text", "Terms line above continue", "By continuing you accept the fare rules for your fare family and the Terms of carriage."),
  s("review.cta.continue", "review", "button", "Continue to payment", "Continue to payment"),
  ...summarySlots,
  ...paymentSlots,
];
