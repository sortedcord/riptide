import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { AGENT_CARD_PATH } from "@a2a-js/sdk";
import { Run, Suite, Task } from "../contracts/index.ts";
import { p, readJson, writeJson } from "../paths.ts";
import { controlWorktree, ensureWorktree, serveShop } from "../trickster/serve.ts";
import { sendTask } from "./a2a-client.ts";
import { taskMessage } from "./message.ts";

const TIMEOUT_MS = Number(process.env.RIPTIDE_TASK_TIMEOUT_MS ?? 15 * 60_000);
const MAX_STEPS = Number(process.env.RIPTIDE_MAX_STEPS ?? 60);

const runId = () => "r_" + Array.from(crypto.getRandomValues(new Uint8Array(10)), (b) => "abcdefghijklmnopqrstuvwxyz0123456789"[b % 36]).join("");
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function cardName(agentCardUrl: string): Promise<string> {
  const url = agentCardUrl.endsWith(".json") ? agentCardUrl : `${agentCardUrl.replace(/\/$/, "")}/${AGENT_CARD_PATH}`;
  return ((await (await fetch(url)).json()) as { name: string }).name;
}

/** riptide run: every suite task × repeats against one A2A agent; writes data/runs/{runId}/. */
export async function runSuite(opts: { suiteId: string; agentCardUrl: string; agentId?: string; repeats: number; only?: string }): Promise<void> {
  const suite = readJson(p.suite(opts.suiteId), Suite);
  const agentId = opts.agentId ?? slug(await cardName(opts.agentCardUrl));
  for (const item of suite.items.filter((i) => !opts.only || i.variantId === opts.only)) {
    const dir = item.variantId.startsWith("control") ? controlWorktree() : ensureWorktree(item.variantId, item.branch);
    const served = await serveShop(dir, item.shop);
    try {
      for (const taskId of item.taskIds) {
        const task = readJson(p.task(item.variantId, taskId), Task);
        for (let repeat = 0; repeat < opts.repeats; repeat++) {
          const id = runId();
          const u = new URL(task.startPath, served.origin);
          u.searchParams.set("s", id);
          u.searchParams.set("reset", "1");
          const startedAt = new Date().toISOString();
          console.log(`[run] ${id} ${agentId} ${item.variantId}/${taskId} #${repeat}`);
          const r = await sendTask({ agentCardUrl: opts.agentCardUrl, text: taskMessage(task, u.href), timeoutMs: TIMEOUT_MS, maxSteps: MAX_STEPS });
          const run: Run = Run.parse({
            runId: id, suiteId: suite.suiteId, agentId, agentCardUrl: opts.agentCardUrl, variantId: item.variantId, taskId, repeat,
            startUrl: u.href, startedAt, endedAt: new Date().toISOString(), status: r.status, error: r.error, report: r.report,
          });
          const out = p.run(id);
          writeJson(path.join(out, "run.json"), run);
          writeJson(path.join(out, "a2a.json"), r.transcript);
          const rec = p.recorder(id);
          writeJson(path.join(out, "recorder.json"), existsSync(rec) ? readFileSync(rec, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)) : []);
          console.log(`[run] ${id} ${r.status}${r.error ? ` (${r.error})` : ""} ${r.report ? `${r.report.outcome} ₹${r.report.totalInr}` : "no report"}`);
        }
      }
    } finally {
      served.stop();
    }
  }
}
