import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { GateResult, MutationRecord, Rubric, Suite, Task, type Shop } from "../contracts/index.ts";
import { deriveRubric } from "../scorer/rubric.ts";
import { DATA, listJson, p, readJson, writeJson } from "../paths.ts";
import { git } from "../trickster/serve.ts";

/**
 * Resolve the "auto" values one-click flows use, at run time (so they see variants made earlier in the same job):
 * suite "next" → next patch version; variants "fresh" → passed variants not in any suite; controls "all" → every control-* task set.
 */
export function resolveSuiteArgs(suiteId: string, variantIds: string[], controls: string[]): { suiteId: string; variantIds: string[]; controls: Shop[] } {
  const suites = listJson(path.join(DATA, "suites")).map((f) => readJson(path.join(DATA, "suites", f), Suite));
  if (suiteId === "next") {
    const [M, m, n] = suites.map((s) => s.suiteId.replace("riptide-suite-", "").split(".").map(Number))
      .sort((a, b) => b[0] - a[0] || b[1] - a[1] || b[2] - a[2])[0] ?? [0, 0, -1];
    suiteId = `riptide-suite-${M}.${m}.${n + 1}`;
  }
  if (variantIds.length === 1 && variantIds[0] === "fresh") {
    const used = new Set(suites.flatMap((s) => s.items.map((i) => i.variantId)));
    variantIds = listJson(path.join(DATA, "gates")).map((f) => f.slice(0, -5)).filter((v) => /^v_[a-z0-9]{6}$/.test(v) && !used.has(v))
      .filter((v) => readJson(p.gate(v), GateResult).passed && existsSync(p.mutation(v)));
    if (!variantIds.length) throw new Error("no passed variant that is not already in a suite");
  }
  if (controls.length === 1 && controls[0] === "all") {
    const dir = path.join(DATA, "tasks");
    controls = existsSync(dir) ? readdirSync(dir).filter((d) => d.startsWith("control-")).map((d) => d.slice("control-".length)) : [];
  }
  return { suiteId, variantIds, controls: controls as Shop[] };
}

/** Freeze passing variants (+ honest controls) with their tasks and derived rubrics. Refuses to overwrite a suite. */
export async function buildSuite(opts: { suiteId: string; variantIds: string[]; controls: Shop[] }): Promise<Suite> {
  const file = p.suite(opts.suiteId);
  if (existsSync(file)) throw new Error(`${file} exists; suites are frozen. Pick a new suite version.`);

  const tasksOf = (v: string) => listJson(p.tasks(v)).map((f) => readJson(`${p.tasks(v)}/${f}`, Task));
  const items: Suite["items"] = [];
  const add = (item: Suite["items"][number], record: MutationRecord | null, tasks: Task[]) => {
    if (!tasks.length) throw new Error(`no tasks for ${item.variantId}`);
    for (const t of tasks) writeJson(p.rubric(item.variantId, t.taskId), Rubric.parse(deriveRubric(record, t)));
    items.push({ ...item, taskIds: tasks.map((t) => t.taskId) });
  };

  for (const v of opts.variantIds) {
    const gate = existsSync(p.gate(v)) ? readJson(p.gate(v), GateResult) : null;
    if (!gate?.passed) { console.warn(`[suite] skipping ${v}: latest gate result ${gate ? "failed" : "missing"}`); continue; }
    const rec = readJson(p.mutation(v), MutationRecord);
    add({ shop: rec.shop, variantId: v, branch: `variant/${rec.shop}/${v}`, commit: rec.variantCommit, tricksterVersion: rec.tricksterVersion, taskIds: [] }, rec, tasksOf(v));
  }
  const master = git(["rev-parse", "master"]);
  for (const shop of opts.controls) {
    const v = `control-${shop}`;
    add({ shop, variantId: v, branch: "master", commit: master, tricksterVersion: null, taskIds: [] }, null, tasksOf(v));
  }
  if (!items.length) throw new Error("suite would be empty");

  const suite = Suite.parse({ suiteId: opts.suiteId, createdAt: new Date().toISOString(), items });
  writeJson(file, suite);
  console.log(`[suite] wrote ${file}: ${items.map((i) => `${i.variantId}(${i.taskIds.join(",")})`).join(" ")}`);
  return suite;
}
