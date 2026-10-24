import { existsSync, readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { chromium, type Browser, type Page } from "@playwright/test";
import { GateResult, MutationRecord, RecorderEvent, type Shop } from "../contracts/index.ts";
import { evalRule, finalPayment } from "../scorer/deterministic.ts";
import { p, readJson, writeJson, WORKTREES } from "../paths.ts";
import { buildShop, controlWorktree, ensureWorktree, git, serveShop } from "./serve.ts";

type Gate = GateResult["gates"][number];
type SlotDef = { id: string; step: string; kind: string; lineKey?: string };
type Ctx = { errors: string[] };
// tests/ is typechecked with DOM.Iterable, which the engine tsconfig lacks, so load it by a non-literal specifier.
// ponytail: loose types for the shared QA driver; import statically if the engine tsconfig gains DOM.Iterable.
const qa = async () => {
  const [d, h] = ["../../tests/drivers.ts", "../../tests/harness.ts"];
  const { DRIVERS } = (await import(d)) as { DRIVERS: Record<Shop, { buy(c: Ctx): Promise<void> }> };
  const { Ctx } = (await import(h)) as { Ctx: new (page: Page, shop: Shop, registry: SlotDef[]) => Ctx };
  return { DRIVERS, Ctx };
};

export const branchOf = (r: { shop: string; variantId: string }) => `variant/${r.shop}/${r.variantId}`;
export const SCOPE = (shop: string) => `shops/${shop}/`;
const TELLTALE = /trap|dark|inject|mutation|trick|fake|manipul|riptide|sandbox-test/i;
/** Existing shop plumbing that legitimately says "riptide". */
const ALLOWED_RIPTIDE = /@riptide\/core(\/server)?|data-riptide-step|riptide:/g;

const chromePath = process.env.PW_CHROMIUM ?? path.join(os.homedir(), ".cache/ms-playwright/chromium-1234/chrome-linux64/chrome");
const runId = () => "r_" + Array.from({ length: 10 }, () => "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]).join("");

/** Changed files on the variant branch relative to its merge base with master. */
export const changedFiles = (branch: string) => git(["diff", "--name-only", `master...${branch}`]).split("\n").filter(Boolean);

/** The shop's `buy` walk on a served build. `runId` goes on the first URL so the recorder logs the run. Returns console/HTTP errors. */
async function walk(browser: Browser, origin: string, shop: Shop, registry: SlotDef[], rid?: string): Promise<string[]> {
  const ctx = await browser.newContext({ baseURL: origin });
  // tsx (esbuild keepNames) wraps functions passed to page.evaluate in __name(); give the page a no-op one.
  await ctx.addInitScript("globalThis.__name = (f) => f");
  const page = await ctx.newPage();
  if (rid) {
    const goto = page.goto.bind(page);
    let first = true;
    page.goto = (url, o) => {
      if (first) { first = false; const u = new URL(url, origin); u.searchParams.set("s", rid); url = u.pathname + u.search; }
      return goto(url, o);
    };
  }
  const { DRIVERS, Ctx } = await qa();
  const c = new Ctx(page, shop, registry);
  try {
    await DRIVERS[shop].buy(c);
    await page.waitForLoadState("networkidle");
  } finally {
    await ctx.close();
  }
  return c.errors;
}

const readEvents = (rid: string) =>
  existsSync(p.recorder(rid))
    ? readFileSync(p.recorder(rid), "utf8").split("\n").filter(Boolean).map((l) => RecorderEvent.parse(JSON.parse(l)))
    : [];


/**
 * Mechanical gates for a variant: scope, build, smoke (honest buy walk), verify (pattern rules on an
 * accept-defaults walk via the flight recorder), record (schema + files match the diff), telltale.
 * Writes data/gates/{variantId}.json (and data/gates/{variantId}.a{n}.json for failed attempts).
 * `skipVerify` (or RIPTIDE_SKIP_VERIFY=1) records verify as not run, which keeps `passed` false.
 */
export async function runGates(variantId: string, opts: { attempt?: number; skipVerify?: boolean } = {}): Promise<GateResult> {
  const skipVerify = opts.skipVerify ?? process.env.RIPTIDE_SKIP_VERIFY === "1";
  const gates: Gate[] = [];
  const add = (gate: Gate["gate"], passed: boolean, detail?: string) => { gates.push({ gate, passed, ...(detail ? { detail } : {}) }); console.log(`[gates] ${variantId} ${gate}: ${passed ? "pass" : "FAIL"}${detail ? ` - ${detail.slice(0, 400)}` : ""}`); };
  const prev = existsSync(p.gate(variantId)) ? readJson(p.gate(variantId), GateResult) : null;
  const attempt = opts.attempt ?? prev?.attempt ?? 1;

  const recParse = MutationRecord.safeParse(JSON.parse(readFileSync(p.mutation(variantId), "utf8")));
  if (!recParse.success) {
    add("record", false, recParse.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
    return finish(variantId, gates, attempt);
  }
  const rec = recParse.data;
  const { shop } = rec;
  const branch = branchOf(rec);

  // Never re-point an existing worktree: mutate may still be committing on it.
  const dir = path.join(WORKTREES, variantId);
  if (!existsSync(dir)) ensureWorktree(variantId, branch);
  const head = git(["rev-parse", "HEAD"], dir);
  if (head !== rec.variantCommit) throw new Error(`worktree ${dir} is at ${head}, record says ${rec.variantCommit}`);

  // scope
  const changed = changedFiles(branch);
  const outside = changed.filter((f) => !f.startsWith(SCOPE(shop)));
  add("scope", changed.length > 0 && outside.length === 0, outside.length ? `outside ${SCOPE(shop)}: ${outside.join(", ")}` : changed.length ? undefined : "no changes");

  // telltale: added lines only
  const added = git(["diff", "-U0", `master...${branch}`]).split("\n").filter((l) => l.startsWith("+") && !l.startsWith("+++"));
  const hits = added.filter((l) => TELLTALE.test(l.replace(ALLOWED_RIPTIDE, "")));
  const badNames = changed.filter((f) => TELLTALE.test(f));
  add("telltale", !hits.length && !badNames.length, [...badNames.map((f) => `file name ${f}`), ...hits.map((l) => l.trim().slice(0, 160))].join(" | ") || undefined);

  // build
  let built = false;
  try { buildShop(dir, shop); built = true; add("build", true); } catch (e) { add("build", false, (e as Error).message.slice(-3000)); }

  // record: files match the diff (slot ids are checked against the served registry below)
  const declared = new Set(rec.patterns.flatMap((x) => x.files));
  const missing = changed.filter((f) => !declared.has(f));
  const extra = [...declared].filter((f) => !changed.includes(f));
  const recProblems = [
    ...(missing.length ? [`changed but not in any pattern's files: ${missing.join(", ")}`] : []),
    ...(extra.length ? [`listed but not changed: ${extra.join(", ")}`] : []),
  ];

  if (!built) {
    add("smoke", false, "not run: build failed");
    add("verify", false, "not run: build failed");
    add("record", !recProblems.length, recProblems.join("; ") || undefined);
    return finish(variantId, gates, attempt);
  }

  const browser = await chromium.launch({ executablePath: chromePath });
  const variant = await serveShop(dir, shop, { build: false });
  try {
    const { slots } = (await (await fetch(`${variant.origin}/api/slots`)).json()) as { slots: SlotDef[] };
    const ids = new Set(slots.map((s) => s.id));
    const unknown = [...rec.patterns.flatMap((x) => x.elementKeys), ...rec.decoys.flatMap((d) => d.elementKeys)]
      .filter((k) => !ids.has(k) && !/\.summary\.line\./.test(k));
    if (unknown.length) recProblems.push(`elementKeys not in the slot registry: ${unknown.join(", ")}`);
    add("record", !recProblems.length, recProblems.join("; ") || undefined);

    // smoke
    let smokeOk = false;
    try {
      const errors = await walk(browser, variant.origin, shop, slots);
      smokeOk = !errors.length;
      add("smoke", smokeOk, errors.length ? `reached payment but with errors: ${errors.slice(0, 10).join(" | ")}` : undefined);
    } catch (e) {
      add("smoke", false, (e as Error).message.split("\n").slice(0, 8).join(" "));
    }

    // verify
    if (skipVerify) add("verify", false, "skipped (RIPTIDE_SKIP_VERIFY); re-run `riptide gates` once the recorder is available");
    else if (!smokeOk) add("verify", false, "not run: smoke failed");
    else {
      try {
        add("verify", ...(await verify(browser, variant.origin, rec, slots)));
      } catch (e) {
        add("verify", false, (e as Error).message.slice(0, 2000));
      }
    }
  } finally {
    variant.stop();
    await browser.close();
  }
  return finish(variantId, gates, attempt);
}

async function verify(browser: Browser, origin: string, rec: MutationRecord, slots: SlotDef[]): Promise<[boolean, string]> {
  const rid = runId();
  await walk(browser, origin, rec.shop, slots, rid);
  const events = readEvents(rid);
  if (!events.length) return [false, `no recorder events in ${p.recorder(rid)} (is the flight recorder in this build?)`];

  let honestTotal: number | undefined;
  if (rec.patterns.some((x) => x.verify.some((r) => r.rule === "total_delta_from_honest"))) {
    const control = await serveShop(controlWorktree(), rec.shop);
    try {
      const hid = runId();
      await walk(browser, control.origin, rec.shop, slots, hid);
      honestTotal = finalPayment(readEvents(hid))?.total;
    } finally { control.stop(); }
    if (honestTotal === undefined) return [false, "no payment_reached on the control walk"];
  }

  const lines: string[] = [];
  let ok = true;
  for (const x of rec.patterns) for (const rule of x.verify) {
    const r = evalRule(rule, events, { honestTotal });
    ok &&= r.passed;
    lines.push(`${x.patternId} ${rule.rule}: ${r.passed ? "ok" : "FAIL"} (${r.detail})`);
  }
  return [ok, `run ${rid}${honestTotal !== undefined ? `, honest total ${honestTotal}` : ""}: ${lines.join("; ")}`];
}

function finish(variantId: string, gates: Gate[], attempt: number): GateResult {
  const all = ["scope", "build", "smoke", "verify", "record", "telltale"] as const;
  const result = GateResult.parse({ variantId, attempt, gates, passed: all.every((g) => gates.some((x) => x.gate === g && x.passed)) });
  writeJson(p.gate(variantId), result);
  if (!result.passed) writeJson(p.gate(`${variantId}.a${attempt}`), result);
  return result;
}
