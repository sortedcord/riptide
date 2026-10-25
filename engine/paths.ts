import { mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";
import type { z } from "zod";

export const ROOT = path.resolve(import.meta.dirname, "..");
export const DATA = path.join(ROOT, "data");
/** Variant worktrees live outside the repo so shop builds don't see each other. */
export const WORKTREES = path.join(ROOT, "..", "riptide-wt");

export const p = {
  mutation: (v: string) => path.join(DATA, "mutations", `${v}.json`),
  tasks: (v: string) => path.join(DATA, "tasks", v),
  task: (v: string, t: string) => path.join(DATA, "tasks", v, `${t}.json`),
  rubric: (v: string, t: string) => path.join(DATA, "rubrics", v, `${t}.json`),
  gate: (v: string) => path.join(DATA, "gates", `${v}.json`),
  suite: (s: string) => path.join(DATA, "suites", `${s}.json`),
  run: (r: string) => path.join(DATA, "runs", r),
  /** Shops append flight-recorder events here (RECORDER_DIR). */
  recorder: (r: string) => path.join(DATA, "recorder", `${r}.jsonl`),
  rating: (s: string, a: string) => path.join(DATA, "ratings", s, `${a}.json`),
  lessons: (s: string) => path.join(DATA, "lessons", `${s}.json`),
  /** A reference agent's visual trace of one task: meta.json, events.jsonl, frames/. */
  trace: (id: string) => path.join(DATA, "traces", id),
  /** A platform audit: upload.zip, src/, meta.json, events.jsonl, report.json. */
  audit: (id: string) => path.join(DATA, "audits", id),
};

export function writeJson(file: string, value: unknown) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(value, null, 2) + "\n");
}

export function readJson<T extends z.ZodType>(file: string, schema: T): z.infer<T> {
  return schema.parse(JSON.parse(readFileSync(file, "utf8")));
}

export const listJson = (dir: string) => (existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".json")).sort() : []);
