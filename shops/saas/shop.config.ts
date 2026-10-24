import type { LineItem, ShopConfig } from "@riptide/core";
import { formatINR } from "@riptide/core";
import { registry } from "./slots";
import {
  PRICE, STORAGE_PRICE, TRIAL_DAYS, firstChargeDate, fmtDate, gstOf, isPrepaid, planLabel, round2, termById,
  type Mode, type PlanId, type Subscription, type TermId,
} from "./catalog";

export type SaasState = {
  selected?: Record<string, boolean>;
  /** The plan being bought in the purchase flow. */
  plan?: PlanId;
  app?: string;
  term?: TermId;
  seats?: number;
  mode?: Mode;
  optin?: boolean;
  /** The demo account's existing subscription (seeded active so the cancel flow works without buying). */
  sub: Subscription;
};

export const config: ShopConfig<SaasState> = {
  shop: "saas",
  steps: ["home", "search", "app", "policies", "account", "cancel", "cancelled", "plans", "signup", "review", "payment"],
  flows: {
    purchase: [
      { step: "plans", path: "pricing" },
      { step: "signup", path: "signup" },
      { step: "review", path: "review" },
      { step: "payment", path: "payment" },
    ],
    cancel: [
      { step: "account", path: "account" },
      { step: "cancel", path: "account/cancel" },
      { step: "cancelled", path: "account/cancelled" },
    ],
  },
  registry,
  initialState: {
    sub: { plan: "all", term: "monthly", seats: 1, startedOn: "2026-06-14", status: "active" },
  },
  buildLines(s) {
    if (!s.plan || !s.term) return [];
    const seats = s.plan === "team" ? (s.seats ?? 2) : 1;
    const unit = PRICE[s.plan][s.term];
    const amount = unit * seats;
    const gst = gstOf(amount);
    const per = isPrepaid(s.term) ? "yr" : "mo";
    const lines: LineItem[] = [
      {
        key: "plan", kind: "item", visibleFromStep: "plans", optional: false, selected: true, amount,
        label: `${planLabel({ plan: s.plan, app: s.app, term: s.term, seats })} · ${termById(s.term)!.name}`,
        detail: seats > 1 ? `${formatINR(unit)}/seat/${per} × ${seats} seats` : `${formatINR(unit)}/${per}`,
      },
      { key: "gst", kind: "tax", label: "GST (18%)", amount: gst, visibleFromStep: "plans", optional: false, selected: true },
    ];
    if (s.mode === "trial") {
      lines.push({
        key: "trial", kind: "discount", label: `${TRIAL_DAYS}-day free trial · nothing due today`, amount: -round2(amount + gst),
        visibleFromStep: "plans", optional: false, selected: true,
        detail: `First charge ${formatINR(round2(amount + gst))} on ${fmtDate(firstChargeDate("trial"))}`,
      });
    } else {
      const st = STORAGE_PRICE * (isPrepaid(s.term) ? 12 : 1);
      lines.push({
        key: "storage", kind: "addon", label: "Stock assets & +1 TB cloud storage", amount: round2(st + gstOf(st)),
        visibleFromStep: "plans", optional: true, selected: false,
        detail: `${formatINR(st)}/${per} + ${formatINR(gstOf(st))} GST, billed with your plan`,
      });
    }
    return lines;
  },
};
