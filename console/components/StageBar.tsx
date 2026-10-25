"use client";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { StageState } from "@/lib/pipeline";

/**
 * The loop as a row of chevron buttons (Overview). Each stage: title, time line, round play/stop button.
 * A running stage draws its progress as a stroke around its own outline: elapsed / estimate, from past runs.
 */
const D = 16; // depth of the chevron point / notch, px
const R = 18; // radius of the first button's rounded left end, px
const H = 76;

function outline(w: number, first: boolean) {
  const right = `H ${w - D} L ${w} ${H / 2} L ${w - D} ${H}`;
  return first
    ? `M ${R} 0 ${right} H ${R} A ${R} ${R} 0 0 1 0 ${H - R} V ${R} A ${R} ${R} 0 0 1 ${R} 0 Z`
    : `M 0 0 ${right} H 0 L ${D} ${H / 2} Z`;
}

const clock = (ms: number) => { const s = Math.max(0, Math.round(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
const approx = (ms: number) => (ms < 60_000 ? `~${Math.max(1, Math.round(ms / 1000))} s` : `~${Math.round(ms / 60_000)} min`);

function Segment({ s, first, now, onStart, onStop }: { s: StageState; first: boolean; now: number; onStart: () => void; onStop: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.offsetWidth));
    ro.observe(el);
    setW(el.offsetWidth);
    return () => ro.disconnect();
  }, []);

  const elapsed = s.startedAt ? (s.endedAt ?? now) - s.startedAt : 0;
  const running = s.status === "running";
  const progress = running ? Math.min(1, elapsed / s.estimateMs) : s.status === "done" ? 1 : 0;
  const over = running && elapsed > s.estimateMs;
  const line =
    running ? (over ? `${clock(elapsed - s.estimateMs)} over estimate` : `${clock(s.estimateMs - elapsed)} left`)
    : s.status === "done" ? `done in ${clock(elapsed)}`
    : s.status === "failed" ? "failed — retry"
    : s.status === "stopped" ? "stopped — restart"
    : s.note ? `outdated · ${approx(s.estimateMs)}`
    : approx(s.estimateMs);
  const estimateNote = s.samples ? `estimate: median of the last ${s.samples} run${s.samples === 1 ? "" : "s"}` : "estimate: measured in development (no runs yet)";
  const d = w ? outline(w, first) : "";

  return (
    <div ref={ref} className={`stage stage--${s.status}${first ? " stage--first" : ""}`} style={{ marginLeft: first ? 0 : -(D - 6) }} title={`${s.hint}\n${estimateNote}${s.note ? `\n${s.note}` : ""}`}>
      {w > 0 && (
        <svg className="stage__shape" width={w} height={H} viewBox={`0 0 ${w} ${H}`} aria-hidden>
          <path d={d} className="stage__fill" />
          <path d={d} className="stage__edge" />
          {running && <path d={d} pathLength={1} className={`stage__progress${over ? " stage__progress--over" : ""}`} style={{ strokeDasharray: `${progress} 1` }} />}
        </svg>
      )}
      <div className="stage__body" style={{ paddingLeft: first ? 22 : D + 14, paddingRight: D + 10 }}>
        <div className="min-w-0">
          <div className="stage__title">{s.title}</div>
          <div className="stage__line" aria-live={running ? "polite" : undefined}>{line}</div>
        </div>
        {running ? (
          <button type="button" className="stage__btn" onClick={onStop} aria-label={`Stop ${s.title}`}>
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden><rect x="5" y="5" width="14" height="14" rx="2" fill="currentColor" /></svg>
          </button>
        ) : s.status === "done" ? (
          <button type="button" className="stage__btn" onClick={onStart} aria-label={`Run ${s.title} again`} title="Run again">
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        ) : (
          <button type="button" className="stage__btn" onClick={onStart} aria-label={`Start ${s.title}`}>
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden><path d="M8 5.5v13l11-6.5z" fill="currentColor" /></svg>
          </button>
        )}
      </div>
    </div>
  );
}

export function StageBar() {
  const router = useRouter();
  const [stages, setStages] = useState<StageState[] | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [err, setErr] = useState("");
  const sig = useRef("");

  useEffect(() => {
    let alive = true;
    const poll = async () => {
      try {
        const next = (await (await fetch("/api/pipeline", { cache: "no-store" })).json()) as StageState[];
        if (!alive) return;
        setStages(next);
        const k = next.map((s) => s.status).join();
        if (sig.current && sig.current !== k) router.refresh(); // a stage finished or started: refresh the page's data
        sig.current = k;
      } catch { /* console restarting */ }
      if (alive) setTimeout(poll, 2000);
    };
    poll();
    const tick = setInterval(() => setNow(Date.now()), 250);
    return () => { alive = false; clearInterval(tick); };
  }, [router]);

  async function act(stage: string, action: "start" | "stop") {
    setErr("");
    const r = await fetch("/api/pipeline", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ stage, action }) });
    const j = (await r.json().catch(() => ({}))) as { error?: string };
    if (!r.ok) setErr(j.error ?? "could not start");
    setStages((await (await fetch("/api/pipeline", { cache: "no-store" })).json()) as StageState[]);
  }

  return (
    <section aria-label="Pipeline stages" className="stagebar-wrap">
      <div className="stagebar">
        {(stages ?? []).map((s, i) => (
          <Segment key={s.id} s={s} first={i === 0} now={now} onStart={() => act(s.id, "start")} onStop={() => act(s.id, "stop")} />
        ))}
        {!stages && <div className="stagebar__loading">Loading stages…</div>}
      </div>
      {err && <p role="alert" className="mt-2 text-sm text-[var(--bad)]">{err}</p>}
    </section>
  );
}
