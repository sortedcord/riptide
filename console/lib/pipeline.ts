import "server-only";
import { listSuites } from "./data";
import { agentServers, cli, durations, list, start, stop, type Job } from "./jobs";

/**
 * The Overview stage bar: the loop as three sequential stages, each one job (Mutate & freeze and Score & rate are two steps each).
 * A stage counts as done only if it finished after the stage before it did, so re-running an
 * early stage puts every later stage back to pending.
 */
export const STAGES = [
  { id: "build", title: "Mutate & freeze", hint: "Trickster plants patterns (market + saas, gates included), then a new suite from the fresh passed variants + honest controls", defaultMs: 256_000 },
  { id: "run", title: "Run agents", hint: "Every running sniffer on every task of the latest suite, 6 at a time", defaultMs: 390_000 },
  { id: "score", title: "Score & rate", hint: "Recorder checks + LLM judge, then ratings and leaderboard", defaultMs: 116_000 },
] as const;
export type StageId = (typeof STAGES)[number]["id"];

const MUTATE_SHOPS = ["market", "saas"];
const RUN_CONCURRENCY = 6;

export type StageState = {
  id: StageId; title: string; hint: string;
  status: "pending" | "running" | "done" | "failed" | "stopped";
  /** Median of recent successful runs of this stage, else the default measured in development. */
  estimateMs: number;
  /** How many past runs the estimate is based on (0 = default). */
  samples: number;
  jobId?: string; startedAt?: number; endedAt?: number;
  /** Why the stage cannot start, or the end of a failed job's log. */
  note?: string;
};

const median = (xs: number[]) => { const s = [...xs].sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : 0; };

/** Each stage's job command from the current data, or the reason it cannot run yet. */
function plan(id: StageId): { title: string; steps: string[][] } | { blocked: string } {
  const suite = listSuites()[0]?.suiteId;
  switch (id) {
    case "build": {
      // Both shops in parallel (fails if either Trickster run fails), then freeze. The freeze resolves "next"/"fresh"/"all"
      // when it runs, so it sees the variants this job just made.
      const sh = MUTATE_SHOPS.map((s, i) => `${cli("mutate", "--shop", s).join(" ")} & p${i}=$!`).join("; ");
      const wait = MUTATE_SHOPS.map((_, i) => `wait $p${i} || rc=1`).join("; ");
      return { title: `Mutate ${MUTATE_SHOPS.join(" + ")} & freeze`, steps: [["sh", "-c", `rc=0; ${sh}; ${wait}; exit $rc`], cli("build-suite", "--suite", "next", "--variants", "fresh", "--controls", "all")] };
    }
    case "run": {
      if (!suite) return { blocked: "No suite yet. Freeze one first." };
      const cards = agentServers().map((j) => j.url!).filter(Boolean);
      if (!cards.length) return { blocked: "No sniffer agent is running. Start them under Agents & jobs." };
      return { title: `Run ${cards.length} agent(s) on ${suite}`, steps: [cli("run", "--suite", suite, "--agent-card", cards.join(","), "--repeats", "1", "--concurrency", String(RUN_CONCURRENCY))] };
    }
    case "score":
      return suite ? { title: `Score & rate ${suite}`, steps: [cli("score", "--suite", suite), cli("rate", "--suite", suite)] } : { blocked: "No suite yet." };
  }
}

/**
 * Any stage can run at any time. Each shows its latest job; a finished result counts as outdated (pending)
 * once an earlier stage has completed again after it started.
 */
export function stageStates(): StageState[] {
  const jobs = list();
  const hist = durations();
  let earlierDoneAt = 0; // latest completion of any earlier stage
  return STAGES.map((s) => {
    const ms = hist[s.id] ?? [];
    const base = { id: s.id, title: s.title, hint: s.hint, estimateMs: ms.length ? median(ms) : s.defaultMs, samples: ms.length };
    const job: Job | undefined = jobs.find((j) => j.stage === s.id); // jobs() is newest first
    let st: StageState;
    if (job?.status === "running") st = { ...base, status: "running", jobId: job.id, startedAt: job.startedAt };
    else if (job && job.startedAt < earlierDoneAt) st = { ...base, status: "pending", note: "outdated: an earlier stage ran again since" };
    else if (job?.status === "done") st = { ...base, status: "done", jobId: job.id, startedAt: job.startedAt, endedAt: job.endedAt };
    else if (job && (job.status === "failed" || job.status === "stopped"))
      st = { ...base, status: job.status, jobId: job.id, startedAt: job.startedAt, endedAt: job.endedAt, note: job.status === "failed" ? job.log.trim().split("\n").slice(-2).join(" ").slice(-220) : undefined };
    else st = { ...base, status: "pending" };
    if (job?.status === "done" && job.endedAt) earlierDoneAt = Math.max(earlierDoneAt, job.endedAt);
    return st;
  });
}

export function startStage(id: StageId): Job {
  const states = stageStates();
  if (!states.some((s) => s.id === id)) throw new Error("unknown stage");
  // One at a time: e.g. scoring while runs are still being written would rate half a suite.
  const busy = states.find((s) => s.status === "running");
  if (busy) throw new Error(`"${busy.title}" is running. Stop it or wait for it to finish.`);
  const p = plan(id);
  if ("blocked" in p) throw new Error(p.blocked);
  return start(`stage-${id}`, p.title, p.steps, { stage: id });
}

export function stopStage(id: StageId) {
  const s = stageStates().find((x) => x.id === id);
  if (s?.status === "running" && s.jobId) stop(s.jobId);
}
