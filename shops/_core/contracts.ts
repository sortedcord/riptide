import { z } from "zod";

export const SHOP_TYPES = ["market", "food", "air", "saas", "ott"] as const;
export type ShopType = (typeof SHOP_TYPES)[number];

/** `{step}.{section}.{element}` — at least three dot-separated lowercase segments. */
export const DP_ID_RE = /^[a-z0-9-]+(\.[a-z0-9-]+){2,}$/;
const DpId = z.string().regex(DP_ID_RE, "data-dp ids look like step.section.element");
export type DpId = string;

export const SLOT_KINDS = [
  "price", "fee", "total", "checkbox", "button", "banner", "card",
  "text", "selector", "link", "modal", "seat",
] as const;
export type SlotKind = (typeof SLOT_KINDS)[number];

export type SlotDef = {
  id: DpId;
  step: string;
  kind: SlotKind;
  description: string;
  /** Honest default value: label text, checked state, selected option, etc. */
  default: string | number | boolean | null;
  /** For checkboxes/cards that toggle an optional pricing line: that line's key. */
  lineKey?: string;
};

export const LINE_KINDS = ["item", "fee", "tax", "addon", "discount", "tip", "donation", "membership"] as const;

export const LineItemSchema = z.object({
  key: z.string().min(1),
  label: z.string(),
  /** Rupees. Negative for discounts. */
  amount: z.number(),
  kind: z.enum(LINE_KINDS),
  /** First step (from the shop's `steps` list) at which this line is shown and counted. */
  visibleFromStep: z.string(),
  optional: z.boolean(),
  /** Initial selection for optional lines. Non-optional lines are always counted. */
  selected: z.boolean(),
  /** Optional sub-label, e.g. "2 × ₹499". */
  detail: z.string().optional(),
});
export type LineItem = z.infer<typeof LineItemSchema>;

export const VARIANTS = ["primary", "secondary", "ghost", "link", "muted", "tiny"] as const;
export type Variant = (typeof VARIANTS)[number];

const BlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("banner"), id: DpId, tone: z.enum(["info", "promo", "warning"]), text: z.string() }),
  z.object({
    type: z.literal("countdown"), id: DpId, label: z.string(),
    endsAt: z.string().optional(), durationSec: z.number().positive().optional(), persist: z.boolean(),
  }),
  z.object({ type: z.literal("checkbox"), id: DpId, label: z.string(), defaultChecked: z.boolean(), lineKey: z.string().optional() }),
  z.object({
    type: z.literal("card"), id: DpId, title: z.string(), body: z.string(), ctaText: z.string(),
    declineText: z.string().optional(), lineKey: z.string().optional(),
  }),
  z.object({
    type: z.literal("modal"), id: DpId, title: z.string(), body: z.string(), acceptText: z.string(),
    declineText: z.string(), trigger: z.enum(["onLoad", "onExit", "onStep"]),
  }),
  z.object({ type: z.literal("badge"), id: DpId, text: z.string() }),
  z.object({ type: z.literal("text"), id: DpId, text: z.string(), size: z.enum(["body", "small", "fine-print"]) }),
]);
export type Block = z.infer<typeof BlockSchema>;

const InterstitialStepSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string(),
  body: z.string().optional(),
  fields: z
    .array(z.object({ id: z.string(), label: z.string(), type: z.enum(["text", "textarea", "checkbox"]) }))
    .default([]),
  continueText: z.string().default("Continue"),
  /** Optional decline/skip button; equal weight with continue unless a manifest says otherwise. */
  skipText: z.string().optional(),
});
export type InterstitialStep = z.infer<typeof InterstitialStepSchema>;

export const OverrideSchema = z.discriminatedUnion("op", [
  z.object({ op: z.literal("setText"), target: DpId, value: z.string() }),
  z.object({ op: z.literal("setVariant"), target: DpId, variant: z.enum(VARIANTS) }),
  z.object({ op: z.literal("setDefault"), target: DpId, value: z.union([z.boolean(), z.string(), z.number()]) }),
  z.object({ op: z.literal("setAttr"), target: DpId, attr: z.enum(["aria-label", "title", "alt"]), value: z.string() }),
  z.object({ op: z.literal("hide"), target: DpId }),
  z.object({ op: z.literal("reorder"), target: DpId, order: z.array(DpId).min(1) }),
  z.object({ op: z.literal("addLine"), line: LineItemSchema }),
  z.object({ op: z.literal("setLine"), key: z.string(), patch: LineItemSchema.partial().omit({ key: true }) }),
  z.object({ op: z.literal("insertBlock"), anchor: DpId, position: z.enum(["before", "after", "inside"]), block: BlockSchema }),
  z.object({ op: z.literal("insertStep"), flow: z.string(), after: z.string(), step: InterstitialStepSchema }),
  z.object({ op: z.literal("setHead"), jsonLd: z.record(z.string(), z.unknown()).optional(), meta: z.record(z.string(), z.string()).optional() }),
]);
export type Override = z.infer<typeof OverrideSchema>;

export const ManifestSchema = z.object({
  shopType: z.enum(SHOP_TYPES),
  variant: z.string().regex(/^[a-z0-9_-]+$/),
  author: z.string(),
  overrides: z.array(OverrideSchema),
});
export type Manifest = z.infer<typeof ManifestSchema>;

/** A flow is an ordered list of steps, each with its path relative to `/{variant}/`. */
export type FlowStep = { step: string; path: string };
export type Flows = Record<string, FlowStep[]>;

/** Everything shop-specific the shared layer needs. Lives in shops/{shop}/shop.config.ts. */
export type ShopConfig<S extends object = Record<string, unknown>> = {
  shop: ShopType;
  /** Ordered steps used by `visibleFromStep`. Must end with "payment". */
  steps: string[];
  flows: Flows;
  registry: SlotDef[];
  /** Fresh session state (an empty cart). */
  initialState: S;
  /** Pure: session state → honest base line items. No randomness, no Date.now(). */
  buildLines: (state: S) => LineItem[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- the shared layer is agnostic of each shop's state shape
export type AnyShopConfig = ShopConfig<any>;
