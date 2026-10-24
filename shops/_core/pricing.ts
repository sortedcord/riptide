import type { LineItem, Override, ShopConfig } from "./contracts";

export type PricedLine = LineItem & { selected: boolean };
export type PriceResult = { lines: PricedLine[]; total: number };
export type PricingState = { selected?: Record<string, boolean> };

/**
 * The one place totals come from:
 * shop base lines → manifest addLine/setLine → selection (session > manifest default > line default)
 * → filter to lines visible at `step` → total of selected visible lines.
 */
export function computePrice<S extends object>(
  config: Pick<ShopConfig<S>, "steps" | "registry" | "buildLines">,
  state: S,
  overrides: Override[],
  step = "payment",
): PriceResult {
  const stepIdx = (s: string) => {
    const i = config.steps.indexOf(s);
    if (i < 0) throw new Error(`[riptide] unknown step "${s}" (known: ${config.steps.join(", ")})`);
    return i;
  };
  const at = stepIdx(step);

  const lines: LineItem[] = config.buildLines(state).map((l) => ({ ...l }));
  const defaults: Record<string, boolean> = {};
  const lineKeyOf = new Map(config.registry.filter((d) => d.lineKey).map((d) => [d.id, d.lineKey!]));

  for (const o of overrides) {
    if (o.op === "addLine") lines.push({ ...o.line });
    else if (o.op === "setLine") {
      for (const l of lines) if (l.key === o.key) Object.assign(l, o.patch);
    } else if (o.op === "setDefault" && typeof o.value === "boolean" && lineKeyOf.has(o.target)) {
      defaults[lineKeyOf.get(o.target)!] = o.value;
    } else if (o.op === "insertBlock" && o.block.type === "checkbox" && o.block.lineKey) {
      defaults[o.block.lineKey] = o.block.defaultChecked;
    }
  }

  const priced: PricedLine[] = lines
    .filter((l) => stepIdx(l.visibleFromStep) <= at)
    .map((l) => ({
      ...l,
      selected: l.optional ? ((state as PricingState).selected?.[l.key] ?? defaults[l.key] ?? l.selected) : true,
    }));
  const total = Math.round(priced.reduce((t, l) => (l.selected ? t + l.amount : t), 0) * 100) / 100;
  return { lines: priced, total };
}

/** Initial checked state for an optional line, as the pricing engine sees it. */
export function lineSelected(result: PriceResult, key: string): boolean {
  return result.lines.find((l) => l.key === key)?.selected ?? false;
}
