import type { LineItem, ShopConfig } from "@riptide/core";
import { registry } from "./slots";
import { EXTRA_MEMBER, GST_RATE, planById, type PlanId } from "./lib/plans";

export type OttState = {
  /** Sign-up flow */
  email?: string;
  plan?: PlanId;
  optin?: boolean;
  /** Demo account (signed in by default, active membership so the cancel flow works without sign-up) */
  membership: { plan: PlanId; status: "active" | "cancelled" };
  myList: string[];
  selected?: Record<string, boolean>;
};

export const config: ShopConfig<OttState> = {
  shop: "ott",
  // Order only matters for visibleFromStep: the plan price and GST are visible from "plans" on.
  steps: ["home", "browse", "search", "title", "policies", "account", "cancel", "plans", "signup-email", "signup-password", "signup-plan", "payment"],
  flows: {
    purchase: [
      { step: "plans", path: "plans" },
      { step: "signup-email", path: "signup" },
      { step: "signup-password", path: "signup/password" },
      { step: "signup-plan", path: "signup/plan" },
      { step: "payment", path: "payment" },
    ],
    cancel: [
      { step: "account", path: "account" },
      { step: "cancel", path: "account/cancel" },
    ],
  },
  registry,
  initialState: { membership: { plan: "standard", status: "active" }, myList: [] },
  buildLines(state) {
    const plan = planById(state.plan);
    if (!plan) return [];
    const lines: LineItem[] = [
      { key: "plan", label: `${plan.name} plan · 1 month`, amount: plan.price, kind: "item", visibleFromStep: "plans", optional: false, selected: true, detail: "Billed monthly, no commitment" },
      { key: "gst", label: "GST (18%)", amount: Math.round(plan.price * GST_RATE * 100) / 100, kind: "tax", visibleFromStep: "plans", optional: false, selected: true },
      { key: EXTRA_MEMBER.key, label: "Extra member slot · 1 month", amount: EXTRA_MEMBER.base + EXTRA_MEMBER.gst, kind: "addon", visibleFromStep: "signup-plan", optional: true, selected: false, detail: `₹${EXTRA_MEMBER.base} + ₹${EXTRA_MEMBER.gst} GST` },
    ];
    return lines;
  },
};
