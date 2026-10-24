import { expect, type Page } from "@playwright/test";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";

export const SHOPS = ["market", "food", "air", "saas", "ott"] as const;
export type Shop = (typeof SHOPS)[number];
export const ROOT = path.resolve(__dirname, "..");

export type SlotDef = { id: string; step: string; kind: string; lineKey?: string };
export type Override = Record<string, any> & { op: string };
export type Manifest = { overrides: Override[] };

export const manifest = (shop: Shop, variant: string): Manifest =>
  JSON.parse(readFileSync(path.join(ROOT, "shops", shop, "manifests", `${variant}.json`), "utf8"));

export const inr = (s: string | null | undefined) => Number((s ?? "").replace(/[^\d.-]/g, ""));

export type Snapshot = {
  walk: string;
  step: string;
  url: string;
  ids: string[];
  variants: Record<string, string>;
  total: number | null;
  /** Optional controls (lineKey slots, checkbox slots, any checkbox in <main>) that are on. */
  checked: string[];
  text: string;
  payLines: { key: string; kind: string; label: string; amount: number }[];
  /** _neutral-test only: which manifest overrides are satisfied on this page. */
  neutral: (boolean | string)[];
};

/**
 * Per-test recorder: console errors, failed requests, and one snapshot per visited step.
 * `go(step)` waits for a step, transparently passing any manifest-inserted step on the way.
 */
export class Ctx {
  snaps: Snapshot[] = [];
  errors: string[] = [];
  walk = "walk";
  private n = 0;
  readonly overrides: Override[];
  readonly inserted: { id: string; continueText: string }[];

  constructor(
    readonly page: Page,
    readonly shop: Shop,
    readonly registry: SlotDef[],
    readonly variant = "honest",
    readonly shotDir?: string,
  ) {
    this.overrides = variant === "honest" ? [] : manifest(shop, variant).overrides;
    this.inserted = this.overrides.filter((o) => o.op === "insertStep").map((o) => o.step);
    page.on("console", (m) => { if (m.type() === "error") this.errors.push(`console: ${m.text()} @ ${page.url()}`); });
    page.on("pageerror", (e) => this.errors.push(`pageerror: ${e.message} @ ${page.url()}`));
    page.on("response", (r) => { if (r.status() >= 400) this.errors.push(`HTTP ${r.status()} ${r.request().method()} ${r.url()}`); });
    page.on("requestfailed", (r) => {
      const why = r.failure()?.errorText ?? "";
      // Next.js aborts in-flight RSC prefetches when the page navigates on; that is not a failed request.
      if (why.includes("ERR_ABORTED")) return;
      this.errors.push(`request failed: ${why} ${r.method()} ${r.url()}`);
    });
    if (shotDir) mkdirSync(shotDir, { recursive: true });
  }

  url(p = "") { return `/${this.variant}${p}`; }

  /** Navigate to a path under the variant (adds ?reset=1 when asked) and snapshot the step. */
  async open(p: string, step: string, reset = false) {
    await this.page.goto(this.url(p) + (reset ? (p.includes("?") ? "&reset=1" : "?reset=1") : ""));
    return this.go(step);
  }

  /** Wait until `step` is on screen (clicking through inserted steps), then snapshot it. */
  async go(step: string): Promise<Snapshot> {
    const sel = [step, ...this.inserted.map((s) => s.id)].map((s) => `[data-riptide-step="${s}"]`).join(", ");
    for (let hops = 0; hops < 3; hops++) {
      await this.page.locator(sel).first().waitFor();
      let ins: { id: string; continueText: string } | undefined;
      for (const s of this.inserted) if (s.id !== step && (await this.page.locator(`[data-riptide-step="${s.id}"]`).count())) ins = s;
      if (!ins) break;
      await this.snap();
      await this.page.locator(`[data-riptide-step="${ins.id}"]`).getByRole("link", { name: ins.continueText, exact: true }).click();
      await this.page.locator(`[data-riptide-step="${ins.id}"]`).waitFor({ state: "detached" });
    }
    await expect(this.page.locator(`[data-riptide-step="${step}"]`).first()).toBeVisible();
    return this.snap();
  }

  async snap(): Promise<Snapshot> {
    await this.page.waitForLoadState("networkidle");
    const watch = this.registry.filter((d) => d.lineKey || d.kind === "checkbox").map((d) => d.id);
    const regStep = Object.fromEntries(this.registry.map((d) => [d.id, d.step]));
    const s = await this.page.evaluate(([watch, ovs, regStep]) => {
      const q = (id: string) => document.querySelector<HTMLElement>(`[data-dp="${CSS.escape(id)}"]`);
      const step = document.querySelector("[data-riptide-step]")?.getAttribute("data-riptide-step") ?? "";
      const els = [...document.querySelectorAll<HTMLElement>("[data-dp]")];
      const variants: Record<string, string> = {};
      for (const e of els) if (e.hasAttribute("data-variant")) variants[e.dataset.dp!] = e.getAttribute("data-variant")!;
      const ON = ":checked, [aria-checked=true], [aria-pressed=true]";
      const checked = [...document.querySelectorAll<HTMLInputElement>("main input[type=checkbox]:checked")]
        .map((e) => e.closest<HTMLElement>("[data-dp]")?.dataset.dp ?? `#${e.id || e.name || "checkbox"}`);
      // A pressed "No, thanks"/"Keep" inside an add-on card is the honest default, not an opt-in.
      const isNo = (e: Element) => /[.-](decline|keep)$|option-none$/.test(e.closest<HTMLElement>("[data-dp]")?.dataset.dp ?? "");
      for (const id of watch) for (const e of document.querySelectorAll(`[data-dp="${CSS.escape(id)}"]`))
        if ([e, ...e.querySelectorAll(ON)].some((x) => x.matches(ON) && !isNo(x))) checked.push(id);
      const tot = document.querySelector(`[data-dp="${step}.summary.total"], [data-dp="${step}.bill.total"]`);
      const payLines = [...document.querySelectorAll<HTMLElement>('[data-dp^="payment.summary.line."]')].map((e) => ({
        key: e.dataset.dp!.slice("payment.summary.line.".length),
        kind: e.dataset.kind ?? "",
        label: (e.firstElementChild?.childNodes[0]?.textContent ?? "").trim(),
        amount: Number((e.lastElementChild?.textContent ?? "").replace(/[^\d.-]/g, "")),
      }));
      const text = (document.querySelector("main") ?? document.body).innerText;
      const seenLine = (key: string, label: string) =>
        [...document.querySelectorAll(`[data-dp$=".summary.line.${key}"], [data-dp$=".fees.${key}"]`)].some((e) => (e.textContent ?? "").includes(label));
      // One verdict per override: true/false, or a string tag for checks aggregated across pages.
      const neutral = (ovs as any[]).map((o): boolean | string => {
        switch (o.op) {
          case "setText": return q(o.target)?.textContent?.trim() === o.value;
          case "setVariant": return q(o.target)?.getAttribute("data-variant") === o.variant;
          case "setAttr": return q(o.target)?.getAttribute(o.attr) === o.value;
          case "hide": return (regStep as Record<string, string>)[o.target] === step && !q(o.target);
          case "reorder": {
            const kids = [...(q(o.target)?.children ?? [])].map((k) => k.getAttribute("data-dp"));
            const idx = (o.order as string[]).map((i) => kids.indexOf(i));
            return idx.length > 0 && idx.every((v, i) => v >= 0 && (i === 0 || v > idx[i - 1]));
          }
          case "setDefault": {
            const c = q(o.target);
            if (!c) return false;
            if (typeof o.value === "boolean") return (c.matches(ON) || !!c.querySelector(ON)) === o.value;
            return !!c.querySelector(`#rt-tab-${CSS.escape(String(o.value))}[aria-selected=true]`)
              || [...c.querySelectorAll<HTMLInputElement>(":checked")].some((i) => i.value === String(o.value));
          }
          case "addLine": return seenLine(o.line.key, o.line.label) ? `line@${step}` : false;
          case "setLine": return o.patch.label ? seenLine(o.key, o.patch.label) : !!document.querySelector(`[data-dp$=".summary.line.${o.key}"]`);
          case "insertBlock": {
            const b = q(o.block.id), a = q(o.anchor);
            if (!b || !a || b.getClientRects().length === 0) return false;
            if (o.block.text && !(b.textContent ?? "").includes(o.block.text)) return false;
            if (o.position === "inside") return a.contains(b) && a !== b;
            if (a.contains(b)) return false;
            return o.position === "after"
              ? !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING)
              : !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_PRECEDING);
          }
          case "insertStep": return step === o.step.id && text.includes(o.step.title) ? `step@${step}` : false;
          case "setHead":
            return Object.entries(o.meta ?? {}).every(([k, v]) => document.querySelector(`meta[name="${k}"]`)?.getAttribute("content") === v)
              && (!o.jsonLd || [...document.querySelectorAll('script[type="application/ld+json"]')].some((s) => s.textContent?.includes(JSON.stringify(o.jsonLd))));
          default: return `unsupported op ${o.op}`;
        }
      });
      return { step, ids: els.map((e) => e.dataset.dp!), variants, total: tot ? Number((tot.textContent ?? "").replace(/[^\d.-]/g, "")) : null, checked, text, payLines, neutral };
    }, [watch, this.overrides, regStep] as const);
    const snap: Snapshot = { ...s, walk: this.walk, url: this.page.url() };
    this.snaps.push(snap);
    if (this.shotDir) {
      const name = `${String(++this.n).padStart(2, "0")}-${this.walk}-${snap.step || "page"}.png`;
      await this.page.screenshot({ path: path.join(this.shotDir, name) });
    }
    return snap;
  }

  /** data-dp ids seen per data-riptide-step across every snapshot. */
  seen() {
    const m = new Map<string, Set<string>>();
    for (const s of this.snaps) {
      const set = m.get(s.step) ?? new Set<string>();
      s.ids.forEach((i) => set.add(i));
      m.set(s.step, set);
    }
    return m;
  }
}
