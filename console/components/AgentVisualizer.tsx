"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { TraceEvent, TraceMeta } from "../../engine/contracts/index.ts";
import { Badge, Card, ago } from "./ui";

type TraceRow = TraceMeta & { live: boolean };
type Ev<K extends TraceEvent["type"]> = Extract<TraceEvent, { type: K }>;

const MOVE_MS = 350; // cursor glide to its next target
const RIPPLE_MS = 600;
const TARGET_MS = 1600; // how long the acted-on element stays outlined
const LIVE_LAG_MS = 900; // the live view trails real time by about one poll, so events are in before they're due
const SPEEDS = [0.5, 1, 2, 4, 8];
const TOOL_COLOR: Record<string, string> = { click: "var(--es-ember)", check: "var(--es-ember)", select: "var(--es-ember)", fill: "var(--es-violet-soft)", goto: "var(--es-peach)", back: "var(--es-peach)" };

/** Index of the last event at or before `pos` (events are in time order), or -1. */
function lastAt<T extends { t: number }>(xs: T[], pos: number) {
  let lo = 0, hi = xs.length - 1, r = -1;
  while (lo <= hi) { const m = (lo + hi) >> 1; if (xs[m].t <= pos) { r = m; lo = m + 1; } else hi = m - 1; }
  return r;
}
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeOut = (x: number) => 1 - (1 - x) ** 3;
const mmss = (ms: number) => { const s = Math.max(0, Math.floor(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
const shortUrl = (u: string) => { try { const x = new URL(u); return x.pathname + x.search; } catch { return u; } };
const argText = (a: Record<string, unknown>) => Object.entries(a).map(([k, v]) => `${k}=${typeof v === "string" ? JSON.stringify(v) : String(v)}`).join(" ");

/** Sniffer agents' browser sessions: live while a task runs, replayable afterwards. */
export function AgentVisualizer({ initial }: { initial?: string }) {
  const [traces, setTraces] = useState<TraceRow[]>([]);
  const [agent, setAgent] = useState("all");
  const [picked, setPicked] = useState<string | undefined>(initial);

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try { const ts = (await (await fetch("/api/traces")).json()) as TraceRow[]; if (alive) setTraces(ts); } catch { /* retry */ }
      if (alive) setTimeout(tick, 3000);
    };
    tick();
    return () => { alive = false; };
  }, []);

  const agents = [...new Set(traces.map((t) => t.agentId))].sort();
  const shown = traces.filter((t) => agent === "all" || t.agentId === agent);
  // Nothing picked: follow the newest live task, else show the newest one.
  const row = traces.find((t) => t.id === picked) ?? shown.find((t) => t.live) ?? shown[0];

  return (
    <div id="visualizer">
      <Card title="Agent visualizer" actions={
        <div className="flex flex-wrap items-center gap-2">
          {picked && <button className="btn" onClick={() => setPicked(undefined)}>Follow latest</button>}
          <select className="input" aria-label="Agent" value={agent} onChange={(e) => { setAgent(e.target.value); setPicked(undefined); }}>
            <option value="all">All agents</option>
            {agents.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      }>
        <p className="-mt-3 mb-4 text-xs text-[var(--muted)]">
          Every task a reference agent works on: its viewport, where it points and clicks, what it types and each tool call. Live tasks stream in; finished ones replay.
        </p>
        <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
          <ul className="max-h-[78vh] space-y-1 overflow-auto" aria-label="Agent tasks">
            {!shown.length && <li className="p-3 text-sm text-[var(--muted)]">No agent tasks yet. Start a reference agent above, then run an evaluation from a suite.</li>}
            {shown.map((t) => (
              <li key={t.id}>
                <button onClick={() => setPicked(t.id)}
                  className={`w-full rounded-[10px] px-3 py-2.5 text-left text-sm transition-colors ${row?.id === t.id ? "bg-[var(--es-cream)] text-[var(--es-ink-on-light)]" : "hover:bg-[var(--surface-2)]"}`}>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: t.live ? "var(--info)" : "var(--muted)", animation: t.live ? "pl-pulse 1.2s infinite" : undefined }} />
                    <span className="truncate font-medium">{t.agentId}</span>
                    <span className="ml-auto shrink-0"><Badge tone={t.live ? "info" : undefined}>{t.status}</Badge></span>
                  </div>
                  <div className="mt-0.5 truncate pl-4 font-mono text-xs opacity-70">{shortUrl(t.startUrl)}</div>
                  <div className="pl-4 text-xs opacity-70">{t.id} · {t.steps != null ? `${t.steps} steps · ` : ""}{ago(t.startedAt)}</div>
                </button>
              </li>
            ))}
          </ul>
          {row ? <Player key={row.id} id={row.id} startLive={row.live} /> : <div />}
        </div>
      </Card>
    </div>
  );
}

function Player({ id, startLive }: { id: string; startLive: boolean }) {
  const [meta, setMeta] = useState<TraceRow | null>(null);
  const [events, setEvents] = useState<TraceEvent[]>([]);
  const [pos, setPos] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [follow, setFollow] = useState(startLive);
  const [speed, setSpeed] = useState(1);
  const posRef = useRef(0);
  const logRef = useRef<HTMLOListElement>(null);
  const seek = (p: number) => { posRef.current = p; setPos(p); };

  // Poll new events while the task runs; one read is enough for a finished one.
  useEffect(() => {
    let alive = true, next = 0;
    const tick = async () => {
      let again = true;
      try {
        const r = await fetch(`/api/traces/${id}?from=${next}`);
        if (r.status === 404) again = false;
        else if (r.ok) {
          const d = (await r.json()) as { meta: TraceRow; events: TraceEvent[]; next: number };
          if (!alive) return;
          next = d.next;
          setMeta(d.meta);
          if (d.events.length) setEvents((es) => [...es, ...d.events]);
          again = d.meta.live;
        }
      } catch { /* retry */ }
      if (alive && again) setTimeout(tick, 600);
    };
    tick();
    return () => { alive = false; };
  }, [id]);

  const ix = useMemo(() => {
    const by = { frame: [] as Ev<"frame">[], nav: [] as Ev<"nav">[], action: [] as Ev<"action">[], pointer: [] as Ev<"pointer">[], keys: [] as Ev<"keys">[] };
    const results = new Map<number, Ev<"result">>();
    let end: Ev<"end"> | undefined;
    for (const e of events) {
      if (e.type === "end") end = e;
      else if (e.type === "result") results.set(e.step, e);
      else (by[e.type] as TraceEvent[]).push(e);
    }
    return { ...by, results, end, duration: end?.t ?? events.at(-1)?.t ?? 0 };
  }, [events]);

  const live = !!meta?.live && !ix.end;
  const startMs = meta ? Date.parse(meta.startedAt) : 0;

  // The playhead. Following: pinned to the live edge (or the end, once the task is over). Otherwise it plays at
  // `speed` and rejoins the live edge when it catches up.
  useEffect(() => {
    if (!meta) return;
    let raf = 0, prev = performance.now();
    const loop = (now: number) => {
      const dt = now - prev;
      prev = now;
      const edge = live ? Math.max(0, Date.now() - startMs - LIVE_LAG_MS) : ix.duration;
      if (follow) seek(edge);
      else if (playing) {
        const n = posRef.current + dt * speed;
        if (n < edge) seek(n);
        else { seek(edge); if (live) setFollow(true); else setPlaying(false); }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [meta, live, follow, playing, speed, startMs, ix.duration]);

  const fi = lastAt(ix.frame, pos);
  const ai = lastAt(ix.action, pos);

  // Warm the cache for the next frames so playback doesn't flash.
  useEffect(() => {
    for (const f of ix.frame.slice(fi + 1, fi + 9)) new Image().src = `/api/traces/${id}/frames/${f.file}`;
  }, [fi, ix.frame, id]);

  useEffect(() => {
    logRef.current?.querySelector(`[data-i="${ai}"]`)?.scrollIntoView({ block: "nearest" });
  }, [ai]);

  if (!meta) return <div className="card text-sm text-[var(--muted)]">Loading…</div>;

  const { width: vw, height: vh } = meta.viewport;
  const pct = (x: number, of: number) => `${(x / of) * 100}%`;
  const frame = ix.frame[fi];
  const url = ix.nav[lastAt(ix.nav, pos)]?.url ?? meta.startUrl;
  const total = live ? Math.max(pos, ix.duration) : ix.duration;

  // Cursor: glides from the previous target to the current one, then clicks.
  const pi = lastAt(ix.pointer, pos);
  const p1 = ix.pointer[pi];
  const p0 = ix.pointer[pi - 1] ?? { x: vw / 2, y: vh / 2 };
  const since = p1 ? pos - p1.t : Infinity;
  const k = easeOut(clamp01(since / MOVE_MS));
  const cursor = p1 && { x: p0.x + (p1.x - p0.x) * k, y: p0.y + (p1.y - p0.y) * k };
  const ripple = p1?.kind === "click" && since >= MOVE_MS && since < MOVE_MS + RIPPLE_MS ? (since - MOVE_MS) / RIPPLE_MS : null;

  // Keystrokes: the filled text appears key by key (a fill is one action; this paces it for the eye).
  const kk = ix.keys[lastAt(ix.keys, pos)];
  const perKey = kk ? Math.min(55, 1200 / Math.max(1, kk.text.length)) : 0;
  const kSince = kk ? pos - kk.t : Infinity;
  const typed = kk ? kk.text.slice(0, Math.min(kk.text.length, Math.floor(kSince / perKey) + 1)) : "";
  const showKeys = kk && kSince < perKey * kk.text.length + 2000;

  const act = ix.action[ai];
  const res = act && ix.results.get(act.step);
  const pending = act && (!res || res.t > pos);
  const state = ix.end && pos >= ix.end.t ? `finished · ${ix.end.status}` : !act ? "starting" : pending ? `#${act.step} ${act.tool} ${argText(act.args)}` : "thinking…";

  const togglePlay = () => {
    if (follow) { setFollow(false); setPlaying(false); return; }
    if (!playing && !live && pos >= ix.duration) seek(0);
    setPlaying(!playing);
  };

  return (
    <div className="min-w-0 space-y-3">
      <div className="overflow-hidden rounded-[10px] border border-[var(--border)]">
        <div className="flex items-center gap-3 bg-[var(--surface-2)] px-3 py-2">
          <span className="flex gap-1.5" aria-hidden>{[0, 1, 2].map((i) => <span key={i} className="h-2.5 w-2.5 rounded-full bg-[var(--border)]" />)}</span>
          <span className="min-w-0 flex-1 truncate rounded-full bg-[var(--es-ink)] px-3 py-1 font-mono text-xs" title={url}>{shortUrl(url)}</span>
          {live && <Badge tone="info">{follow ? "● live" : "behind live"}</Badge>}
        </div>
        <div className="relative w-full overflow-hidden bg-[var(--es-ink)]" style={{ aspectRatio: `${vw} / ${vh}` }}>
          {frame
            // eslint-disable-next-line @next/next/no-img-element -- frames are local, already-sized JPEGs
            ? <img src={`/api/traces/${id}/frames/${frame.file}`} alt={`Agent viewport at ${mmss(pos)}`} className="absolute inset-0 h-full w-full object-contain" draggable={false} />
            : <div className="absolute inset-0 grid place-items-center text-sm text-[var(--muted)]">{ix.frame.length ? "" : live ? "Waiting for the first frame…" : "No frames recorded."}</div>}

          {p1 && since < MOVE_MS + TARGET_MS && (
            <div className="pointer-events-none absolute rounded-[4px] border-2" style={{
              left: pct(p1.x - p1.w / 2, vw), top: pct(p1.y - p1.h / 2, vh), width: pct(p1.w, vw), height: pct(p1.h, vh),
              borderColor: p1.kind === "click" ? "var(--es-ember)" : "var(--es-violet-soft)", opacity: 1 - clamp01((since - MOVE_MS) / TARGET_MS) * 0.8,
            }} />
          )}
          {ripple != null && cursor && (
            <div className="pointer-events-none absolute h-10 w-10 rounded-full border-2 border-[var(--es-ember)]" style={{
              left: pct(cursor.x, vw), top: pct(cursor.y, vh), transform: `translate(-50%, -50%) scale(${0.3 + ripple * 1.7})`, opacity: 1 - ripple,
            }} />
          )}
          {cursor && (
            <svg className="pointer-events-none absolute h-6 w-6 drop-shadow" viewBox="0 0 24 24" aria-hidden style={{ left: pct(cursor.x, vw), top: pct(cursor.y, vh), transform: "translate(-3px, -2px)" }}>
              <path d="M3 2l16 9.5-6.6 1.4 3.8 7.6-3 1.5-3.8-7.6L4.8 19z" fill="#f8eedc" stroke="#0b0a07" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
          )}

          <div className="pointer-events-none absolute left-2 top-2 max-w-[80%] truncate rounded-full bg-black/70 px-3 py-1 font-mono text-xs text-white">
            {pending && <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-[var(--es-ember)]" style={{ animation: "pl-pulse 0.8s infinite" }} />}{state}
          </div>

          {showKeys && kk && (
            <div className="pointer-events-none absolute bottom-3 left-1/2 max-w-[90%] -translate-x-1/2 rounded-[10px] bg-black/80 px-4 py-2.5 text-white shadow-lg">
              <div className="text-[10px] uppercase tracking-wider opacity-60">{kk.mode === "type" ? "⌨ typing" : "▾ selecting"}</div>
              <div className="truncate font-mono text-sm">{typed}{typed.length < kk.text.length && <span className="ml-px inline-block w-[2px] animate-pulse bg-white">&nbsp;</span>}</div>
              {kk.mode === "type" && (
                <div className="mt-1.5 flex gap-1" aria-hidden>
                  {[...typed.slice(-12)].map((c, i, a) => (
                    <kbd key={typed.length - a.length + i} className="min-w-6 rounded border border-white/30 bg-white/10 px-1.5 text-center font-mono text-xs">{c === " " ? "␣" : c}</kbd>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button className="btn" onClick={togglePlay} aria-label={follow || playing ? "Pause" : "Play"}>{follow || playing ? "❚❚ Pause" : "▶ Play"}</button>
        <button className="btn" onClick={() => { setFollow(false); seek(0); setPlaying(true); }}>⟲ Restart</button>
        {live && !follow && <button className="btn btn-primary" onClick={() => setFollow(true)}>Go live</button>}
        <select className="input" aria-label="Playback speed" value={speed} onChange={(e) => setSpeed(Number(e.target.value))}>
          {SPEEDS.map((s) => <option key={s} value={s}>{s}×</option>)}
        </select>
        <span className="font-mono text-xs text-[var(--muted)]">{mmss(pos)} / {mmss(total)}</span>
        <span className="ml-auto text-xs text-[var(--muted)]">
          {meta.agentId} · {meta.model}{id.startsWith("r_") && !live && <> · <Link className="link" href={`/runs/${id}`}>run details</Link></>}
        </span>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-2" aria-hidden>
          {total > 0 && ix.action.map((a) => (
            <span key={a.step} className="absolute top-0 h-2 w-[3px] rounded-sm" style={{ left: pct(a.t, total), background: TOOL_COLOR[a.tool] ?? "var(--muted)" }} />
          ))}
        </div>
        <input type="range" aria-label="Timeline" className="mt-2 w-full accent-[var(--es-ember)]" min={0} max={Math.max(1, total)} step={50} value={Math.min(pos, total)}
          onChange={(e) => { setFollow(false); seek(Number(e.target.value)); }} />
      </div>

      <ol ref={logRef} className="code max-h-56 space-y-0.5 !whitespace-normal" aria-label="Agent actions">
        {!ix.action.length && <li className="text-[var(--muted)]">No actions yet.</li>}
        {ix.action.map((a, i) => {
          const r = ix.results.get(a.step);
          const done = r && r.t <= pos;
          return (
            <li key={a.step} data-i={i}>
              <button onClick={() => { setFollow(false); seek(a.t); }}
                className={`flex w-full gap-2 rounded px-1.5 py-0.5 text-left ${i === ai ? "bg-[var(--surface-2)]" : "hover:bg-[var(--surface)]"} ${a.t > pos ? "opacity-40" : ""}`}>
                <span className="w-10 shrink-0 text-[var(--muted)]">{mmss(a.t)}</span>
                <span className="w-14 shrink-0 font-semibold" style={{ color: TOOL_COLOR[a.tool] ?? "var(--fg)" }}>{a.tool}</span>
                <span className="min-w-0 flex-1 truncate">{argText(a.args)}{done && <span className={r.ok ? "text-[var(--muted)]" : "text-[var(--bad)]"}> → {r.summary}</span>}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
