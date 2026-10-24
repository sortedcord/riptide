import Link from "next/link";
import type { ReactNode } from "react";

export const inr = (n: number | null | undefined) =>
  n == null ? "—" : `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export function ago(iso: string | number | undefined) {
  if (!iso) return "—";
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

const TONES: Record<string, string> = {
  passed: "ok", done: "ok", completed: "ok", reached_payment: "ok", avoided: "ok",
  failed: "bad", timeout: "bad", error: "bad", gave_up: "bad", accepted: "bad",
  running: "info", pending: "warn", incomplete: "warn", stopped: "muted", stopped_early: "warn", flagged_for_human: "warn",
};

export function Badge({ children, tone }: { children: ReactNode; tone?: string }) {
  const t = tone ?? TONES[String(children)] ?? "muted";
  return <span className={`badge badge-${t}`}>{children}</span>;
}

export const Pass = ({ ok }: { ok: boolean }) => <Badge tone={ok ? "ok" : "bad"}>{ok ? "pass" : "fail"}</Badge>;

export function Card({ title, actions, children, className = "" }: { title?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`card ${className}`}>
      {(title || actions) && (
        <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
          {title && <h2 className="text-sm font-semibold tracking-wide text-[var(--fg)]">{title}</h2>}
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}

export const Page = ({ title, sub, actions, children }: { title: ReactNode; sub?: ReactNode; actions?: ReactNode; children: ReactNode }) => (
  <div className="space-y-5">
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        {sub && <p className="mt-1 text-sm text-[var(--muted)]">{sub}</p>}
      </div>
      {actions}
    </header>
    {children}
  </div>
);

export const Stat = ({ label, value, href }: { label: string; value: ReactNode; href?: string }) => {
  const body = (
    <>
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wider text-[var(--muted)]">{label}</div>
    </>
  );
  return href ? <Link href={href} className="card block hover:border-[var(--accent)]">{body}</Link> : <div className="card">{body}</div>;
};

export const Empty = ({ children }: { children: ReactNode }) => <p className="py-6 text-center text-sm text-[var(--muted)]">{children}</p>;

export const Kv = ({ rows }: { rows: [string, ReactNode][] }) => (
  <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1.5 text-sm">
    {rows.map(([k, v]) => (
      <div key={k} className="contents">
        <dt className="text-[var(--muted)]">{k}</dt>
        <dd className="min-w-0 break-words">{v}</dd>
      </div>
    ))}
  </dl>
);

/** Unified diff with +/- colouring. */
export function Diff({ text }: { text: string }) {
  if (!text.trim()) return <Empty>No changes.</Empty>;
  return (
    <pre className="code max-h-[70vh]">
      {text.split("\n").map((l, i) => {
        const c = l.startsWith("+++") || l.startsWith("---") || l.startsWith("diff ") || l.startsWith("# ---") ? "d-file"
          : l.startsWith("@@") ? "d-hunk" : l.startsWith("+") ? "d-add" : l.startsWith("-") ? "d-del" : "";
        return <div key={i} className={c}>{l || " "}</div>;
      })}
    </pre>
  );
}

export const Json = ({ value, summary = "Raw JSON" }: { value: unknown; summary?: string }) => (
  <details className="group">
    <summary className="cursor-pointer text-xs text-[var(--muted)] hover:text-[var(--fg)]">{summary}</summary>
    <pre className="code mt-2 max-h-[60vh]">{JSON.stringify(value, null, 2)}</pre>
  </details>
);

/** 0–100 bar; null shows as pending. */
export function Bar({ value }: { value: number | null }) {
  if (value == null) return <span className="text-xs text-[var(--muted)]">pending</span>;
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[var(--surface-2)]">
        <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
      <span className="tabular-nums text-xs">{Math.round(value)}</span>
    </div>
  );
}

export const Stars = ({ n }: { n: number }) => (
  <span aria-label={`${n} of 5 stars`} className="tracking-tight text-[var(--warn)]">{"★".repeat(n)}<span className="text-[var(--border)]">{"★".repeat(5 - n)}</span></span>
);
