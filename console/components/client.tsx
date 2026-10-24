"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import type { Job } from "@/lib/jobs";

type JobRow = Omit<Job, "log"> & { tail: string };

async function post(body: Record<string, string>): Promise<string> {
  const r = await fetch("/api/jobs", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const j = (await r.json()) as { id?: string; error?: string };
  if (!r.ok || !j.id) throw new Error(j.error ?? "failed to start");
  return j.id;
}

/** A form whose named fields become a job launch. Goes to the job's log on success. */
export function LaunchForm({ kind, children, submit, confirm: ask, className = "", stay, tone = "primary" }: {
  kind: string; children?: ReactNode; submit: string; confirm?: string; className?: string; stay?: boolean; tone?: "primary" | "plain" | "danger";
}) {
  const router = useRouter();
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (ask && !window.confirm(ask)) return;
    const fd = new FormData(e.currentTarget);
    const body: Record<string, string> = { kind };
    for (const k of new Set(fd.keys())) body[k] = fd.getAll(k).map(String).join(",");
    setBusy(true); setErr("");
    try {
      const id = await post(body);
      if (stay) router.refresh(); else router.push(`/jobs?job=${id}`);
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  }
  return (
    <form onSubmit={onSubmit} className={`flex flex-wrap items-end gap-3 ${className}`}>
      {children}
      <button className={`btn ${tone === "plain" ? "" : `btn-${tone}`}`} disabled={busy}>{busy ? "Starting…" : submit}</button>
      {err && <p role="alert" className="w-full text-sm text-[var(--bad)]">{err}</p>}
    </form>
  );
}

export const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="es-label">{label}{children}</label>
);

/** Re-renders server pages every few seconds while any job runs, so new data shows up. */
export function AutoRefresh() {
  const router = useRouter();
  useEffect(() => {
    let alive = true;
    let wasRunning = false;
    const tick = async () => {
      try {
        const jobs = (await (await fetch("/api/jobs")).json()) as JobRow[];
        const running = jobs.some((j) => j.status === "running" && !j.service);
        if (running || wasRunning) router.refresh();
        wasRunning = running;
      } catch { /* console server restarting */ }
      if (alive) setTimeout(tick, 4000);
    };
    tick();
    return () => { alive = false; };
  }, [router]);
  return null;
}

const STATUS_DOT: Record<string, string> = { running: "var(--info)", done: "var(--ok)", failed: "var(--bad)", stopped: "var(--muted)" };

/** Job list + live log of the selected job. */
export function JobsLive({ initial }: { initial?: string }) {
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [sel, setSel] = useState<string | undefined>(initial);
  const [log, setLog] = useState("");
  const pre = useRef<HTMLPreElement>(null);
  const stick = useRef(true);

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const js = (await (await fetch("/api/jobs")).json()) as JobRow[];
        if (!alive) return;
        setJobs(js);
        const id = sel ?? js[0]?.id;
        if (id) {
          const r = await fetch(`/api/jobs/${id}`);
          if (r.ok && alive) setLog(((await r.json()) as Job).log);
        }
      } catch { /* retry */ }
      if (alive) setTimeout(tick, 1500);
    };
    tick();
    return () => { alive = false; };
  }, [sel]);

  useEffect(() => { if (stick.current && pre.current) pre.current.scrollTop = pre.current.scrollHeight; }, [log]);

  const current = jobs.find((j) => j.id === (sel ?? jobs[0]?.id));
  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <ul className="card max-h-[75vh] space-y-1 overflow-auto p-2.5" aria-label="Jobs">
        {!jobs.length && <li className="p-4 text-sm text-[var(--muted)]">No jobs yet. Start one from Variants, Suites or Agents.</li>}
        {jobs.map((j) => (
          <li key={j.id}>
            <button onClick={() => { setSel(j.id); stick.current = true; }}
              className={`w-full rounded-[10px] px-3 py-2.5 text-left text-sm transition-colors ${current?.id === j.id ? "bg-[var(--es-cream)] text-[var(--es-ink-on-light)]" : "hover:bg-[var(--surface-2)]"}`}>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: STATUS_DOT[j.status] }} />
                <span className="truncate font-medium">{j.title}</span>
              </div>
              <div className="mt-0.5 pl-4 text-xs opacity-70">
                {j.status}{j.service ? " · service" : ` · step ${Math.min(j.step + 1, j.steps.length)}/${j.steps.length}`} · {new Date(j.startedAt).toLocaleTimeString()}
              </div>
            </button>
          </li>
        ))}
      </ul>
      <div className="card flex min-w-0 flex-col">
        {current ? (
          <>
            <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="card-title">{current.title}</h2>
                <p className="text-xs text-[var(--muted)]">
                  {current.status}{current.url && <> · <a className="link" href={`${current.url}/.well-known/agent-card.json`} target="_blank">{current.url}</a></>}
                </p>
              </div>
              {current.status === "running" && (
                <button className="btn btn-danger" onClick={() => fetch(`/api/jobs/${current.id}`, { method: "DELETE" })}>Stop</button>
              )}
            </header>
            <pre ref={pre} onScroll={(e) => { const el = e.currentTarget; stick.current = el.scrollTop + el.clientHeight >= el.scrollHeight - 20; }}
              className="code h-[65vh] flex-1">{log || "Waiting for output…"}</pre>
          </>
        ) : <p className="text-sm text-[var(--muted)]">Select a job.</p>}
      </div>
    </div>
  );
}

/** Running agent servers as checkboxes (for the evaluate form). */
export function AgentPicker() {
  const [agents, setAgents] = useState<JobRow[] | null>(null);
  useEffect(() => {
    fetch("/api/jobs").then((r) => r.json()).then((js: JobRow[]) => setAgents(js.filter((j) => j.kind === "agent" && j.status === "running")));
  }, []);
  if (!agents) return <span className="text-sm text-[var(--muted)]">Loading agents…</span>;
  return (
    <fieldset className="flex flex-col gap-2 text-sm text-[var(--muted)]">
      <legend className="mb-2 font-medium">Agents under test</legend>
      {agents.map((a) => (
        <label key={a.id} className="flex items-center gap-2 text-sm text-[var(--fg)]">
          <input type="checkbox" name="agents" value={a.url} defaultChecked /> {a.title.replace(/^Agent /, "")}
        </label>
      ))}
      {!agents.length && <span>No reference agent running. <Link className="link" href="/jobs#agents">Start one</Link>.</span>}
      <input name="agents" placeholder="or a third-party agent card URL" className="input mt-1 w-72" />
    </fieldset>
  );
}
