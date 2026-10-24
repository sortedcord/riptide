import "server-only";
import { spawn, type ChildProcess } from "node:child_process";
import { appendFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { DATA, ROOT, SHOPS, referenceConfigs } from "./data";

/**
 * Background jobs: each is a list of commands run one after another from the repo root, output captured.
 * `service` jobs (reference agent servers) run until stopped.
 * ponytail: in-memory registry (on globalThis to survive dev reloads); logs are also appended to data/console/{id}.log.
 */
export type Job = {
  id: string;
  kind: string;
  title: string;
  steps: string[][];
  step: number;
  status: "running" | "done" | "failed" | "stopped";
  service: boolean;
  /** For agent servers: the A2A agent card base URL. */
  url?: string;
  startedAt: number;
  endedAt?: number;
  log: string;
};

type Registry = { jobs: Map<string, Job>; procs: Map<string, ChildProcess> };
const g = globalThis as unknown as { __riptideJobs?: Registry };
const reg = (g.__riptideJobs ??= { jobs: new Map(), procs: new Map() });
const LOG_DIR = path.join(DATA, "console");
const MAX_LOG = 400_000;

const TSX = path.join(ROOT, "node_modules/.bin/tsx");
const cli = (...args: string[]) => [TSX, "--env-file-if-exists=.env", "engine/cli.ts", ...args];

function append(job: Job, text: string) {
  job.log = (job.log + text).slice(-MAX_LOG);
  try { appendFileSync(path.join(LOG_DIR, `${job.id}.log`), text); } catch { /* log mirror is best effort */ }
}

function runStep(job: Job) {
  if (job.status !== "running") return;
  if (job.step >= job.steps.length) { job.status = "done"; job.endedAt = Date.now(); return; }
  const [cmd, ...args] = job.steps[job.step];
  append(job, `\n$ ${[cmd === TSX ? "tsx" : cmd, ...args].join(" ")}\n`);
  const child = spawn(cmd, args, { cwd: ROOT, env: { ...process.env, FORCE_COLOR: "0" }, detached: true });
  reg.procs.set(job.id, child);
  child.stdout.on("data", (d) => append(job, String(d)));
  child.stderr.on("data", (d) => append(job, String(d)));
  child.on("close", (code) => {
    reg.procs.delete(job.id);
    if (job.status !== "running") return;
    if (code !== 0) { job.status = "failed"; job.endedAt = Date.now(); append(job, `\n[exit ${code}]\n`); return; }
    job.step++;
    runStep(job);
  });
}

function start(kind: string, title: string, steps: string[][], extra: Partial<Job> = {}): Job {
  mkdirSync(LOG_DIR, { recursive: true });
  const id = `j_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
  const job: Job = { id, kind, title, steps, step: 0, status: "running", service: false, startedAt: Date.now(), log: "", ...extra };
  reg.jobs.set(id, job);
  runStep(job);
  return job;
}

export function stop(id: string) {
  const job = reg.jobs.get(id);
  if (!job || job.status !== "running") return;
  job.status = "stopped";
  job.endedAt = Date.now();
  const p = reg.procs.get(id);
  // Kill the whole process group: next start / browsers are grandchildren.
  if (p?.pid) try { process.kill(-p.pid, "SIGTERM"); } catch { /* gone */ }
  append(job, "\n[stopped]\n");
}

export const list = () => [...reg.jobs.values()].sort((a, b) => b.startedAt - a.startedAt);
export const get = (id: string) => reg.jobs.get(id);
export const agentServers = () => list().filter((j) => j.kind === "agent" && j.status === "running");

// ------------------------------------------------------------------ job kinds (all inputs validated here: this spawns processes)

const ID = /^[a-z0-9_-]+$/;
const SUITE = /^riptide-suite-\d+\.\d+\.\d+$/;
const VARIANT = /^v_[a-z0-9]{6}$/;
const need = (ok: boolean, msg: string) => { if (!ok) throw new Error(msg); };
const ids = (s: unknown) => String(s ?? "").split(",").map((x) => x.trim()).filter(Boolean);

export type Launch = Record<string, string | undefined> & { kind: string };

export function launch(b: Launch): Job {
  switch (b.kind) {
    case "mutate": {
      const shop = b.shop ?? "";
      const n = Number(b.count ?? 1);
      need((SHOPS as readonly string[]).includes(shop), "unknown shop");
      need(Number.isInteger(n) && n >= 1 && n <= 5, "count must be 1–5");
      need(!b.version || ID.test(b.version), "bad version");
      const args = ["mutate", "--shop", shop, ...(b.version ? ["--version", b.version] : [])];
      return start("mutate", `Mutate ${shop} ×${n}`, Array.from({ length: n }, () => cli(...args)));
    }
    case "gates":
      need(VARIANT.test(b.variant ?? ""), "bad variant id");
      return start("gates", `Gates ${b.variant}`, [cli("gates", "--variant", b.variant!)]);
    case "build-suite": {
      const vs = ids(b.variants), cs = ids(b.controls);
      need(SUITE.test(b.suite ?? ""), "suite id looks like riptide-suite-0.1.0");
      need(vs.every((v) => VARIANT.test(v)) && cs.every((c) => (SHOPS as readonly string[]).includes(c)), "bad variants/controls");
      need(vs.length + cs.length > 0, "pick at least one variant or control");
      return start("build-suite", `Build ${b.suite}`, [cli("build-suite", "--suite", b.suite!, ...(vs.length ? ["--variants", vs.join(",")] : []), ...(cs.length ? ["--controls", cs.join(",")] : []))]);
    }
    case "agent": {
      const cfg = referenceConfigs().find((c) => c.id === b.config);
      need(!!cfg, "unknown agent config");
      const port = Number(b.port);
      need(Number.isInteger(port) && port >= 1024 && port < 65536, "bad port");
      need(!agentServers().some((j) => j.url === `http://127.0.0.1:${port}`), "port already used by a running agent");
      return start("agent", `Agent ${cfg!.id} :${port}`, [[TSX, "--env-file-if-exists=.env", "engine/agents/reference/server.ts", "--config", cfg!.id, "--port", String(port)]],
        { service: true, url: `http://127.0.0.1:${port}` });
    }
    case "evaluate": {
      // The loop: run the suite against each agent, then score and rate.
      const cards = ids(b.agents);
      const repeats = Number(b.repeats ?? 1);
      need(SUITE.test(b.suite ?? ""), "bad suite id");
      need(cards.length > 0 && cards.every((c) => /^https?:\/\/[^\s]+$/.test(c)), "pick at least one agent card URL");
      need(Number.isInteger(repeats) && repeats >= 1 && repeats <= 5, "repeats must be 1–5");
      need(!b.only || VARIANT.test(b.only) || /^control-[a-z]+$/.test(b.only), "bad variant filter");
      const runs = cards.map((c) => cli("run", "--suite", b.suite!, "--agent-card", c, "--repeats", String(repeats), ...(b.only ? ["--only", b.only] : [])));
      return start("evaluate", `Evaluate ${b.suite} × ${cards.length} agent(s)`, [...runs, cli("score", "--suite", b.suite!), cli("rate", "--suite", b.suite!)]);
    }
    case "score":
    case "rate":
      need(SUITE.test(b.suite ?? ""), "bad suite id");
      return start(b.kind, `${b.kind === "score" ? "Score" : "Rate"} ${b.suite}`, [cli(b.kind, "--suite", b.suite!)]);
    case "discard": {
      // Removes a variant's worktree, branch and data. Never touches master.
      const v = b.variant ?? "";
      need(VARIANT.test(v), "bad variant id");
      const rm = ["rm", "-rf", `data/mutations/${v}.json`, `data/tasks/${v}`, `data/rubrics/${v}`, `../riptide-wt/${v}`];
      const gates = ["sh", "-c", `rm -f data/gates/${v}.json data/gates/${v}.a*.json`];
      const branch = ["sh", "-c", `git worktree prune && for b in $(git branch --list 'variant/*/${v}' --format='%(refname:short)'); do git branch -D "$b"; done`];
      return start("discard", `Discard ${v}`, [rm, gates, branch]);
    }
    default:
      throw new Error(`unknown job kind ${b.kind}`);
  }
}
