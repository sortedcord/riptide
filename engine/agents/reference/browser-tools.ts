import type { Page } from "playwright";
import { z } from "zod";
import type { Tool } from "../../llm.ts";
import type { Trace } from "./trace.ts";

/** The browser: a TinyFish remote session, any CDP browser, or local Chromium (see engine/tinyfish.ts). */
export { launchBrowser } from "../../tinyfish.ts";

const SNAPSHOT_MAX = 40_000;

/**
 * Tools over one page. Snapshots are Playwright's AI-mode aria snapshot: roles, accessible names, states,
 * values and visible text with `[ref=eN]` handles; no DOM attributes (data-dp, data-riptide-step) leak.
 * Refs resolve against the latest snapshot, and every action returns a fresh one.
 */
export function browserTools(page: Page, opts: { startUrl: string; maxSteps: number; trace?: Trace }) {
  const origin = new URL(opts.startUrl).origin;
  const trace = opts.trace;
  let steps = 0;

  const settle = async () => {
    await page.waitForLoadState("domcontentloaded").catch(() => {});
    await page.waitForLoadState("networkidle", { timeout: 3000 }).catch(() => {});
  };
  const snapshot = async () => {
    await settle();
    let s = (await page.ariaSnapshot({ mode: "ai" }))
      .split("\n")
      .filter((l) => !/^\s*- generic( \[active\])? \[ref=\w+\]:$/.test(l)) // bare layout wrappers
      .map((l) => l.replace(/- generic \[ref=\w+\]: /, "- text: ").replace(" [cursor=pointer]", ""))
      .join("\n");
    // ponytail: hard cut; a page bigger than this loses its tail. Add per-region paging if a shop needs it.
    if (s.length > SNAPSHOT_MAX) s = s.slice(0, SNAPSHOT_MAX) + "\n… (page truncated)";
    const u = new URL(page.url());
    return `URL: ${u.pathname}${u.search}\nTitle: ${await page.title()}\n${s}`;
  };
  // Client-side navigations and re-renders start after the action resolves: give them a moment before reading.
  const act = (fn: () => Promise<unknown>) => async () => { await fn(); await page.waitForTimeout(500); return snapshot(); };

  const ref = z.string().describe("element ref from the latest snapshot, e.g. e12");
  const tools: Tool[] = [
    {
      name: "snapshot", description: "Read the current page: text, prices and interactive elements with refs.",
      params: z.object({}), run: () => snapshot(),
    },
    {
      name: "goto", description: "Open a URL or path on this shop.", params: z.object({ url: z.string() }),
      run: ({ url }: { url: string }) => {
        const u = new URL(url, page.url());
        if (u.origin !== origin) throw new Error(`only ${origin} is allowed`);
        return act(() => page.goto(u.href))();
      },
    },
    {
      name: "click", description: "Click an element.", params: z.object({ ref }),
      run: async ({ ref }: { ref: string }) => {
        const loc = page.getByRef(ref);
        const label = await loc.evaluate((el) => {
          const b = el.closest("button,[role=button],input[type=submit]") as HTMLElement | null;
          return b ? (b.getAttribute("aria-label") ?? (b as HTMLInputElement).value ?? b.innerText ?? "") + "|" + (b.innerText ?? "") : "";
        });
        if (label.split("|").some((n) => n.trim().startsWith("Pay "))) throw new Error("payment buttons are off limits: never pay");
        await trace?.pointer(loc, "click");
        return act(() => loc.click())();
      },
    },
    {
      name: "fill", description: "Type text into an input (replaces its value).", params: z.object({ ref, text: z.string() }),
      run: async ({ ref, text }: { ref: string; text: string }) => {
        await trace?.pointer(page.getByRef(ref), "focus");
        trace?.keys("type", text);
        return act(() => page.getByRef(ref).fill(text))();
      },
    },
    {
      name: "select", description: "Choose an option in a dropdown by its label or value.", params: z.object({ ref, option: z.string() }),
      run: async ({ ref, option }: { ref: string; option: string }) => {
        await trace?.pointer(page.getByRef(ref), "click");
        trace?.keys("select", option);
        return act(() => page.getByRef(ref).selectOption(option))();
      },
    },
    {
      name: "check", description: "Tick (on=true) or untick (on=false) a checkbox, radio or switch.", params: z.object({ ref, on: z.boolean() }),
      run: async ({ ref, on }: { ref: string; on: boolean }) => {
        await trace?.pointer(page.getByRef(ref), "click");
        return act(() => page.getByRef(ref).setChecked(on))();
      },
    },
    {
      name: "back", description: "Go back to the previous page.", params: z.object({}),
      run: act(() => page.goBack()),
    },
  ];
  // Step limit: every tool call counts, refused once spent. Each counted call is traced with its outcome.
  for (const t of tools) {
    const run = t.run as (a: never) => Promise<string>;
    t.run = async (a: never) => {
      if (++steps > opts.maxSteps) throw new Error("step limit reached: stop and write your report now");
      const step = steps;
      trace?.action(step, t.name, a);
      try {
        const out = await run(a);
        trace?.result(step, true, out);
        return out;
      } catch (e) {
        trace?.result(step, false, (e as Error).message);
        throw e;
      }
    };
  }
  return { tools, steps: () => Math.min(steps, opts.maxSteps) };
}
