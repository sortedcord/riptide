import "server-only";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import type { TraceEvent, TraceMeta } from "../../engine/contracts/index.ts";
import { DATA } from "./data";

export type { TraceEvent, TraceMeta };
export type TraceRow = TraceMeta & { live: boolean };

/** Reference agents' visual traces (data/traces/{id}/), written by engine/agents/reference/trace.ts. */
const DIR = path.join(DATA, "traces");
export const TRACE_ID = /^[rt]_[a-z0-9]{10}$/;
const FRAME = /^\d{5}\.jpg$/;
// An unfinished trace whose events stopped this long ago belongs to an agent that died mid-task.
const STALE_MS = 120_000;

function meta(id: string): TraceRow | null {
  try {
    const m = JSON.parse(readFileSync(path.join(DIR, id, "meta.json"), "utf8")) as TraceMeta;
    const live = !m.endedAt && Date.now() - statSync(path.join(DIR, id, "events.jsonl")).mtimeMs < STALE_MS;
    return { ...m, live, status: m.status ?? (live ? "running" : "interrupted") };
  } catch { return null; }
}

export const listTraces = (): TraceRow[] =>
  (existsSync(DIR) ? readdirSync(DIR) : []).filter((d) => TRACE_ID.test(d)).map(meta)
    .filter((m): m is TraceRow => !!m).sort((a, b) => b.startedAt.localeCompare(a.startedAt));

/** Events from line `from` on. A half-written last line is left for the next read. */
export function traceEvents(id: string, from = 0): { meta: TraceRow; events: TraceEvent[]; next: number } | null {
  if (!TRACE_ID.test(id)) return null;
  const m = meta(id);
  if (!m) return null;
  let text = "";
  try { text = readFileSync(path.join(DIR, id, "events.jsonl"), "utf8"); } catch { /* not started */ }
  const lines = text.split("\n").slice(0, -1);
  const events = lines.slice(from).flatMap((l) => { try { return [JSON.parse(l) as TraceEvent]; } catch { return []; } });
  return { meta: m, events, next: Math.max(from, lines.length) };
}

export const framePath = (id: string, file: string) =>
  TRACE_ID.test(id) && FRAME.test(file) ? path.join(DIR, id, "frames", file) : null;
