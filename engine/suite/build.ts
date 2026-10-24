import { existsSync } from "node:fs";
import { GateResult, MutationRecord, Rubric, Suite, Task, type Shop } from "../contracts/index.ts";
import { deriveRubric } from "../scorer/rubric.ts";
import { listJson, p, readJson, writeJson } from "../paths.ts";
import { git } from "../trickster/serve.ts";

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
