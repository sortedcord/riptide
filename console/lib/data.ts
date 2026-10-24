import "server-only";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import type { GateResult, MutationRecord, Rating, RecorderEvent, Run, RunScore, Suite, Task, Rubric } from "../../engine/contracts/index.ts";

export type { GateResult, MutationRecord, Rating, RecorderEvent, Run, RunScore, Suite, Task, Rubric };

/** Read-only view of the engine's data/ folder and variant branches. The engine owns every write. */
export const ROOT = path.resolve(process.cwd(), "..");
export const DATA = path.join(ROOT, "data");
export const WORKTREES = path.join(ROOT, "..", "riptide-wt");

const json = <T,>(file: string): T | null => {
  try { return JSON.parse(readFileSync(file, "utf8")) as T; } catch { return null; }
};
const files = (dir: string, ext = ".json") => (existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(ext)).sort() : []);
const dirs = (dir: string) => (existsSync(dir) ? readdirSync(dir).filter((f) => statSync(path.join(dir, f)).isDirectory()).sort() : []);
const mtime = (f: string) => (existsSync(f) ? statSync(f).mtimeMs : 0);

export function git(args: string[], cwd = ROOT): string {
  try { return execFileSync("git", args, { cwd, encoding: "utf8", maxBuffer: 32 << 20, stdio: ["ignore", "pipe", "ignore"] }).trim(); } catch { return ""; }
}

// ------------------------------------------------------------------ variants

export type VariantRow = {
  variantId: string;
  shop: string;
  branch: string;
  record: MutationRecord | null;
  gate: GateResult | null;
  /** Earlier failed attempts (data/gates/{id}.a{n}.json). */
  attempts: GateResult[];
  tasks: Task[];
  worktree: boolean;
  /** Uncommitted edits in the worktree: a mutate run in progress or interrupted. */
  dirty: boolean;
  status: "passed" | "failed" | "pending" | "incomplete";
};

export function listVariants(): VariantRow[] {
  const branches = git(["branch", "--list", "variant/*", "--format=%(refname:short)"]).split("\n").filter(Boolean);
  const ids = new Set([...branches.map((b) => b.split("/")[2]), ...files(path.join(DATA, "mutations")).map((f) => f.slice(0, -5))]);
  return [...ids].map((id) => variant(id, branches)).filter((v): v is VariantRow => !!v)
    .sort((a, b) => (b.record?.createdAt ?? "").localeCompare(a.record?.createdAt ?? ""));
}

export function variant(variantId: string, branches?: string[]): VariantRow | null {
  if (!/^v_[a-z0-9]{6}$/.test(variantId)) return null;
  const bs = branches ?? git(["branch", "--list", `variant/*/${variantId}`, "--format=%(refname:short)"]).split("\n").filter(Boolean);
  const branch = bs.find((b) => b.endsWith(`/${variantId}`)) ?? "";
  const record = json<MutationRecord>(path.join(DATA, "mutations", `${variantId}.json`));
  const gateDir = path.join(DATA, "gates");
  const gate = json<GateResult>(path.join(gateDir, `${variantId}.json`));
  const attempts = files(gateDir).filter((f) => f.startsWith(`${variantId}.a`)).map((f) => json<GateResult>(path.join(gateDir, f))!).filter(Boolean);
  const wt = path.join(WORKTREES, variantId);
  const worktree = existsSync(wt);
  const dirty = worktree && git(["status", "--porcelain"], wt) !== "";
  if (!branch && !record) return null;
  const status = gate ? (gate.passed ? "passed" : "failed") : record ? "pending" : "incomplete";
  return { variantId, shop: record?.shop ?? branch.split("/")[1] ?? "?", branch, record, gate, attempts, tasks: tasksOf(variantId), worktree, dirty, status };
}

/** The variant's code change: committed diff against master, plus uncommitted worktree edits if any. */
export function variantDiff(v: VariantRow): string {
  const committed = v.branch ? git(["diff", `master...${v.branch}`]) : "";
  const wt = path.join(WORKTREES, v.variantId);
  const pending = v.dirty ? git(["diff"], wt) : "";
  return [committed, pending && `# --- uncommitted in ${wt} ---\n${pending}`].filter(Boolean).join("\n");
}

export const tasksOf = (variantId: string): Task[] =>
  files(path.join(DATA, "tasks", variantId)).map((f) => json<Task>(path.join(DATA, "tasks", variantId, f))!).filter(Boolean);

export const controlIds = () => dirs(path.join(DATA, "tasks")).filter((d) => d.startsWith("control-"));

// ------------------------------------------------------------------ suites, runs, ratings

export const listSuites = (): Suite[] =>
  files(path.join(DATA, "suites")).map((f) => json<Suite>(path.join(DATA, "suites", f))!).filter(Boolean).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export const suite = (id: string) => json<Suite>(path.join(DATA, "suites", `${id}.json`));
export const rubric = (variantId: string, taskId: string) => json<Rubric>(path.join(DATA, "rubrics", variantId, `${taskId}.json`));
export const task = (variantId: string, taskId: string) => json<Task>(path.join(DATA, "tasks", variantId, `${taskId}.json`));

export type RunRow = Run & { score: RunScore | null };

export function listRuns(filter: { suiteId?: string; agentId?: string } = {}): RunRow[] {
  const dir = path.join(DATA, "runs");
  return dirs(dir)
    .map((id) => {
      const r = json<Run>(path.join(dir, id, "run.json"));
      return r && { ...r, score: json<RunScore>(path.join(dir, id, "score.json")) };
    })
    .filter((r): r is RunRow => !!r && (!filter.suiteId || r.suiteId === filter.suiteId) && (!filter.agentId || r.agentId === filter.agentId))
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

export function runDetail(runId: string) {
  if (!/^r_[a-z0-9]{10}$/.test(runId)) return null;
  const dir = path.join(DATA, "runs", runId);
  const run = json<Run>(path.join(dir, "run.json"));
  if (!run) return null;
  let events = json<RecorderEvent[]>(path.join(dir, "recorder.json")) ?? [];
  const raw = path.join(DATA, "recorder", `${runId}.jsonl`);
  if (!events.length && existsSync(raw)) events = readFileSync(raw, "utf8").split("\n").filter(Boolean).flatMap((l) => { try { return [JSON.parse(l)]; } catch { return []; } });
  return {
    run,
    score: json<RunScore>(path.join(dir, "score.json")),
    events: [...events].sort((a, b) => a.t - b.t),
    a2a: json<unknown>(path.join(dir, "a2a.json")),
    task: task(run.variantId, run.taskId),
    rubric: rubric(run.variantId, run.taskId),
    record: json<MutationRecord>(path.join(DATA, "mutations", `${run.variantId}.json`)),
  };
}

export type Leaderboard = { agentId: string; overall: number; stars: number; subScores: Rating["subScores"]; range: Rating["range"] }[];

export function ratings(suiteId: string): { leaderboard: Leaderboard; ratings: Rating[] } {
  const dir = path.join(DATA, "ratings", suiteId);
  const lb = json<Leaderboard | { agents: Leaderboard }>(path.join(dir, "leaderboard.json"));
  return {
    leaderboard: Array.isArray(lb) ? lb : (lb?.agents ?? []),
    ratings: files(dir).filter((f) => f !== "leaderboard.json").map((f) => json<Rating>(path.join(dir, f))!).filter(Boolean),
  };
}

// ------------------------------------------------------------------ misc

export const referenceConfigs = () =>
  files(path.join(ROOT, "engine/agents/reference/configs")).map((f) => json<{ id: string; name: string; model: string; maxSteps: number; systemPrompt: string }>(path.join(ROOT, "engine/agents/reference/configs", f))!).filter(Boolean);

export const tricksterVersions = () => dirs(path.join(ROOT, "engine/trickster/versions"));
export const SHOPS = ["market", "food", "air", "saas", "ott"] as const;
export const latestChange = () => Math.max(...["mutations", "gates", "suites", "runs", "ratings"].map((d) => mtime(path.join(DATA, d))));

/** Local dev ports and brands of the shops (same as playwright.config.ts / README). */
export const SHOP_INFO = [
  { shop: "market", brand: "Cartwheel", port: 3001 },
  { shop: "food", brand: "Forkful", port: 3002 },
  { shop: "air", brand: "Skyline Air", port: 3003 },
  { shop: "saas", brand: "Prism Studio", port: 3004 },
  { shop: "ott", brand: "Reelbox", port: 3005 },
] as const;

/** Is a shop dev server answering on its port? Also returns its manifest variants. */
export async function shopStatus(port: number): Promise<{ up: boolean; variants: string[] }> {
  try {
    const r = await fetch(`http://127.0.0.1:${port}/api/slots`, { signal: AbortSignal.timeout(1500), cache: "no-store" });
    if (!r.ok) return { up: false, variants: [] };
    const html = await (await fetch(`http://127.0.0.1:${port}/`, { signal: AbortSignal.timeout(1500), cache: "no-store" })).text();
    const variants = [...new Set([...html.matchAll(/href="\/([a-z0-9_-]+)"/g)].map((m) => m[1]))];
    return { up: true, variants: variants.length ? variants : ["honest"] };
  } catch {
    return { up: false, variants: [] };
  }
}
