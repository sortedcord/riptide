import { z } from "zod";

/** Every artifact the engine reads or writes. One file so every stage shares the exact same shapes. */

export const SHOPS = ["market", "food", "air", "saas", "ott"] as const;
export const Shop = z.enum(SHOPS);
export type Shop = z.infer<typeof Shop>;

/** India's 13 dark patterns (CCPA Guidelines for Prevention and Regulation of Dark Patterns, 2023). See docs/TAXONOMY.md. */
export const CCPA_CATEGORIES = [
  "false_urgency", "basket_sneaking", "confirm_shaming", "forced_action", "subscription_trap",
  "interface_interference", "bait_and_switch", "drip_pricing", "disguised_ads", "nagging",
  "trick_question", "saas_billing", "rogue_malware",
] as const;
/** Agent-targeted variants, scored with the CCPA track. `exp_prompt_injection` is scored on its own track. */
export const EXPERIMENTAL_CATEGORIES = ["exp_dom_visual_mismatch", "exp_misleading_a11y_label", "exp_prompt_injection"] as const;
export const Category = z.enum([...CCPA_CATEGORIES, ...EXPERIMENTAL_CATEGORIES]);
export type Category = z.infer<typeof Category>;

const Id = z.string().regex(/^[a-z0-9_-]+$/);
const Inr = z.number();

// ------------------------------------------------------------------ recorder (written by the shops)

/** A priced line exactly as the shop's pricing engine outputs it (subset of core LineItem). */
export const Line = z.object({ key: z.string(), label: z.string(), amount: Inr, kind: z.string().optional(), selected: z.boolean().optional() });
export type Line = z.infer<typeof Line>;

export const RecorderEventBody = z.discriminatedUnion("type", [
  z.object({ type: z.literal("page_view"), step: z.string(), path: z.string() }),
  z.object({ type: z.literal("click"), key: z.string() }),
  z.object({ type: z.literal("toggle"), key: z.string(), value: z.union([z.boolean(), z.string(), z.number()]) }),
  z.object({ type: z.literal("cart_change"), step: z.string(), lines: z.array(Line), total: Inr }),
  z.object({ type: z.literal("form_submit"), step: z.string(), fields: z.array(z.string()) }),
  z.object({ type: z.literal("payment_reached"), lines: z.array(Line), total: Inr }),
  z.object({ type: z.literal("cancel_confirm_reached"), step: z.string() }),
  /** State a shop exposes for subscription_state rules, e.g. { plan: "all", status: "active" }. */
  z.object({ type: z.literal("subscription"), state: z.string() }),
]);
export type RecorderEventBody = z.infer<typeof RecorderEventBody>;
/** What the shop's POST /api/e stores: the body plus server-side fields. */
export const RecorderEvent = z.intersection(RecorderEventBody, z.object({ runId: z.string(), t: z.number() }));
export type RecorderEvent = z.infer<typeof RecorderEvent>;

// ------------------------------------------------------------------ verify rules (gates + scorer)

export const VerifyRule = z.discriminatedUnion("rule", [
  z.object({ rule: z.literal("line_present"), lineKey: z.string() }),
  z.object({ rule: z.literal("line_absent"), lineKey: z.string() }),
  z.object({ rule: z.literal("total_at_most"), inr: Inr }),
  /** Final total minus the honest total for the same task, inclusive bounds. */
  z.object({ rule: z.literal("total_delta_from_honest"), min: Inr, max: Inr }),
  z.object({ rule: z.literal("element_toggled"), key: z.string(), value: z.union([z.boolean(), z.string(), z.number()]) }),
  z.object({ rule: z.literal("element_clicked"), key: z.string() }),
  /** e.g. "never accepted the retention offer" in a cancel flow. */
  z.object({ rule: z.literal("element_not_clicked"), key: z.string() }),
  z.object({ rule: z.literal("step_reached"), step: z.string() }),
  z.object({ rule: z.literal("subscription_state"), state: z.string() }),
]);
export type VerifyRule = z.infer<typeof VerifyRule>;

// ------------------------------------------------------------------ trickster output

export const HARM_KINDS = ["extra_charge", "unwanted_item", "unwanted_subscription", "data_shared", "wrong_item", "other"] as const;

export const Pattern = z.object({
  patternId: z.string().regex(/^p\d+$/),
  category: Category,
  subtype: z.string().optional(),
  description: z.string(),
  step: z.string(),
  /** Filled by the engine from git. */
  files: z.array(z.string()),
  /** Filled by the engine from git. */
  diffHunks: z.array(z.string()),
  /** Slot ids (data-dp) of affected elements. */
  elementKeys: z.array(z.string()),
  visibleEvidence: z.string(),
  expectedHarm: z.object({ kind: z.enum(HARM_KINDS), amountInr: Inr.optional(), lineKey: z.string().optional() }),
  /** Conditions that hold after an "accept all defaults" run; proves the pattern does something. */
  verify: z.array(VerifyRule).min(1),
});
export type Pattern = z.infer<typeof Pattern>;

export const Decoy = z.object({ decoyId: z.string().regex(/^d\d+$/), description: z.string(), elementKeys: z.array(z.string()), lineKey: z.string().optional() });
export type Decoy = z.infer<typeof Decoy>;

export const MutationRecord = z.object({
  variantId: z.string().regex(/^v_[a-z0-9]{6}$/),
  shop: Shop,
  baseCommit: z.string(),
  variantCommit: z.string(),
  tricksterVersion: z.string(),
  createdAt: z.string(),
  patterns: z.array(Pattern).min(1).max(5),
  decoys: z.array(Decoy),
  notes: z.string().optional(),
});
export type MutationRecord = z.infer<typeof MutationRecord>;

export const Task = z.object({
  taskId: Id,
  variantId: z.string(),
  goal: z.string(),
  persona: z.string().optional(),
  /** Path relative to the shop origin where the agent starts, e.g. "/honest/pricing". */
  startPath: z.string().startsWith("/"),
  constraints: z.object({
    budgetInr: Inr.optional(),
    mustInclude: z.array(z.string()).optional(),
    mustExclude: z.array(z.string()).optional(),
    /** Line keys of add-ons the user explicitly wants (makes a decoy the right choice). */
    wantsAddOns: z.array(z.string()).optional(),
  }),
  stopCondition: z.enum(["payment_page", "before_cancel_confirm"]),
});
export type Task = z.infer<typeof Task>;

/** What the Trickster model writes to trickster-output.json; git fields are added by the engine. */
export const TricksterOutput = z.object({
  patterns: z.array(Pattern.omit({ files: true, diffHunks: true })).min(1).max(5),
  decoys: z.array(Decoy),
  tasks: z.array(Task.omit({ variantId: true })).min(1).max(3),
  notes: z.string().optional(),
});
export type TricksterOutput = z.infer<typeof TricksterOutput>;

export const GateResult = z.object({
  variantId: z.string(),
  passed: z.boolean(),
  gates: z.array(z.object({ gate: z.enum(["scope", "build", "smoke", "verify", "record", "telltale"]), passed: z.boolean(), detail: z.string().optional() })),
  attempt: z.number(),
});
export type GateResult = z.infer<typeof GateResult>;

// ------------------------------------------------------------------ rubric (private)

export const RubricCheck = z.object({
  checkId: z.string(),
  /** What the check measures. avoidance = a pattern's harm; completion / budget / decoy_wanted = task success. */
  kind: z.enum(["avoidance", "completion", "budget", "decoy_wanted"]),
  patternId: z.string().optional(),
  decoyId: z.string().optional(),
  category: Category.optional(),
  description: z.string(),
  /** All rules must hold on the agent's run for the check to pass. */
  rules: z.array(VerifyRule).min(1),
});
export type RubricCheck = z.infer<typeof RubricCheck>;

export const Rubric = z.object({ variantId: z.string(), taskId: z.string(), checks: z.array(RubricCheck) });
export type Rubric = z.infer<typeof Rubric>;

// ------------------------------------------------------------------ suite

export const Suite = z.object({
  suiteId: z.string().regex(/^riptide-suite-\d+\.\d+\.\d+$/),
  createdAt: z.string(),
  items: z.array(z.object({
    shop: Shop,
    /** "control" for the honest master build. */
    variantId: z.string(),
    branch: z.string(),
    commit: z.string(),
    tricksterVersion: z.string().nullable(),
    taskIds: z.array(z.string()),
  })),
});
export type Suite = z.infer<typeof Suite>;

// ------------------------------------------------------------------ agent boundary

export const AgentReport = z.object({
  outcome: z.enum(["reached_payment", "stopped_early", "gave_up"]),
  cart: z.array(z.object({ item: z.string(), priceInr: Inr })),
  totalInr: Inr,
  concerns: z.array(z.object({ where: z.string(), what: z.string(), action: z.enum(["avoided", "accepted", "flagged_for_human"]) })),
  askUser: z.array(z.string()).optional(),
});
export type AgentReport = z.infer<typeof AgentReport>;

export const Run = z.object({
  runId: z.string(),
  suiteId: z.string(),
  agentId: z.string(),
  agentCardUrl: z.string(),
  variantId: z.string(),
  taskId: z.string(),
  repeat: z.number(),
  startUrl: z.string(),
  startedAt: z.string(),
  endedAt: z.string(),
  status: z.enum(["completed", "timeout", "error"]),
  error: z.string().optional(),
  /** Untrusted. Evidence for awareness only. null when missing or malformed. */
  report: AgentReport.nullable(),
});
export type Run = z.infer<typeof Run>;

// ------------------------------------------------------------------ scoring

export const RunScore = z.object({
  runId: z.string(),
  agentId: z.string(),
  variantId: z.string(),
  taskId: z.string(),
  repeat: z.number(),
  completed: z.boolean(),
  finalTotalInr: Inr.nullable(),
  honestTotalInr: Inr.nullable(),
  overpaymentInr: Inr.nullable(),
  checks: z.array(z.object({ checkId: z.string(), kind: RubricCheck.shape.kind, category: Category.optional(), passed: z.boolean(), detail: z.string() })),
  /** Filled by the LLM judge (pass 2). */
  awareness: z.number().min(0).max(1).nullable(),
  escalation: z.number().min(0).max(1).nullable(),
});
export type RunScore = z.infer<typeof RunScore>;

const Sub = z.number().min(0).max(100).nullable();
export const Rating = z.object({
  suiteId: z.string(),
  agentId: z.string(),
  createdAt: z.string(),
  weights: z.record(z.string(), z.number()),
  subScores: z.object({ avoidance: Sub, completion: Sub, awareness: Sub, falsePositiveControl: Sub, escalation: Sub }),
  overall: z.number().min(0).max(100),
  stars: z.number().int().min(1).max(5),
  /** Min/max overall across repeats. */
  range: z.object({ min: z.number(), max: z.number() }),
  byCategory: z.record(z.string(), z.object({ caught: z.number(), total: z.number() })),
  experimental: z.record(z.string(), z.object({ caught: z.number(), total: z.number() })),
  avgOverpaymentInr: Inr,
  insights: z.object({ weaknesses: z.array(z.string()), reliablyCaught: z.array(z.string()), flips: z.array(z.string()) }),
  evidence: z.array(z.object({ runId: z.string(), recorder: z.string(), a2a: z.string() })),
  notes: z.array(z.string()).default([]),
});
export type Rating = z.infer<typeof Rating>;

export const Lesson = z.object({
  suiteId: z.string(),
  createdAt: z.string(),
  lessons: z.array(z.object({ observation: z.string(), evidence: z.array(z.string()), category: Category.optional() })),
  gateFailures: z.array(z.object({ variantId: z.string(), reason: z.string() })),
});
export type Lesson = z.infer<typeof Lesson>;
