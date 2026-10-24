import { paymentSlots, type SlotDef } from "@riptide/core";
import apps from "./data/apps.json";

const PLAN_IDS = ["single", "all", "team"] as const;
const PLAN_NAMES = { single: "Single app", all: "All Apps", team: "Team" };

/** Every mutable element in Prism Studio. GET /api/slots serves this. */
export const registry: SlotDef[] = [
  // Home
  { id: "home.promo.banner", step: "home", kind: "banner", description: "Promo banner area on home (empty in honest)", default: null },
  { id: "home.hero.title", step: "home", kind: "text", description: "Home hero heading", default: "Every creative app you need, in one studio." },
  { id: "home.hero.subtitle", step: "home", kind: "text", description: "Home hero sub-heading", default: "Six apps for photo, vector, video, layout, PDF and type." },
  { id: "home.hero.cta", step: "home", kind: "button", description: "Hero link to the pricing page", default: "See plans and pricing" },
  { id: "home.trial.note", step: "home", kind: "text", description: "Free-trial note under the hero", default: "14-day free trial on every plan. Cancel online in two clicks." },
  { id: "home.apps.list", step: "home", kind: "card", description: "App suite grid container (children reorderable)", default: null },
  ...apps.map((a): SlotDef => ({ id: `home.apps.${a.id}`, step: "home", kind: "card", description: `App tile: ${a.name}`, default: a.name })),
  { id: "home.plans.teaser", step: "home", kind: "price", description: "Starting price teaser incl. GST", default: "From ₹899/mo + ₹161.82 GST" },
  { id: "footer.links.list", step: "home", kind: "link", description: "Footer Policies column (children reorderable)", default: null },
  { id: "footer.links.terms", step: "home", kind: "link", description: "Footer Terms of use link", default: "Terms of use" },
  { id: "footer.links.refunds", step: "home", kind: "link", description: "Footer Cancellation & refunds link", default: "Cancellation & refunds" },
  { id: "footer.links.privacy", step: "home", kind: "link", description: "Footer Privacy link", default: "Privacy" },
  { id: "footer.links.help", step: "home", kind: "link", description: "Footer Help centre link", default: "Help centre" },
  { id: "footer.links.careers", step: "home", kind: "link", description: "Footer Careers link", default: "Careers" },

  // App page
  { id: "app.promo.banner", step: "app", kind: "banner", description: "Promo banner area on app pages (empty in honest)", default: null },
  { id: "app.price.panel", step: "app", kind: "price", description: "Single-app price incl. GST on the app page", default: "₹899/mo + GST" },
  { id: "app.cta.plans", step: "app", kind: "button", description: "Link to pricing with this app chosen", default: "See plans & free trial" },

  // Pricing
  { id: "plans.promo.banner", step: "plans", kind: "banner", description: "Promo banner area on pricing (empty in honest)", default: null },
  { id: "plans.term.selector", step: "plans", kind: "selector", description: "Billing term selector (monthly / annual billed monthly / annual prepaid)", default: "monthly" },
  { id: "plans.cards.list", step: "plans", kind: "card", description: "Plan cards container (children reorderable)", default: null },
  ...PLAN_IDS.flatMap((p): SlotDef[] => [
    { id: `plans.card.${p}`, step: "plans", kind: "card", description: `${PLAN_NAMES[p]} plan card`, default: PLAN_NAMES[p] },
    { id: `plans.${p}.price`, step: "plans", kind: "price", description: `${PLAN_NAMES[p]} price per month incl. GST`, default: "{price}" },
    { id: `plans.${p}.terms`, step: "plans", kind: "text", description: `${PLAN_NAMES[p]} billing, commitment and early-termination terms`, default: "{terms}" },
    { id: `plans.${p}.trial-terms`, step: "plans", kind: "text", description: `${PLAN_NAMES[p]} trial disclosure: length, first charge date, amount, how to cancel`, default: "{trial terms}" },
    { id: `plans.${p}.trial`, step: "plans", kind: "button", description: `${PLAN_NAMES[p]}: start free trial`, default: "Start 14-day free trial" },
    { id: `plans.${p}.buy`, step: "plans", kind: "button", description: `${PLAN_NAMES[p]}: buy now`, default: "Buy now" },
  ]),
  { id: "plans.single.app", step: "plans", kind: "selector", description: "App chosen for the Single app plan", default: "lumen" },
  { id: "plans.team.seats", step: "plans", kind: "selector", description: "Team seat count", default: 2 },

  // Signup
  { id: "signup.demo.continue", step: "signup", kind: "button", description: "One-click demo account", default: "Continue as demo user" },
  { id: "signup.summary.panel", step: "signup", kind: "card", description: "Order summary beside sign-up", default: null },

  // Review
  { id: "review.summary.panel", step: "review", kind: "card", description: "Itemised price breakdown", default: null },
  { id: "review.fees.gst", step: "review", kind: "fee", description: "GST (18%) line", default: "{gst}" },
  { id: "review.summary.total", step: "review", kind: "total", description: "Due today", default: "{total}" },
  { id: "review.billing.terms", step: "review", kind: "text", description: "Renewal, commitment and trial terms for the chosen plan", default: "{terms}" },
  { id: "review.upsell.storage", step: "review", kind: "card", description: "Stock assets & cloud storage add-on (not added)", default: false, lineKey: "storage" },
  { id: "review.upsell.add", step: "review", kind: "button", description: "Add the storage add-on", default: "Add to plan" },
  { id: "review.upsell.decline", step: "review", kind: "button", description: "Decline the storage add-on", default: "No, thanks" },
  { id: "review.optin.marketing", step: "review", kind: "checkbox", description: "Marketing email opt-in (unticked)", default: false },
  { id: "review.cta.continue", step: "review", kind: "button", description: "Continue to payment", default: "Continue to payment" },

  // Account + cancel
  { id: "account.plan.card", step: "account", kind: "card", description: "Current plan summary", default: null },
  { id: "account.billing.next", step: "account", kind: "price", description: "Next billing date and amount", default: "{next}" },
  { id: "account.plan.cancel", step: "account", kind: "link", description: "Cancel plan link (first click of the cancel flow)", default: "Cancel plan" },
  { id: "account.manage.selector", step: "account", kind: "selector", description: "Switch plan / billing term", default: "{current}" },
  { id: "account.manage.save", step: "account", kind: "button", description: "Confirm plan switch", default: "Switch plan" },
  { id: "account.history.table", step: "account", kind: "card", description: "Billing history", default: null },
  { id: "account.cancel.summary", step: "cancel", kind: "card", description: "What cancelling changes (access end date, no further charges)", default: null },
  { id: "account.cancel.refund", step: "cancel", kind: "text", description: "Refund / fee eligibility in plain words", default: "{refund}" },
  { id: "account.cancel.reason", step: "cancel", kind: "selector", description: "Optional cancellation reason", default: "" },
  { id: "account.cancel.actions", step: "cancel", kind: "card", description: "Keep / cancel button pair container", default: null },
  { id: "account.cancel.keep", step: "cancel", kind: "button", description: "Keep plan (back to account)", default: "Keep plan" },
  { id: "account.cancel.confirm", step: "cancel", kind: "button", description: "Final cancel confirmation", default: "Cancel plan" },
  { id: "cancelled.notice.text", step: "cancelled", kind: "text", description: "Cancellation confirmation", default: "Your plan is cancelled." },

  ...paymentSlots,
];
