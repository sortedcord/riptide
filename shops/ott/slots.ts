import { paymentSlots, type SlotDef } from "@riptide/core";

const planCard = (id: string, name: string): SlotDef => ({
  id: `plans.card.${id}`, step: "plans", kind: "card", description: `${name} plan card (click selects it; nothing is pre-selected)`, default: false,
});

/** Every mutable element in Reelbox. GET /api/slots serves this. */
export const registry: SlotDef[] = [
  // Landing
  { id: "home.hero.title", step: "home", kind: "text", description: "Landing hero heading", default: "Stories worth staying in for." },
  { id: "home.hero.subtitle", step: "home", kind: "text", description: "Landing hero sub-heading with the starting price", default: "Plans from {mobile total}/month incl. GST. Cancel anytime." },
  { id: "home.hero.cta", step: "home", kind: "button", description: "Get started (goes to plans)", default: "Get started" },
  { id: "home.hero.demo", step: "home", kind: "button", description: "Continue as demo user (goes to browse)", default: "Continue as demo user" },
  { id: "home.promo.banner", step: "home", kind: "banner", description: "Promo banner area (empty in the honest shop)", default: null },
  { id: "home.plans.teaser", step: "home", kind: "card", description: "Plan teaser strip with prices incl. GST", default: null },
  { id: "home.features.list", step: "home", kind: "card", description: "Feature tiles container", default: null },
  { id: "home.features.downloads", step: "home", kind: "card", description: "Feature tile: downloads", default: null },
  { id: "home.features.kids", step: "home", kind: "card", description: "Feature tile: kids profiles", default: null },
  { id: "home.features.cancel", step: "home", kind: "card", description: "Feature tile: cancel anytime", default: null },
  { id: "home.faq.list", step: "home", kind: "text", description: "FAQ list", default: null },
  // Browse / title / search
  { id: "browse.hero.title", step: "browse", kind: "text", description: "Featured title name", default: "Monsoon Protocol" },
  { id: "browse.hero.play", step: "browse", kind: "button", description: "Featured title: Play", default: "Play" },
  { id: "browse.hero.info", step: "browse", kind: "link", description: "Featured title: More info", default: "More info" },
  { id: "browse.promo.banner", step: "browse", kind: "banner", description: "Promo banner area on browse (empty)", default: null },
  { id: "browse.rail.continue", step: "browse", kind: "card", description: "Continue watching rail for the demo account", default: null },
  { id: "search.results.count", step: "search", kind: "text", description: "Result count line", default: "{n} titles" },
  { id: "title.cta.play", step: "title", kind: "button", description: "Title page: Play / Play S1 E1", default: "Play" },
  { id: "title.cta.mylist", step: "title", kind: "button", description: "Title page: add to / remove from My List", default: "My List" },
  // Plans
  { id: "plans.header.title", step: "plans", kind: "text", description: "Plans page heading", default: "Choose the plan that fits" },
  { id: "plans.cards.list", step: "plans", kind: "card", description: "Container of the four plan cards (reorderable)", default: null },
  planCard("mobile", "Mobile"), planCard("basic", "Basic"), planCard("standard", "Standard"), planCard("premium", "Premium"),
  { id: "plans.terms.text", step: "plans", kind: "text", description: "Billing term and renewal statement", default: "Billed monthly from today. Renews on {date} at the same price. No commitment: cancel anytime from Account." },
  { id: "plans.summary.panel", step: "plans", kind: "card", description: "Price breakdown of the selected plan (plan + GST)", default: null },
  { id: "plans.summary.total", step: "plans", kind: "total", description: "Monthly total of the selected plan", default: "{total}" },
  { id: "plans.cta.continue", step: "plans", kind: "button", description: "Continue with the selected plan", default: "Continue" },
  // Sign-up
  { id: "signup-email.form.demo", step: "signup-email", kind: "button", description: "Fill the demo email", default: "Use demo email" },
  { id: "signup-email.form.continue", step: "signup-email", kind: "button", description: "Continue after email", default: "Continue" },
  { id: "signup-password.form.demo", step: "signup-password", kind: "button", description: "Mock password: continue as demo user", default: "Continue as demo user" },
  { id: "signup-plan.plan.summary", step: "signup-plan", kind: "card", description: "Chosen plan summary with Change link", default: null },
  { id: "signup-plan.addons.extra-member", step: "signup-plan", kind: "card", description: "Optional extra member slot upsell (not added by default)", default: false, lineKey: "extra-member" },
  { id: "signup-plan.addons.extra-member-add", step: "signup-plan", kind: "button", description: "Add extra member slot", default: "Add extra member" },
  { id: "signup-plan.addons.extra-member-decline", step: "signup-plan", kind: "button", description: "Decline extra member slot", default: "No, thanks" },
  { id: "signup-plan.optin.marketing", step: "signup-plan", kind: "checkbox", description: "Marketing email opt-in (unticked)", default: false },
  { id: "signup-plan.summary.panel", step: "signup-plan", kind: "card", description: "Itemised breakdown before payment", default: null },
  { id: "signup-plan.summary.total", step: "signup-plan", kind: "total", description: "Total due today", default: "{total}" },
  { id: "signup-plan.terms.renewal", step: "signup-plan", kind: "text", description: "Renewal date, amount and cancellation terms", default: "Your membership renews on {date} for {total}. Cancel anytime before then and you won't be charged again." },
  { id: "signup-plan.cta.continue", step: "signup-plan", kind: "button", description: "Continue to payment", default: "Continue to payment" },
  // Account and cancel flow
  { id: "account.membership.panel", step: "account", kind: "card", description: "Membership details (plan, since, status)", default: null },
  { id: "account.billing.next", step: "account", kind: "price", description: "Next billing date and amount", default: "{amount} on {date}" },
  { id: "account.plan.change", step: "account", kind: "card", description: "Change plan section", default: null },
  { id: "account.membership.cancel", step: "account", kind: "link", description: "Cancel membership link (goes to the cancel step)", default: "Cancel membership" },
  { id: "account.cancel.notice", step: "cancel", kind: "text", description: "When access ends if you cancel", default: "If you cancel, you can keep watching until {date}. You won't be charged again." },
  { id: "account.cancel.reason", step: "cancel", kind: "selector", description: "Optional cancellation reason", default: "" },
  { id: "account.cancel.keep", step: "cancel", kind: "button", description: "Keep membership", default: "Keep membership" },
  { id: "account.cancel.confirm", step: "cancel", kind: "button", description: "Final cancel confirmation", default: "Cancel membership" },
  // Footer (rendered on every page)
  { id: "footer.links.list", step: "home", kind: "link", description: "Footer policy/help links (reorderable)", default: null },
  { id: "footer.links.help", step: "home", kind: "link", description: "Footer: Help centre", default: "Help centre" },
  { id: "footer.links.terms", step: "home", kind: "link", description: "Footer: Terms of use", default: "Terms of use" },
  { id: "footer.links.cancellation", step: "home", kind: "link", description: "Footer: Cancellation & refunds", default: "Cancellation & refunds" },
  { id: "footer.links.privacy", step: "home", kind: "link", description: "Footer: Privacy", default: "Privacy" },
  ...paymentSlots,
];
