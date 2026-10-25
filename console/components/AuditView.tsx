"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type DragEvent, type FormEvent } from "react";
import type { AuditMeta, AuditReport } from "@/lib/audits";
import { UiMockSvg } from "./UiMockSvg";

type Ev = { t: number; type: string; tool?: string; path?: string | null; pattern?: string | null; text?: string };
type Detail = { meta: AuditMeta; events: Ev[]; report: AuditReport | null };
type Row = AuditReport["rules"][number];

const SEV = { critical: { label: "Critical", icon: "▲▲" }, high: { label: "High", icon: "▲" }, medium: { label: "Medium", icon: "■" }, low: { label: "Low", icon: "●" } } as const;
const SEV_ORDER = ["critical", "high", "medium", "low"] as const;
const clock = (ms: number) => { const s = Math.max(0, Math.round(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
const band = (s: number) => (s >= 90 ? { label: "Largely compliant", tone: "ok", icon: "✓" } : s >= 75 ? { label: "Needs attention", tone: "warn", icon: "!" } : s >= 50 ? { label: "Significant risk", tone: "bad", icon: "!" } : { label: "High risk", tone: "bad", icon: "✕" });
const nice = (c: string) => c.replaceAll("_", " ");

// ------------------------------------------------------------------ upload + demos (on /audits)

export function AuditStart({ demos }: { demos: { slug: string; name: string; tagline: string; expect: string }[] }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [err, setErr] = useState("");
  const input = useRef<HTMLInputElement>(null);

  async function upload(e: FormEvent) {
    e.preventDefault();
    if (!file) { setErr("Choose a .zip first."); return; }
    setErr(""); setBusy("upload"); setProgress(0);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("name", name);
    // XHR for real upload progress.
    const id = await new Promise<string>((resolve, reject) => {
      const x = new XMLHttpRequest();
      x.open("POST", "/api/audits");
      x.upload.onprogress = (p) => p.lengthComputable && setProgress(p.loaded / p.total);
      x.onload = () => { const j = JSON.parse(x.responseText || "{}"); if (x.status < 300 && j.id) resolve(j.id); else reject(new Error(j.error ?? "upload failed")); };
      x.onerror = () => reject(new Error("upload failed"));
      x.send(fd);
    }).catch((e: Error) => { setErr(e.message); setBusy(null); return null; });
    if (id) router.push(`/audits/${id}`);
  }

  async function demo(slug: string) {
    setErr(""); setBusy(slug); setProgress(0);
    // The upload is simulated (the zip is bundled); the audit that follows is real.
    await new Promise<void>((done) => {
      let t0: number | undefined;
      const step = (ts: number) => { t0 ??= ts; const p = Math.min(1, (ts - t0) / 1400); setProgress(p); if (p < 1) requestAnimationFrame(step); else done(); };
      requestAnimationFrame(step);
    });
    const r = await fetch("/api/audits/demo", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ demo: slug }) });
    const j = (await r.json()) as { id?: string; error?: string };
    if (j.id) router.push(`/audits/${j.id}`); else { setErr(j.error ?? "could not start"); setBusy(null); }
  }

  const onDrop = (e: DragEvent) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setFile(f); };

  return (
    <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
      <form onSubmit={upload} className="card flex flex-col gap-4">
        <h2 className="card-title">Upload a platform</h2>
        <div onDragOver={(e) => e.preventDefault()} onDrop={onDrop} onClick={() => input.current?.click()}
          className="audit-drop" role="button" tabIndex={0} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && input.current?.click()}>
          <input ref={input} type="file" accept=".zip,application/zip" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} aria-label="Platform source code (.zip)" />
          <p className="text-base">{file ? <b>{file.name}</b> : "Drop the platform's source code here (.zip)"}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">{file ? `${(file.size / 1048576).toFixed(1)} MB` : "or click to choose · up to 50 MB · node_modules and build output are ignored"}</p>
        </div>
        <label className="flex flex-col gap-1 text-xs text-[var(--muted)]">Platform name (optional)
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. ShopEasy web app" maxLength={80} />
        </label>
        <div className="flex items-center gap-3">
          <button className="btn btn-primary" disabled={!!busy}>{busy === "upload" ? `Uploading ${Math.round(progress * 100)}%` : "Upload and audit"}</button>
          <span className="text-xs text-[var(--muted)]">Read-only audit by a pi agent (Claude Sonnet 5.5) against {""}<Link className="link" href="/audits#rules">Indian dark-pattern rules</Link>.</span>
        </div>
        {err && <p role="alert" className="text-sm text-[var(--bad)]">{err}</p>}
      </form>

      <div className="card flex flex-col gap-3">
        <h2 className="card-title">Demo platforms</h2>
        <p className="text-sm text-[var(--muted)]">Bundled sample codebases. The upload is simulated; the audit is real.</p>
        {demos.map((d) => (
          <div key={d.slug} className="audit-demo">
            <div className="min-w-0">
              <div className="font-semibold">{d.name}</div>
              <div className="text-xs text-[var(--muted)]">{d.tagline}</div>
              {busy === d.slug && <div className="audit-progress mt-2" aria-label={`Uploading ${Math.round(progress * 100)}%`}><span style={{ width: `${progress * 100}%` }} /></div>}
            </div>
            <button type="button" className="btn" disabled={!!busy} onClick={() => demo(d.slug)}>{busy === d.slug ? (progress < 1 ? `${Math.round(progress * 100)}%` : "Starting…") : "Simulate upload"}</button>
          </div>
        ))}
        {!demos.length && <p className="text-sm text-[var(--muted)]">No demos bundled.</p>}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ live preview of the audited frontend

export function LivePreview({ id, preview }: { id: string; preview?: AuditMeta["preview"] }) {
  const [mobile, setMobile] = useState(false);
  const [key, setKey] = useState(0);
  if (!preview) return null;
  const src = `/api/audits/${id}/preview/index.html`;
  return (
    <section className="card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="card-title">Live preview</h2>
        {preview.kind !== "none" && (
          <div className="flex gap-2">
            <button type="button" className="btn" aria-pressed={mobile} onClick={() => setMobile((m) => !m)}>{mobile ? "Mobile" : "Desktop"}</button>
            <button type="button" className="btn" onClick={() => setKey((k) => k + 1)}>Reload</button>
            <a className="btn" href={src} target="_blank" rel="noreferrer">Open ↗</a>
          </div>
        )}
      </div>
      {preview.kind === "none" ? <p className="mt-2 text-sm text-[var(--muted)]">{preview.note}</p> : (
        <>
          <p className="mt-1 text-xs text-[var(--muted)]">The platform&apos;s own frontend, running sandboxed in your browser (no network, isolated from the console). {preview.note}</p>
          <div className="audit-preview mt-3">
            {/* allow-scripts without allow-same-origin: an opaque origin, so the upload's code cannot reach the console. */}
            <iframe key={key} src={src} sandbox="allow-scripts allow-forms" title="Live preview of the audited platform" style={{ width: mobile ? 390 : "100%" }} />
          </div>
        </>
      )}
    </section>
  );
}

// ------------------------------------------------------------------ live audit + report (on /audits/[id])

function Gauge({ score }: { score: number }) {
  const R = 64, C = 2 * Math.PI * R, b = band(score);
  return (
    <div className="audit-gauge" role="img" aria-label={`${score}% compliant: ${b.label}`}>
      <svg viewBox="0 0 160 160" width="160" height="160">
        <circle cx="80" cy="80" r={R} className="audit-gauge__track" />
        <circle cx="80" cy="80" r={R} className={`audit-gauge__value audit-tone--${b.tone}`} strokeDasharray={`${(C * score) / 100} ${C}`} transform="rotate(-90 80 80)" />
        <text x="80" y="78" textAnchor="middle" className="audit-gauge__num">{Math.round(score)}%</text>
        <text x="80" y="100" textAnchor="middle" className="audit-gauge__cap">compliant</text>
      </svg>
      <div className={`audit-band audit-tone--${b.tone}`}><span aria-hidden>{b.icon}</span> {b.label}</div>
    </div>
  );
}

function Finding({ r, open }: { r: Row; open?: boolean }) {
  return (
    <details className={`audit-finding audit-finding--${r.status}`} open={open}>
      <summary>
        {r.status === "violation" && <span className={`audit-sev audit-sev--${r.severity}`}><span aria-hidden>{SEV[r.severity].icon}</span> {SEV[r.severity].label}</span>}
        <span className="font-mono text-xs text-[var(--muted)]">{r.id}</span>
        <span className="font-medium">{r.title}</span>
        {!r.inForce && r.effectiveFrom && <span className="audit-sev audit-sev--low">in force from {new Date(r.effectiveFrom).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>}
      </summary>
      <div className="audit-finding__body">
        <p className="text-xs text-[var(--muted)]">{r.source} · {nice(r.category)} · {r.binding}</p>
        <div className={r.ui ? "audit-finding__grid" : ""}>
        <div className="min-w-0">
        <p className="mt-2 text-sm">{r.explanation}</p>
        {r.evidence.length > 0 && (
          <ul className="mt-3 space-y-2">
            {r.evidence.map((e, i) => (
              <li key={i}>
                <div className="font-mono text-xs text-[var(--muted)]">{e.file}{e.line ? `:${e.line}` : ""}</div>
                {e.snippet && <pre className="code mt-1 whitespace-pre-wrap">{e.snippet}</pre>}
              </li>
            ))}
          </ul>
        )}
        {r.recommendation && <p className="audit-fix mt-3 text-sm"><b>Fix: </b>{r.recommendation}</p>}
        </div>
        {r.ui && <figure className="audit-mock"><UiMockSvg mock={r.ui} title={r.title} /><figcaption>What users see on {r.ui.page}, reconstructed from the code. Ringed: the problem.</figcaption></figure>}
        </div>
      </div>
    </details>
  );
}

function Report({ rep, name, preview }: { rep: AuditReport; name: string; preview?: AuditMeta["preview"] }) {
  const violations = rep.rules.filter((r) => r.status === "violation").sort((a, b) => SEV_ORDER.indexOf(a.severity) - SEV_ORDER.indexOf(b.severity));
  const bySev = Object.fromEntries(SEV_ORDER.map((s) => [s, violations.filter((v) => v.severity === s).length]));
  const W = { critical: 4, high: 3, medium: 2, low: 1 } as const;
  const cats = [...new Set(rep.rules.map((r) => r.category))].map((c) => {
    const rs = rep.rules.filter((r) => r.category === c && (r.status === "compliant" || r.status === "violation"));
    const tot = rs.reduce((a, r) => a + W[r.severity], 0), ok = rs.filter((r) => r.status === "compliant").reduce((a, r) => a + W[r.severity], 0);
    return { c, pct: tot ? Math.round((100 * ok) / tot) : null, v: rs.filter((r) => r.status === "violation").length, n: rs.length };
  }).filter((x) => x.pct != null).sort((a, b) => a.pct! - b.pct!);
  const download = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(rep, null, 2)], { type: "application/json" }));
    Object.assign(document.createElement("a"), { href: url, download: `riptide-audit-${name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.json` }).click();
    URL.revokeObjectURL(url);
  };
  const group = (s: Row["status"]) => rep.rules.filter((r) => r.status === s);

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[auto_1fr]">
        <section className="card flex flex-col items-center justify-center gap-2 px-8">
          <Gauge score={rep.score} />
          <p className="text-center text-xs text-[var(--muted)]">Rules in force today.<br />Readiness incl. 2027 rules: <b className="text-[var(--fg)]">{Math.round(rep.readiness)}%</b></p>
        </section>
        <section className="card">
          <h2 className="card-title">{rep.platform.name}</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">{rep.platform.kind} · {rep.platform.summary}</p>
          <div className="audit-tiles mt-4">
            {SEV_ORDER.map((s) => (
              <div key={s} className={`audit-tile audit-sev--${s}`}>
                <div className="text-3xl font-medium tabular-nums">{bySev[s]}</div>
                <div className="text-xs"><span aria-hidden>{SEV[s].icon}</span> {SEV[s].label} violations</div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-[var(--muted)]">
            {rep.counts.compliant} compliant · {rep.counts.violation} violations · {rep.counts.not_applicable} not applicable · {rep.counts.unclear} unclear · audited by {rep.model} via pi RPC in {clock(rep.durationMs)}, {rep.toolCalls} tool calls over {rep.filesInUpload ?? rep.filesRead} files
          </p>
          <button className="btn mt-3" onClick={download}>Download report (JSON)</button>
        </section>
      </div>

      <LivePreview id={rep.auditId} preview={preview} />

      {cats.length > 0 && (
        <section className="card">
          <h2 className="card-title">Compliance by area</h2>
          <p className="mb-3 text-xs text-[var(--muted)]">Severity-weighted share of applicable rules met, weakest first.</p>
          <ul className="space-y-2">
            {cats.map((x) => (
              <li key={x.c} className="audit-cat">
                <span className="truncate text-sm capitalize">{nice(x.c)}</span>
                <span className="audit-cat__track" aria-hidden><span style={{ width: `${x.pct}%` }} /></span>
                <span className="text-sm tabular-nums">{x.pct}%</span>
                <span className="text-xs text-[var(--muted)]">{x.v ? `${x.v} violation${x.v === 1 ? "" : "s"}` : "clean"}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="card">
        <h2 className="card-title">Violations ({violations.length})</h2>
        <div className="mt-3 space-y-2">
          {violations.map((r, i) => <Finding key={r.id} r={r} open={i < 3} />)}
          {!violations.length && <p className="text-sm text-[var(--muted)]">No violations found.</p>}
        </div>
      </section>

      {(["compliant", "unclear", "not_applicable"] as const).map((s) => group(s).length > 0 && (
        <details key={s} className="card">
          <summary className="card-title cursor-pointer">{s === "compliant" ? "Compliant" : s === "unclear" ? "Could not determine" : "Not applicable"} ({group(s).length})</summary>
          <div className="mt-3 space-y-2">{group(s).map((r) => <Finding key={r.id} r={r} />)}</div>
        </details>
      ))}
    </div>
  );
}

export function AuditLive({ id, initial }: { id: string; initial: Detail }) {
  const [d, setD] = useState<Detail>(initial);
  const [now, setNow] = useState(() => Date.now());
  const live = d.meta.status !== "done" && d.meta.status !== "failed";
  useEffect(() => {
    if (!live) return;
    let alive = true;
    const poll = async () => {
      try { const r = await fetch(`/api/audits/${id}`, { cache: "no-store" }); if (r.ok && alive) setD(await r.json()); } catch { /* retry */ }
      if (alive) setTimeout(poll, 1500);
    };
    poll();
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => { alive = false; clearInterval(t); };
  }, [id, live]);

  const started = new Date(d.meta.createdAt).getTime();
  const tools = d.events.filter((e) => e.type === "tool");
  const extracted = d.events.find((e) => e.type === "status" && e.text?.startsWith("extracted"));
  const order = ["queued", "extracting", "auditing", "done"];
  const at = order.indexOf(d.meta.status);
  const steps = [
    { label: "Uploaded", done: true },
    { label: extracted?.text ? extracted.text.replace("extracted", "Extracted") : "Extracting", done: at > 1 || d.meta.status === "done" },
    { label: "Auditing with pi (RPC) · Claude Sonnet 5.5", done: d.meta.status === "done" },
    { label: "Report", done: d.meta.status === "done" },
  ];

  if (d.report) return <Report rep={d.report} name={d.meta.name} preview={d.meta.preview} />;
  return (
    <div className="space-y-5">
    <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
      <section className="card">
        <h2 className="card-title">{d.meta.status === "failed" ? "Audit failed" : "Auditing…"}</h2>
        <ol className="audit-steps mt-4">
          {steps.map((s, i) => {
            const active = !s.done && (i === 0 || steps[i - 1].done) && d.meta.status !== "failed";
            return <li key={i} className={s.done ? "is-done" : active ? "is-active" : ""}><span className="audit-steps__dot" aria-hidden />{s.label}</li>;
          })}
        </ol>
        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <div><div className="text-2xl tabular-nums">{clock((d.meta.status === "failed" ? (d.events.at(-1)?.t ?? now) : now) - started)}</div><div className="text-xs text-[var(--muted)]">elapsed</div></div>
          <div><div className="text-2xl tabular-nums">{tools.length}</div><div className="text-xs text-[var(--muted)]">tool calls</div></div>
          <div><div className="text-2xl tabular-nums">{d.meta.fileCount ?? "—"}</div><div className="text-xs text-[var(--muted)]">files in upload</div></div>
        </div>
        {d.meta.status === "failed" && <p role="alert" className="mt-4 text-sm text-[var(--bad)]">{d.meta.error}</p>}
      </section>
      <section className="card min-w-0">
        <h2 className="card-title">What the auditor is looking at</h2>
        <ul className="audit-feed mt-3" aria-live="polite">
          {[...d.events].reverse().slice(0, 40).map((e, i) => (
            <li key={`${e.t}-${i}`} className={`audit-feed__item audit-feed__item--${e.type}`}>
              <span className="audit-feed__tool">{e.type === "tool" ? e.tool : e.type === "tool_error" ? "error" : "•"}</span>
              <span className="truncate font-mono text-xs">{e.type === "tool" ? [e.pattern && `“${e.pattern}”`, e.path].filter(Boolean).join(" in ") || "." : e.text ?? e.tool}</span>
            </li>
          ))}
          {!d.events.length && <li className="text-sm text-[var(--muted)]">Waiting for the auditor to start…</li>}
        </ul>
      </section>
    </div>
    <LivePreview id={id} preview={d.meta.preview} />
    </div>
  );
}
