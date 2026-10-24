import { DP_ID_RE, ManifestSchema, type Block, type Flows, type Manifest, type Override, type SlotDef } from "./contracts";

export type SlotOverrides = {
  text?: string;
  variant?: string;
  defaultValue?: boolean | string | number;
  attrs: Record<string, string>;
  hidden: boolean;
  order?: string[];
  before: Block[];
  after: Block[];
  inside: Block[];
};

export type OverrideIndex = Record<string, SlotOverrides>;

const empty = (): SlotOverrides => ({ attrs: {}, hidden: false, before: [], after: [], inside: [] });

/** Group element-level overrides by target id. Later overrides win. */
export function indexOverrides(overrides: Override[]): OverrideIndex {
  const idx: OverrideIndex = {};
  const at = (id: string) => (idx[id] ??= empty());
  for (const o of overrides) {
    switch (o.op) {
      case "setText": at(o.target).text = o.value; break;
      case "setVariant": at(o.target).variant = o.variant; break;
      case "setDefault": at(o.target).defaultValue = o.value; break;
      case "setAttr": at(o.target).attrs[o.attr] = o.value; break;
      case "hide": at(o.target).hidden = true; break;
      case "reorder": at(o.target).order = o.order; break;
      case "insertBlock": at(o.anchor)[o.position].push(o.block); break;
    }
  }
  return idx;
}

const BANNED = /(trap|fake|dark|honest|manipul|trick)/;

/** Throws on a bad registry (wrong id format, duplicate, revealing names). */
export function validateRegistry(registry: SlotDef[]): void {
  const seen = new Set<string>();
  for (const d of registry) {
    if (!DP_ID_RE.test(d.id)) throw new Error(`[riptide] slot id "${d.id}" must look like step.section.element`);
    if (BANNED.test(d.id)) throw new Error(`[riptide] slot id "${d.id}" must not reveal intent`);
    if (seen.has(d.id)) throw new Error(`[riptide] duplicate slot id "${d.id}"`);
    seen.add(d.id);
  }
}

/** zod-parse a manifest and check every reference against the shop's registry and flows. Throws loudly. */
export function validateManifest(raw: unknown, ctx: { shop: string; variant: string; registry: SlotDef[]; flows: Flows; steps: string[] }): Manifest {
  const parsed = ManifestSchema.safeParse(raw);
  const where = `manifests/${ctx.variant}.json`;
  if (!parsed.success) {
    throw new Error(`[riptide] invalid manifest ${where}:\n${parsed.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n")}`);
  }
  const m = parsed.data;
  const errors: string[] = [];
  if (m.shopType !== ctx.shop) errors.push(`shopType "${m.shopType}" does not match shop "${ctx.shop}"`);
  if (m.variant !== ctx.variant) errors.push(`variant "${m.variant}" does not match file name "${ctx.variant}"`);

  const known = new Set(ctx.registry.map((d) => d.id));
  const blockIds = new Set<string>();
  for (const o of m.overrides) {
    if (o.op === "insertBlock") {
      if (known.has(o.block.id) || blockIds.has(o.block.id)) errors.push(`block id "${o.block.id}" collides with an existing id`);
      blockIds.add(o.block.id);
    }
  }
  const check = (id: string, what: string) => {
    if (!known.has(id) && !blockIds.has(id)) errors.push(`${what} "${id}" is not in the slot registry`);
  };
  m.overrides.forEach((o, i) => {
    const w = `overrides[${i}] ${o.op}`;
    if ("target" in o) check(o.target, `${w} target`);
    if (o.op === "insertBlock") check(o.anchor, `${w} anchor`);
    if (o.op === "reorder") o.order.forEach((id) => check(id, `${w} order item`));
    if (o.op === "addLine") {
      if (!ctx.steps.includes(o.line.visibleFromStep)) errors.push(`${w}: unknown visibleFromStep "${o.line.visibleFromStep}"`);
    }
    if (o.op === "setLine" && o.patch.visibleFromStep && !ctx.steps.includes(o.patch.visibleFromStep)) {
      errors.push(`${w}: unknown visibleFromStep "${o.patch.visibleFromStep}"`);
    }
    if (o.op === "insertStep") {
      const flow = ctx.flows[o.flow];
      if (!flow) errors.push(`${w}: unknown flow "${o.flow}" (known: ${Object.keys(ctx.flows).join(", ")})`);
      else if (!flow.some((s) => s.step === o.after)) errors.push(`${w}: flow "${o.flow}" has no step "${o.after}"`);
    }
  });
  if (errors.length) throw new Error(`[riptide] manifest ${where} for ${ctx.shop} failed validation:\n  ${errors.join("\n  ")}`);
  return m;
}
