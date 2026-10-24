/**
 * Riptide Arena QA suite (§9 of the shop brief). Every project (= shop) runs every test below.
 * Run: `npm test` (all shops) or `npm test -- --project=market`.
 * Never clicks `account.cancel.confirm`.
 */
import { expect, test, type APIRequestContext } from "@playwright/test";
import { existsSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { computePrice } from "../shops/_core/pricing";
import { DRIVERS } from "./drivers";
import { Ctx, ROOT, inr, manifest, type Shop, type SlotDef } from "./harness";

const shopOf = () => test.info().project.name as Shop;
const registry = async (request: APIRequestContext): Promise<SlotDef[]> => {
  const r = await request.get("/api/slots");
  expect(r.status()).toBe(200);
  return ((await r.json()) as { slots: SlotDef[] }).slots;
};
const config = async (shop: Shop) => (await import(`../shops/${shop}/shop.config`)).config;

/** Accept/decline-style pairs inferred from id names (same parent, matching last segments). */
function pairsOf(reg: SlotDef[], extra: [string, string][] = []): [string, string][] {
  const ids = new Set(reg.map((d) => d.id));
  const out: [string, string][] = [...extra];
  const rules: [RegExp, string[]][] = [
    [/^(.*)\.add$/, ["decline"]],
    [/^(.*)\.accept$/, ["decline"]],
    [/^(.*)\.keep$/, ["confirm", "continue"]],
    [/^(.*)-add$/, ["-decline"]],
  ];
  for (const id of ids)
    for (const [re, others] of rules) {
      const m = id.match(re);
      if (!m) continue;
      for (const o of others) {
        const other = o.startsWith("-") ? `${m[1]}${o}` : `${m[1]}.${o}`;
        if (ids.has(other)) out.push([id, other]);
      }
    }
  return out;
}

/** Account → cancel confirm screen, snapshotting each page. Stops before account.cancel.confirm. */
async function walkCancel(c: Ctx) {
  const d = DRIVERS[c.shop].cancel;
  if (!d) return;
  c.walk = "cancel";
  if (d.prepare) await d.prepare(c);
  await c.open("/account", "account", !d.prepare);
  for (const click of d.clicks) {
    await click(c.page).click();
    await c.page.waitForLoadState("networkidle");
    await c.snap();
  }
  await expect(c.page.locator('[data-dp="account.cancel.confirm"]')).toBeVisible();
  await c.go("cancel");
}

// App bugs: keep the test strict, add `test.fail(shopOf() === "<shop>", "<bug>")` with a comment, and log it in artifacts/QA_REPORT.md.

test.describe("§9 Riptide shop QA", () => {
  test("9.1 honest path reaches payment with the engine's expected total", async ({ page, request }) => {
    const shop = shopOf();
    const c = new Ctx(page, shop, await registry(request));
    c.walk = "buy";
    await DRIVERS[shop].buy(c);
    await expect(page.locator('[data-riptide-step="payment"]').first()).toBeVisible();

    // Price the session the browser built, independently, in Node.
    const raw = await page.evaluate((k) => sessionStorage.getItem(k), `riptide:${shop}:honest`);
    expect(raw, "session state in sessionStorage").toBeTruthy();
    const cfg = await config(shop);
    const state = { ...cfg.initialState, ...JSON.parse(raw!) };
    const expected = computePrice(cfg, state, [], "payment");
    expect(expected.lines.filter((l) => l.optional && l.selected).map((l) => l.key), "no optional extras selected").toEqual([]);
    expect(expected.total).toBeGreaterThan(0);

    const shown = inr(await page.locator('[data-dp="payment.summary.total"]').textContent());
    expect(shown).toBe(expected.total);
    const pay = c.snaps.at(-1)!;
    expect(pay.payLines.map((l) => l.key).sort()).toEqual(expected.lines.filter((l) => l.selected).map((l) => l.key).sort());
    expect(Math.round(pay.payLines.reduce((t, l) => t + l.amount, 0) * 100) / 100).toBe(shown);
  });

  test("9.2 honest invariants: nothing pre-ticked, total never rises, fees shown early, equal-weight pairs", async ({ page, request }) => {
    const shop = shopOf();
    const d = DRIVERS[shop];
    const reg = await registry(request);
    const c = new Ctx(page, shop, reg);
    c.walk = "buy";
    await d.buy(c);
    const buy = c.snaps.filter((s) => s.walk === "buy");

    // (a) No checkbox, add-on or opt-in is on by default, in the UI or in the engine.
    const ticked = buy.flatMap((s) => s.checked.map((id) => `${s.step}: ${id}`));
    expect.soft([...new Set(ticked)], "optional controls on by default").toEqual([]);
    const cfg = await config(shop);
    const engineDefaults = computePrice(cfg, cfg.initialState, [], "payment").lines.filter((l) => l.optional && l.selected);
    expect.soft(engineDefaults.map((l) => l.key), "optional lines selected by default in buildLines").toEqual([]);

    // (b) The displayed total never increases between steps (no extras were chosen on this walk).
    // Compare the total as each step is left with the total on the next step (changes made on a step are user actions).
    const totals = buy.filter((s, i) => s.total !== null && buy[i + 1]?.step !== s.step).map((s) => ({ step: s.step, total: s.total! }));
    expect.soft(totals.length, "totals seen on the walk").toBeGreaterThan(1);
    const rises = totals.slice(1).filter((t, i) => t.total > totals[i].total).map((t, i) => `${totals[i].step} ${totals[i].total} → ${t.step} ${t.total}`);
    expect.soft(rises, "total increased between steps").toEqual([]);

    // (c) Every fee/tax line on payment was already visible at the first-price step.
    const atFirst = buy.filter((s) => s.step === d.firstPriceStep);
    expect(atFirst.length, `visited first-price step "${d.firstPriceStep}"`).toBeGreaterThan(0);
    const first = { step: d.firstPriceStep, ids: atFirst.flatMap((s) => s.ids), text: atFirst.map((s) => s.text).join("\n") };
    const pay = buy.at(-1)!;
    expect(pay.step).toBe("payment");
    const late = pay.payLines
      .filter((l) => l.kind === "fee" || l.kind === "tax")
      .filter((l) => !first.ids.includes(`${first.step}.fees.${l.key}`) && !first.ids.includes(`${first.step}.summary.line.${l.key}`) && !first.text.includes(l.label))
      .map((l) => `${l.key} ("${l.label}")`);
    expect.soft(late, `fee lines on payment not visible at ${d.firstPriceStep}`).toEqual([]);

    // (d) Accept/decline pairs share data-variant wherever both render (extras walks render the conditional pairs).
    if (d.extras) await d.extras(c);
    await walkCancel(c);
    for (const [a, b] of pairsOf(reg, d.pairs)) {
      const both = c.snaps.filter((s) => a in s.variants && b in s.variants);
      expect.soft(both.length, `pair ${a} / ${b} rendered together with data-variant`).toBeGreaterThan(0);
      for (const s of both) expect.soft(s.variants[a], `${a} vs ${b} on ${s.step}`).toBe(s.variants[b]);
    }
  });

  test("9.3 every slot id renders on its declared step", async ({ page, request }) => {
    const shop = shopOf();
    const d = DRIVERS[shop];
    const reg = await registry(request);
    const c = new Ctx(page, shop, reg);
    c.walk = "buy";
    await d.buy(c);
    if (d.extras) await d.extras(c);
    await d.browse(c);
    const seen = c.seen();
    const missing = reg.filter((s) => !seen.get(s.step)?.has(s.id)).map((s) => `${s.id} (step ${s.step})`);
    expect(missing).toEqual([]);
  });

  test("9.4 _neutral-test loads and every override is visible where expected", async ({ page, request }) => {
    const shop = shopOf();
    const res = await request.get("/_neutral-test");
    expect(res.status(), "neutral manifest validates and renders").toBe(200);
    const c = new Ctx(page, shop, await registry(request), "_neutral-test");
    c.walk = "neutral";
    await DRIVERS[shop].buy(c);

    const failures: string[] = [];
    c.overrides.forEach((o, i) => {
      const v = c.snaps.map((s) => s.neutral[i]);
      const what = `${o.op} ${o.target ?? o.anchor ?? o.key ?? o.line?.key ?? o.step?.id ?? ""}`.trim();
      const bad = v.find((x) => typeof x === "string" && x.startsWith("unsupported"));
      if (bad) return failures.push(`${what}: ${bad}`);
      if (o.op === "addLine") {
        const at = new Set(v.filter((x): x is string => typeof x === "string").map((x) => x.slice(5)));
        if (!at.has("payment") || at.size < 2) failures.push(`${what}: line seen at [${[...at].join(", ")}], want payment and an earlier step`);
      } else if (o.op === "insertStep") {
        const j = v.findIndex((x) => x === `step@${o.step.id}`);
        const prev = c.snaps.slice(0, Math.max(j, 0)).reverse().find((s) => s.step !== o.step.id)?.step;
        if (j < 0) failures.push(`${what}: inserted step never shown`);
        else if (prev !== o.after) failures.push(`${what}: shown after "${prev}", want after "${o.after}"`);
      } else if (!v.includes(true)) failures.push(`${what}: not visible on any visited step (${[...new Set(c.snaps.map((s) => s.step))].join(", ")})`);
    });
    expect(failures).toEqual([]);
  });

  test("9.5 cancel flow: confirm reachable in ≤2 clicks from account (never clicked)", async ({ page, request }) => {
    const shop = shopOf();
    const d = DRIVERS[shop];
    test.skip(!d.cancel, `${shop} has no cancel flow`);
    const c = new Ctx(page, shop, await registry(request));
    if (d.cancel!.prepare) await d.cancel!.prepare(c);
    else await page.goto(c.url("?reset=1"));
    await c.open("/account", "account");
    const confirm = page.locator('[data-dp="account.cancel.confirm"]');
    let clicks = 0;
    for (const click of d.cancel!.clicks) {
      if (await confirm.isVisible()) break;
      await click(page).click();
      clicks++;
      await page.waitForLoadState("networkidle");
    }
    expect(clicks).toBeLessThanOrEqual(2);
    await expect(confirm).toBeVisible();
    await expect(confirm).toBeEnabled();
    expect(await confirm.evaluate((e) => e.tagName)).toMatch(/^(BUTTON|A)$/);
    await c.snap();
  });

  test("9.6 no console errors or failed requests on any visited page; screenshots saved", async ({ browser, page, request }) => {
    const shop = shopOf();
    const d = DRIVERS[shop];
    const reg = await registry(request);
    const dir = path.join(ROOT, "artifacts/screens/qa", shop);
    rmSync(dir, { recursive: true, force: true });
    const c = new Ctx(page, shop, reg, "honest", dir);
    c.walk = "buy";
    await d.buy(c);
    if (d.extras) await d.extras(c);
    await d.browse(c);
    await walkCancel(c);
    const np = await browser.newPage({ baseURL: test.info().project.use.baseURL });
    const n = new Ctx(np, shop, reg, "_neutral-test", dir);
    n.walk = "neutral";
    await d.buy(n);
    await np.close();
    expect([...c.errors, ...n.errors]).toEqual([]);
  });

  test("9.7a engine: unknown variant returns 404", async ({ request }) => {
    const r = await request.get("/qa-no-such-variant");
    expect(r.status()).toBe(404);
  });

  test("9.7b engine: an invalid manifest fails with a [riptide] error", async ({ request }) => {
    const shop = shopOf();
    const variant = `qa-invalid-${process.pid}-${Date.now()}`;
    const file = path.join(ROOT, "shops", shop, "manifests", `${variant}.json`);
    const log = path.join(os.tmpdir(), "riptide-qa-logs", `${shop}.log`);
    const before = existsSync(log) ? statSync(log).size : 0;
    const bad = { shopType: shop, variant, author: "qa", overrides: [{ op: "setText", target: "qa.no-such.target", value: "x" }] };
    try {
      writeFileSync(file, JSON.stringify(bad));
      const r = await request.get(`/${variant}`);
      expect(r.status()).toBe(500);
      const body = await r.text();
      // Production builds redact server error messages from the page, so also read the server log.
      let logged = "";
      await expect
        .poll(() => {
          logged = existsSync(log) ? readFileSync(log, "utf8").slice(before) : "";
          return body.includes("[riptide]") || (logged.includes("[riptide]") && logged.includes(variant));
        }, { message: `"[riptide]" in the error page or in ${log} (start the servers via this config so the log exists)`, timeout: 10_000 })
        .toBe(true);
    } finally {
      rmSync(file, { force: true });
    }
    expect(existsSync(file)).toBe(false);
    expect(manifest(shop, "_neutral-test").overrides.length).toBeGreaterThan(0); // manifests dir intact
  });
});
