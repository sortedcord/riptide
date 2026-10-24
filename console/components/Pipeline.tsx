import Link from "next/link";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { DATA, listRuns, listSuites, listVariants, ratings, referenceConfigs, tricksterVersions } from "@/lib/data";
import { list as jobs, type Job } from "@/lib/jobs";

/**
 * Live map of the Riptide loop: Trickster → pattern design → agents under test → scoring → rating → back to the Trickster.
 * Each node shows its numbers; nodes and edges animate while a job is doing that stage.
 * Server-rendered; AutoRefresh in the layout re-renders it while jobs run.
 */

const STAGES = ["mutate", "gates", "build-suite", "run", "score", "rate"] as const;
type Stage = (typeof STAGES)[number];

/** The CLI stage a running job is on right now, from its current command line. */
const stageOf = (j: Job): Stage | null => (j.service || j.status !== "running" ? null : (STAGES.find((s) => j.steps[j.step]?.includes(s)) ?? null));

function state() {
  const running = jobs().filter((j) => j.status === "running");
  const active = new Set(running.map(stageOf).filter(Boolean) as Stage[]);
  const variants = listVariants();
  const runs = listRuns();
  const suites = listSuites();
  const latest = suites[0];
  const top = latest ? [...ratings(latest.suiteId).leaderboard].sort((a, b) => b.overall - a.overall)[0] : undefined;
  const lessonsDir = path.join(DATA, "lessons");
  const patterns = variants.flatMap((v) => v.record?.patterns ?? []);
  return {
    running,
    active,
    agents: running.filter((j) => j.kind === "agent").length,
    trickster: { version: tricksterVersions().at(-1) ?? "—", variants: variants.length },
    design: {
      passed: variants.filter((v) => v.status === "passed").length,
      failed: variants.filter((v) => v.status === "failed").length,
      patterns: patterns.length,
      categories: new Set(patterns.map((p) => p.category)).size,
      suites: suites.length,
    },
    sniffer: { runs: runs.length, agentsSeen: new Set(runs.map((r) => r.agentId)).size },
    builders: { configs: referenceConfigs().length, thirdParty: new Set(runs.filter((r) => !r.agentCardUrl.startsWith("http://127.0.0.1")).map((r) => r.agentId)).size },
    scoring: { scored: runs.filter((r) => r.score).length, total: runs.length },
    rating: { suite: latest?.suiteId, top },
    lessons: existsSync(lessonsDir) ? readdirSync(lessonsDir).filter((f) => f.endsWith(".json")).length : 0,
  };
}

type NodeProps = { x: number; y: number; w: number; h: number; tone: string; title: string; lines: string[]; href: string; on: boolean; status: string };

function Node({ x, y, w, h, tone, title, lines, href, on, status }: NodeProps) {
  return (
    <Link href={href} className="pl-node">
      <g>
        {on && <rect x={x - 5} y={y - 5} width={w + 10} height={h + 10} rx={18} className="pl-glow" style={{ stroke: tone }} />}
        <rect x={x} y={y} width={w} height={h} rx={14} style={{ fill: `color-mix(in srgb, ${tone} 16%, var(--surface))`, stroke: tone }} strokeWidth={1.5} />
        <text x={x + 16} y={y + 26} className="pl-title" style={{ fill: tone }}>{title}</text>
        <text x={x + w - 14} y={y + 26} textAnchor="end" className={`pl-status ${on ? "pl-on" : ""}`}>{status}</text>
        {lines.map((l, i) => <text key={i} x={x + 16} y={y + 50 + i * 19} className="pl-line">{l}</text>)}
      </g>
    </Link>
  );
}

function Edge({ d, label, lx, ly, on }: { d: string; label?: string; lx?: number; ly?: number; on: boolean }) {
  return (
    <g>
      <path d={d} className={`pl-edge ${on ? "pl-flow" : ""}`} markerEnd={`url(#${on ? "pl-arrow-on" : "pl-arrow"})`} />
      {label && <text x={lx} y={ly} textAnchor="middle" className={`pl-label ${on ? "pl-on" : ""}`}>{label}</text>}
    </g>
  );
}

export function Pipeline() {
  const s = state();
  const a = (st: Stage) => s.active.has(st);
  const TRICK = "#b16cf0", DESIGN = "var(--info)", SNIFF = "#e5675f", NEUTRAL = "var(--muted)", RATE = "var(--accent)";
  const evaluating = a("run");

  return (
    <div>
      <div className="scroll-x">
        <svg viewBox="0 0 1180 600" role="img" aria-label="Riptide pipeline status" className="pipeline min-w-[760px]">
          <defs>
            {[["pl-arrow", "var(--muted)"], ["pl-arrow-on", "var(--accent)"]].map(([id, c]) => (
              <marker key={id} id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 z" style={{ fill: c }} />
              </marker>
            ))}
          </defs>

          {/* edges first so nodes sit on top */}
          <Edge d="M150 228 C 160 130, 250 100, 372 100" label="Plants" lx={235} ly={118} on={a("mutate")} />
          <Edge d="M668 100 C 770 100, 820 150, 826 224" label="Tasks" lx={790} ly={118} on={evaluating || a("build-suite")} />
          <Edge d="M990 278 L 940 278" label="A2A" lx={965} ly={268} on={s.agents > 0} />
          <Edge d="M720 290 C 600 290, 522 300, 522 374" label="Response" lx={640} ly={280} on={evaluating} />
          <Edge d="M522 188 L 522 374" label="Rubrics" lx={560} ly={290} on={a("build-suite") || a("score")} />
          <Edge d="M408 428 C 250 428, 160 420, 150 332" label="Benchmark improvement" lx={268} ly={462} on={false} />
          <Edge d="M522 474 L 522 512" on={a("rate")} />

          <rect x={372} y={22} width={300} height={166} rx={16} className="pl-group" />
          <Node x={392} y={38} w={260} h={134} tone={DESIGN} href="/variants" on={a("gates") || a("build-suite")}
            status={a("gates") ? "gating" : a("build-suite") ? "freezing" : "idle"} title="Pattern design · scoring"
            lines={[`${s.design.passed} variants passed · ${s.design.failed} failed`, `${s.design.patterns} patterns · ${s.design.categories} categories`, `${s.design.suites} frozen suite${s.design.suites === 1 ? "" : "s"}`]} />

          <Node x={40} y={232} w={220} h={98} tone={TRICK} href="/variants" on={a("mutate")}
            status={a("mutate") ? "mutating" : "idle"} title="Trickster agent"
            lines={[`version ${s.trickster.version}`, `${s.trickster.variants} variant${s.trickster.variants === 1 ? "" : "s"} made`]} />

          <Node x={720} y={232} w={220} h={98} tone={SNIFF} href="/runs" on={evaluating}
            status={evaluating ? "shopping" : s.agents ? `${s.agents} listening` : "idle"} title="Sniffer agents"
            lines={[`${s.sniffer.runs} run${s.sniffer.runs === 1 ? "" : "s"}`, `${s.sniffer.agentsSeen} agent${s.sniffer.agentsSeen === 1 ? "" : "s"} tested`]} />

          <Node x={990} y={196} w={160} h={164} tone={NEUTRAL} href="/jobs#agents" on={s.agents > 0}
            status={s.agents ? "online" : "offline"} title="Agent builders"
            lines={[`${s.builders.configs} reference`, `${s.builders.thirdParty} third-party`, `${s.agents} running now`]} />

          <Node x={408} y={378} w={228} h={96} tone={NEUTRAL} href="/runs" on={a("score")}
            status={a("score") ? "scoring" : "idle"} title="Scoring"
            lines={[`${s.scoring.scored}/${s.scoring.total} runs scored`, "deterministic · judge pending"]} />

          <Node x={408} y={516} w={228} h={70} tone={RATE} href={s.rating.suite ? `/suites/${s.rating.suite}` : "/suites"} on={a("rate")}
            status={a("rate") ? "rating" : ""} title="Riptide rating"
            lines={[s.rating.top ? `${s.rating.top.agentId.slice(0, 22)} · ${s.rating.top.overall}` : "no ratings yet"]} />

          <text x={268} y={482} textAnchor="middle" className="pl-label" style={{ fontSize: 12 }}>{s.lessons ? `${s.lessons} lessons file(s)` : "(learn loop not built yet)"}</text>
        </svg>
      </div>
      <p className="mt-2 text-xs text-[var(--muted)]">
        {s.running.filter((j) => !j.service).length
          ? <>Now: {s.running.filter((j) => !j.service).map((j) => `${j.title} (step ${j.step + 1}/${j.steps.length})`).join(" · ")} · <Link className="link" href="/jobs">logs</Link></>
          : "Nothing running. Click a box to open that stage."}
      </p>
    </div>
  );
}
