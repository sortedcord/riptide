import { formatINR } from "@riptide/core";
import apps from "./data/apps.json";

export type App = (typeof apps)[number];
export const APPS: App[] = apps;
export const appById = (id?: string) => APPS.find((a) => a.id === id);

export type PlanId = "single" | "all" | "team";
export type TermId = "monthly" | "annual-monthly" | "annual-prepaid";
export type Mode = "trial" | "buy";

export const PLANS: { id: PlanId; name: string; blurb: string; includes: string[] }[] = [
  { id: "single", name: "Single app", blurb: "One Prism app of your choice, with 100 GB cloud storage.", includes: ["Any one app", "100 GB cloud storage", "Prism Portfolio site", "Kern starter fonts (200 families)"] },
  { id: "all", name: "All Apps", blurb: "All six Prism apps for one person, with 1 TB cloud storage.", includes: ["All 6 Prism apps", "1 TB cloud storage", "Full Kern library (2,400 families)", "Prism Portfolio site with custom domain"] },
  { id: "team", name: "Team", blurb: "All Apps for every seat, plus admin console and shared libraries.", includes: ["All 6 apps per seat", "1 TB storage per seat", "Admin console and seat management", "Shared brand libraries", "GST invoice with your GSTIN"] },
];
export const planById = (id?: string) => PLANS.find((p) => p.id === id);

export const TERMS: { id: TermId; name: string; short: string }[] = [
  { id: "monthly", name: "Monthly", short: "No commitment" },
  { id: "annual-monthly", name: "Annual, billed monthly", short: "12-month commitment" },
  { id: "annual-prepaid", name: "Annual, prepaid", short: "Pay once for 12 months" },
];
export const termById = (id?: string) => TERMS.find((t) => t.id === id);

/** Price per seat per charge, before GST. Monthly terms charge monthly; prepaid charges once a year. */
export const PRICE: Record<PlanId, Record<TermId, number>> = {
  single: { monthly: 899, "annual-monthly": 699, "annual-prepaid": 7548 },
  all: { monthly: 2999, "annual-monthly": 2399, "annual-prepaid": 26388 },
  team: { monthly: 3799, "annual-monthly": 3199, "annual-prepaid": 35988 },
};
export const GST_RATE = 0.18;
export const STORAGE_PRICE = 249; // per month, before GST; ×12 on prepaid
export const TRIAL_DAYS = 14;
export const TEAM_MIN_SEATS = 2;
export const TEAM_MAX_SEATS = 50;
export const REFUND_WINDOW_DAYS = 14;
export const round2 = (n: number) => Math.round(n * 100) / 100;
export const gstOf = (n: number) => round2(n * GST_RATE);

// ---- Dates: everything is relative to a fixed reference "today" so rendering is deterministic.
export const TODAY = "2026-10-24";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const d = (iso: string) => new Date(`${iso}T00:00:00Z`);
const iso = (x: Date) => x.toISOString().slice(0, 10);
export const addDays = (s: string, n: number) => { const x = d(s); x.setUTCDate(x.getUTCDate() + n); return iso(x); };
export const addMonths = (s: string, n: number) => { const x = d(s); x.setUTCMonth(x.getUTCMonth() + n); return iso(x); };
export const fmtDate = (s: string) => { const x = d(s); return `${x.getUTCDate()} ${MONTHS[x.getUTCMonth()]} ${x.getUTCFullYear()}`; };
export const daysBetween = (a: string, b: string) => Math.round((d(b).getTime() - d(a).getTime()) / 86400000);

export const trialEnd = () => addDays(TODAY, TRIAL_DAYS - 1); // last free day
export const firstChargeDate = (mode: Mode) => (mode === "trial" ? addDays(TODAY, TRIAL_DAYS) : TODAY);
export const isPrepaid = (t: TermId) => t === "annual-prepaid";
export const cadence = (t: TermId) => (isPrepaid(t) ? "every year" : "every month");

export type Selection = { plan: PlanId; app?: string; term: TermId; seats: number };
export type Subscription = Selection & {
  startedOn: string;
  status: "active" | "cancelled";
  cancelledOn?: string;
  reason?: string;
  /** A plan/term switch that takes effect on the next billing date. */
  scheduled?: Selection;
};

export function planLabel(s: Selection): string {
  if (s.plan === "single") return `Prism ${appById(s.app)?.name ?? "app"} (Single app)`;
  return s.plan === "team" ? `Prism Team · ${s.seats} seats` : "Prism All Apps";
}

/** Plain-language billing terms for a plan + term, as shown on plan cards and at review. */
export function billingTerms(term: TermId, charge: string, mode: Mode): string {
  const from = mode === "trial" ? `from ${fmtDate(firstChargeDate("trial"))}` : "starting today";
  if (term === "monthly")
    return `Billed ${charge} every month, ${from}. No commitment: cancel any time and keep access until the end of the month you've paid for.`;
  if (term === "annual-monthly")
    return `Billed ${charge} every month for 12 months, ${from}. 12-month commitment. Cancel within ${REFUND_WINDOW_DAYS} days of your first payment for a full refund; after that, an early-termination fee of 50% of the remaining monthly payments applies.`;
  return `Billed ${charge} once for 12 months, ${from}, then yearly at the same price until you cancel. Cancel within ${REFUND_WINDOW_DAYS} days of payment for a full refund; after that there's no refund and access continues to the end of the year.`;
}

export function trialTerms(term: TermId, charge: string): string {
  return `Free for ${TRIAL_DAYS} days: ${fmtDate(TODAY)} to ${fmtDate(trialEnd())}. On ${fmtDate(firstChargeDate("trial"))} you'll be charged ${charge}, then ${cadence(term)}${term === "annual-monthly" ? " for 12 months" : ""}. Cancel before ${fmtDate(firstChargeDate("trial"))} in Account → Cancel plan and you pay nothing.`;
}

// ---- Account maths for the seeded demo subscription.
/** Billing dates from start up to and including TODAY. */
export function pastCharges(sub: Subscription): string[] {
  const step = isPrepaid(sub.term) ? 12 : 1;
  const out: string[] = [];
  for (let i = 0; ; i += step) {
    const dt = addMonths(sub.startedOn, i);
    if (dt > TODAY || (sub.cancelledOn && dt > sub.cancelledOn)) break;
    out.push(dt);
  }
  return out;
}
export const nextBillingDate = (sub: Subscription) => addMonths(sub.startedOn, pastCharges(sub).length * (isPrepaid(sub.term) ? 12 : 1));
export const accessUntil = (sub: Subscription) => addDays(nextBillingDate(sub), -1);

/** What cancelling today means for money, in one sentence. `charge` is one payment incl. GST. */
export function refundInfo(sub: Subscription, charge: number): { refund: number; fee: number; text: string } {
  const paid = pastCharges(sub);
  const sinceStart = daysBetween(sub.startedOn, TODAY);
  if (sinceStart <= REFUND_WINDOW_DAYS) {
    const refund = round2(paid.length * charge);
    return { refund, fee: 0, text: `You're within ${REFUND_WINDOW_DAYS} days of your first payment, so you'll get a full refund of ${formatINR(refund)} to your original payment method within 5–7 working days. Access ends today.` };
  }
  if (sub.term === "annual-monthly") {
    const remaining = Math.max(0, 12 - (paid.length % 12 || 12));
    const fee = round2(remaining * charge * 0.5);
    return { refund: 0, fee, text: `Your 12-month commitment has ${remaining} monthly payment${remaining === 1 ? "" : "s"} left, so a one-time early-termination fee of ${formatINR(fee)} (50% of ${remaining} × ${formatINR(charge)}) will be charged. No refund is due for the current month; you keep access until ${fmtDate(accessUntil(sub))}.` };
  }
  return { refund: 0, fee: 0, text: `No refund is due: your last payment on ${fmtDate(paid[paid.length - 1] ?? sub.startedOn)} covers access until ${fmtDate(accessUntil(sub))}, and you keep access until then. You won't be charged again. Full refunds apply only within ${REFUND_WINDOW_DAYS} days of a first payment.` };
}

export const DEMO_USER = { name: "Ananya Iyer", email: "ananya.iyer@demo.prismstudio.in", city: "Bengaluru, Karnataka 560034", id: "PRISM-ID 4471-0926" };
