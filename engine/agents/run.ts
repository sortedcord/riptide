import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { AGENT_CARD_PATH } from "@a2a-js/sdk";
import { Run, Suite, Task } from "../contracts/index.ts";
import { p, readJson, writeJson } from "../paths.ts";
import { controlWorktree, ensureWorktree, serveShop, type Served } from "../trickster/serve.ts";
import { sendTask } from "./a2a-client.ts";
import { taskMessage } from "./message.ts";

const TIMEOUT_MS = Number(process.env.RIPTIDE_TASK_TIMEOUT_MS ?? 15 * 60_000);
const MAX_STEPS = Number(process.env.RIPTIDE_MAX_STEPS ?? 60);
/** Runs in flight at once, across all agents. Each run has its own run id, browser context and recorder file. */
const CONCURRENCY = Number(process.env.RIPTIDE_CONCURRENCY ?? 4);

const runId = () => "r_" + Array.from(crypto.getRandomValues(new Uint8Array(10)), (b) => "abcdefghijklmnopqrstuvwxyz0123456789"[b % 36]).join("");
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function cardName(agentCardUrl: string): Promise<string> {
  const url = agentCardUrl.endsWith(".json") ? agentCardUrl : `${agentCardUrl.replace(/\/$/, "")}/${AGENT_CARD_PATH}`;
  return ((await (await fetch(url)).json()) as { name: string }).name;
}

/** Run `fn` over `items` with at most `n` in flight. A failing item is logged, never stops the others. */
export async function pool<T>(items: T[], n: number, fn: (t: T) => Promise<void>, label = "run") {
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const item = items[next++];
      await fn(item).catch((e) => console.error(`[${label}] failed: ${(e as Error).message}`));
    }
  };
  await Promise.all(Array.from({ length: Math.max(1, Math.min(n, items.length)) }, worker));
}

/**
 * riptide run: every suite task × repeats against one or more A2A agents; writes data/runs/{runId}/.
 * Each shop build is served once for the whole evaluation; runs then go through a pool of `concurrency`.
 */
export async function runSuite(opts: {
  suiteId: string; agentCardUrls: string[]; agentId?: string; repeats: number; only?: string; concurrency?: number;
}): Promise<void> {
  const suite = readJson(p.suite(opts.suiteId), Suite);
  if (opts.agentId && opts.agentCardUrls.length > 1) throw new Error("--agent only works with a single --agent-card");
  const agents = await Promise.all(opts.agentCardUrls.map(async (url) => ({ url, id: opts.agentId ?? slug(await cardName(url)) })));
  const items = suite.items.filter((i) => !opts.only || i.variantId === opts.only);

  // Build + serve every shop up front (builds are synchronous, so one at a time), then share them across all runs.
  const served = new Map<string, Served>();
  // Shops run in their own process groups, so stopping this process (console "Stop") would otherwise orphan them.
  const stopAll = () => { for (const s of served.values()) s.stop(); };
  const onSignal = () => { stopAll(); process.exit(130); };
  process.once("SIGTERM", onSignal).once("SIGINT", onSignal);
  try {
    for (const item of items) {
      const dir = item.variantId.startsWith("control") ? controlWorktree() : ensureWorktree(item.variantId, item.branch);
      console.log(`[run] serving ${item.variantId} (${item.shop})`);
      served.set(item.variantId, await serveShop(dir, item.shop));
    }

    // Interleave agents so every agent makes progress from the start.
    const work = items.flatMap((item) => item.taskIds.flatMap((taskId) => Array.from({ length: opts.repeats }, (_, repeat) => ({ item, taskId, repeat }))))
      .flatMap((w) => agents.map((agent) => ({ ...w, agent })));
    const concurrency = opts.concurrency ?? CONCURRENCY;
    console.log(`[run] ${work.length} runs: ${agents.length} agent(s) × ${work.length / agents.length} task-repeats, ${concurrency} at a time`);

    let done = 0;
    await pool(work, concurrency, async ({ item, taskId, repeat, agent }) => {
      const task = readJson(p.task(item.variantId, taskId), Task);
      const id = runId();
      const u = new URL(task.startPath, served.get(item.variantId)!.origin);
      u.searchParams.set("s", id);
      u.searchParams.set("reset", "1");
      const startedAt = new Date().toISOString();
      console.log(`[run] ${id} ${agent.id} ${item.variantId}/${taskId} #${repeat}`);
      const r = await sendTask({ agentCardUrl: agent.url, text: taskMessage(task, u.href), timeoutMs: TIMEOUT_MS, maxSteps: MAX_STEPS });
      const run: Run = Run.parse({
        runId: id, suiteId: suite.suiteId, agentId: agent.id, agentCardUrl: agent.url, variantId: item.variantId, taskId, repeat,
        startUrl: u.href, startedAt, endedAt: new Date().toISOString(), status: r.status, error: r.error, report: r.report,
      });
      const out = p.run(id);
      writeJson(path.join(out, "run.json"), run);
      writeJson(path.join(out, "a2a.json"), r.transcript);
      const rec = p.recorder(id);
      writeJson(path.join(out, "recorder.json"), existsSync(rec) ? readFileSync(rec, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)) : []);
      console.log(`[run] ${id} ${r.status}${r.error ? ` (${r.error})` : ""} ${r.report ? `${r.report.outcome} ₹${r.report.totalInr}` : "no report"} [${++done}/${work.length}]`);
    });
  } finally {
    stopAll();
    process.off("SIGTERM", onSignal).off("SIGINT", onSignal);
  }
}
