import { appendFileSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Locator, Page } from "playwright";
import type { TraceEventBody, TraceMeta } from "../../contracts/index.ts";
import { p, writeJson } from "../../paths.ts";

/**
 * Visual trace of one task for the console's agent visualizer: a throttled CDP screencast of the viewport plus the
 * agent's pointer targets, keystrokes, navigations and tool calls, appended as they happen so the console can
 * follow live and replay later. Files: data/traces/{id}/meta.json, events.jsonl, frames/00001.jpg…
 * It only observes. Pointer targets are measured, never moved to: a real mouse path could trigger hover patterns.
 * Every failure is swallowed: a broken trace must never change how the agent shops.
 */
// ponytail: ≤4 fps of 960px JPEGs, ~30–60 MB for a long, animated run. Lower FRAME_MS/quality if disk matters.
const FRAME_MS = 250;

export type Trace = Awaited<ReturnType<typeof startTrace>>;

export async function startTrace(page: Page, meta: Omit<TraceMeta, "startedAt" | "viewport">) {
  const dir = p.trace(meta.id);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(path.join(dir, "frames"), { recursive: true });
  const t0 = Date.now();
  const full: TraceMeta = { ...meta, startedAt: new Date(t0).toISOString(), viewport: page.viewportSize() ?? { width: 1440, height: 900 } };
  writeJson(path.join(dir, "meta.json"), full);
  const events = path.join(dir, "events.jsonl");
  writeFileSync(events, "");
  const emit = (e: TraceEventBody) => {
    try { appendFileSync(events, JSON.stringify({ ...e, t: Date.now() - t0 }) + "\n"); } catch { /* best effort */ }
  };

  // Screencast frames arrive on every repaint. Keep the newest, write at most one per FRAME_MS, and always flush
  // the last one so the final state of the page is on disk even if it then stays still.
  let n = 0, last = 0, pending: string | null = null, timer: NodeJS.Timeout | undefined;
  const flush = () => {
    timer = undefined;
    if (!pending) return;
    const f = `${String(++n).padStart(5, "0")}.jpg`;
    try { writeFileSync(path.join(dir, "frames", f), Buffer.from(pending, "base64")); emit({ type: "frame", file: f }); } catch { /* best effort */ }
    pending = null;
    last = Date.now();
  };
  const cdp = await page.context().newCDPSession(page).catch(() => null);
  cdp?.on("Page.screencastFrame", ({ data, sessionId }) => {
    cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => {});
    pending = data;
    timer ??= setTimeout(flush, Math.max(0, last + FRAME_MS - Date.now()));
  });
  await cdp?.send("Page.startScreencast", { format: "jpeg", quality: 60, maxWidth: 960, maxHeight: 960 }).catch(() => {});

  page.on("framenavigated", (f) => { if (f === page.mainFrame()) emit({ type: "nav", url: f.url() }); });

  return {
    id: meta.id,
    action: (step: number, tool: string, args: unknown) => emit({ type: "action", step, tool, args: (args ?? {}) as Record<string, unknown> }),
    // URL + title lines of a snapshot, or the error message.
    result: (step: number, ok: boolean, out: string) => emit({ type: "result", step, ok, summary: out.split("\n").slice(0, 2).join(" · ").slice(0, 300) }),
    /** Where the agent is about to act. Scrolls it into view first, as the action itself would. */
    async pointer(loc: Locator, kind: "click" | "focus") {
      try {
        await loc.scrollIntoViewIfNeeded({ timeout: 2000 });
        const b = await loc.boundingBox({ timeout: 2000 });
        if (b) emit({ type: "pointer", kind, x: b.x + b.width / 2, y: b.y + b.height / 2, w: b.width, h: b.height });
      } catch { /* the action will report its own error */ }
    },
    keys: (mode: "type" | "select", text: string) => emit({ type: "keys", mode, text }),
    async end(status: string, steps: number) {
      await cdp?.send("Page.stopScreencast").catch(() => {});
      if (timer) clearTimeout(timer);
      flush();
      emit({ type: "end", status });
      try { writeJson(path.join(dir, "meta.json"), { ...full, endedAt: new Date().toISOString(), status, steps } satisfies TraceMeta); } catch { /* best effort */ }
      await cdp?.detach().catch(() => {});
    },
  };
}
