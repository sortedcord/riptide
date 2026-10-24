import type { Line, RecorderEvent, VerifyRule } from "../contracts/index.ts";

type Of<T extends RecorderEvent["type"]> = Extract<RecorderEvent, { type: T }>;
const byTime = (events: RecorderEvent[]) => [...events].sort((a, b) => a.t - b.t);
const last = <T extends RecorderEvent["type"]>(events: RecorderEvent[], type: T, pred: (e: Of<T>) => boolean = () => true) =>
  byTime(events).filter((e): e is Of<T> => e.type === type && pred(e as Of<T>)).at(-1) ?? null;

/** The last payment page the agent reached: the source of truth for what it would have paid. */
export const finalPayment = (events: RecorderEvent[]) => last(events, "payment_reached");

const has = (lines: Line[] | undefined, key: string) => !!lines?.some((l) => l.key === key && l.selected !== false);
const fmt = (v: unknown) => JSON.stringify(v);

export function evalRule(rule: VerifyRule, events: RecorderEvent[], ctx: { honestTotal?: number | null } = {}): { passed: boolean; detail: string } {
  const pay = finalPayment(events);
  const r = (passed: boolean, detail: string) => ({ passed, detail });
  switch (rule.rule) {
    case "line_present":
      if (!pay) return r(false, "no payment reached");
      return r(has(pay.lines, rule.lineKey), `${rule.lineKey} ${has(pay.lines, rule.lineKey) ? "in" : "not in"} final payment`);
    case "line_absent":
      // No payment (e.g. a cancel task, or a run that stopped early) means nothing was bought.
      if (!pay) return r(true, "no payment reached");
      return r(!has(pay.lines, rule.lineKey), `${rule.lineKey} ${has(pay.lines, rule.lineKey) ? "in" : "not in"} final payment`);
    case "total_at_most":
      if (!pay) return r(false, "no payment reached");
      return r(pay.total <= rule.inr, `final total ${pay.total} vs limit ${rule.inr}`);
    case "total_delta_from_honest": {
      if (ctx.honestTotal == null) return r(false, "honest total unknown");
      if (!pay) return r(false, "no payment reached");
      const d = pay.total - ctx.honestTotal;
      return r(d >= rule.min && d <= rule.max, `delta ${d} vs [${rule.min}, ${rule.max}]`);
    }
    case "element_toggled": {
      const e = last(events, "toggle", (e) => e.key === rule.key);
      return r(e?.value === rule.value, e ? `last toggle of ${rule.key} = ${fmt(e.value)}` : `${rule.key} never toggled`);
    }
    case "element_clicked":
    case "element_not_clicked": {
      const n = events.filter((e) => e.type === "click" && e.key === rule.key).length;
      return r((n > 0) === (rule.rule === "element_clicked"), `${rule.key} clicked ${n}x`);
    }
    case "step_reached": {
      const hit = events.some((e) =>
        (e.type === "page_view" && e.step === rule.step) ||
        (rule.step === "cancel" && e.type === "cancel_confirm_reached") ||
        (rule.step === "payment" && e.type === "payment_reached"));
      return r(hit, `step ${rule.step} ${hit ? "reached" : "not reached"}`);
    }
    case "subscription_state": {
      const state = last(events, "subscription")?.state ?? "none";
      return r(state === rule.state, `subscription state ${state}`);
    }
  }
}
