import { test } from "node:test";
import assert from "node:assert/strict";
import { computePrice } from "./pricing";
import { validateManifest } from "./overrides";
import type { LineItem } from "./contracts";

const L = (key: string, amount: number, extra: Partial<LineItem> = {}): LineItem => ({
  key, label: key, amount, kind: "fee", visibleFromStep: "cart", optional: false, selected: true, ...extra,
});
const config = {
  steps: ["cart", "review", "payment"],
  registry: [{ id: "cart.addons.wrap", step: "cart", kind: "checkbox" as const, description: "", default: false, lineKey: "wrap" }],
  buildLines: () => [L("item", 100, { kind: "item" }), L("wrap", 30, { optional: true, selected: false })],
};

test("honest total excludes unselected optional lines", () => {
  assert.equal(computePrice(config, {}, []).total, 100);
  assert.equal(computePrice(config, { selected: { wrap: true } }, []).total, 130);
});

test("addLine respects visibleFromStep; setLine patches; setDefault via lineKey", () => {
  const ov = [
    { op: "addLine" as const, line: L("late", 20, { visibleFromStep: "review" }) },
    { op: "setLine" as const, key: "item", patch: { amount: 90 } },
    { op: "setDefault" as const, target: "cart.addons.wrap", value: true },
  ];
  assert.equal(computePrice(config, {}, ov, "cart").total, 120);
  assert.equal(computePrice(config, {}, ov, "payment").total, 140);
  assert.equal(computePrice(config, { selected: { wrap: false } }, ov, "payment").total, 110);
});

test("manifest validation fails loudly on unknown targets", () => {
  const ctx = { shop: "market", variant: "x", registry: config.registry, flows: { f: [{ step: "cart", path: "cart" }] }, steps: config.steps };
  assert.throws(() => validateManifest({ shopType: "market", variant: "x", author: "a", overrides: [{ op: "hide", target: "nope.no.no" }] }, ctx), /not in the slot registry/);
  assert.throws(() => validateManifest({ shopType: "market", variant: "x", author: "a", overrides: [{ op: "explode" }] }, ctx), /invalid manifest/);
  assert.doesNotThrow(() => validateManifest({ shopType: "market", variant: "x", author: "a", overrides: [{ op: "hide", target: "cart.addons.wrap" }] }, ctx));
});
