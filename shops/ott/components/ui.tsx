"use client";
import Link from "next/link";
import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { computePrice, useRiptide, useSession, type PriceResult } from "@riptide/core";
import type { OttState } from "@/shop.config";
import type { PlanId } from "@/lib/plans";
import { genreName, runtime, type Title } from "@/lib/catalogue";

/**
 * Engine price for a plan as if it were the one selected (plan + GST + any manifest lines),
 * without touching the session. Plan cards and the account page use this so every amount
 * shown comes from the pricing engine.
 */
export function usePlanQuote(plan: PlanId, step = "plans"): PriceResult {
  const { config, manifest } = useRiptide();
  return useMemo(
    () => computePrice(config, { ...config.initialState, plan, selected: {} } as OttState, manifest.overrides, step),
    [config, manifest, plan, step],
  );
}

export function useOtt() {
  return useSession<OttState>();
}

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <span className="rb-logo" aria-label="Reelbox">
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
        <rect x="2" y="5" width="28" height="22" rx="7" fill="var(--rt-primary)" />
        <circle cx="8" cy="10" r="1.6" fill="var(--rt-bg)" /><circle cx="8" cy="16" r="1.6" fill="var(--rt-bg)" /><circle cx="8" cy="22" r="1.6" fill="var(--rt-bg)" />
        <path d="M14 10.5v11l9-5.5z" fill="var(--rt-bg)" />
      </svg>
      <span className="rb-logo__word">reel<b>box</b></span>
    </span>
  );
}

const ICONS: Record<string, string> = {
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5",
  play: "M8 5v14l11-7z",
  plus: "M12 5v14M5 12h14",
  check: "M5 12.5l4.5 4.5L19 7.5",
  info: "M12 8h.01M11 11h1v6h1M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z",
  down: "M5 12l7 7 7-7M12 4v15",
  tv: "M3 6h18v11H3zM8 21h8",
  kids: "M12 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM6 20c0-3.3 2.7-6 6-6s6 2.7 6 6",
  close: "M6 6l12 12M18 6L6 18",
  list: "M4 6h16M4 12h16M4 18h10",
  left: "M15 5l-7 7 7 7",
  right: "M9 5l7 7-7 7",
  star: "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z",
};
export function Icon({ name, size = 20, fill = false }: { name: keyof typeof ICONS | string; size?: number; fill?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden fill={fill ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d={ICONS[name]} />
    </svg>
  );
}

/** Split a title into ≤3 lines of roughly `max` characters for the poster lettering. */
function wrap(text: string, max: number): string[] {
  const out: string[] = [];
  for (const w of text.split(" ")) {
    const last = out[out.length - 1];
    if (last && (last + " " + w).length <= max) out[out.length - 1] = `${last} ${w}`;
    else out.push(w);
  }
  return out.slice(0, 4);
}

/** Generated poster art: genre motif + gradient from the title's seeded palette + the title itself. */
export function Poster({ t, className, wide = false }: { t: Title; className?: string; wide?: boolean }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [a, b, ink] = t.palette;
  const W = wide ? 480 : 200, H = wide ? 270 : 300;
  const lines = wrap(t.title, wide ? 18 : 11);
  const fs = wide ? 34 : lines.some((l) => l.length > 9) ? 21 : 25;
  const cx = W * (0.3 + t.shape * 0.2), cy = H * 0.36;
  const motif: Record<string, ReactNode> = {
    drama: <><circle cx={cx} cy={cy} r={H * 0.2} fill={ink} opacity=".85" /><rect y={H * 0.48} width={W} height={H * 0.6} fill={a} opacity=".75" /></>,
    thriller: <>{[0, 1, 2, 3, 4].map((i) => <rect key={i} x={-W * 0.2 + i * W * 0.28} y={-20} width={W * 0.08} height={H * 1.2} fill={ink} opacity={0.06 + i * 0.03} transform={`rotate(18 ${W / 2} ${H / 2})`} />)}<circle cx={cx} cy={cy} r={H * 0.07} fill={ink} opacity=".9" /></>,
    comedy: <>{Array.from({ length: 14 }, (_, i) => <circle key={i} cx={(i * 53 + t.shape * 31) % W} cy={(i * 37) % (H * 0.6)} r={4 + (i % 4) * 3} fill={i % 2 ? ink : a} opacity=".55" />)}</>,
    scifi: <><circle cx={cx} cy={cy} r={H * 0.16} fill={ink} opacity=".18" /><circle cx={cx} cy={cy} r={H * 0.11} fill={b} /><ellipse cx={cx} cy={cy} rx={H * 0.26} ry={H * 0.05} fill="none" stroke={ink} strokeWidth="2" opacity=".7" transform={`rotate(-14 ${cx} ${cy})`} /></>,
    romance: <><circle cx={cx - H * 0.08} cy={cy} r={H * 0.14} fill={ink} opacity=".35" /><circle cx={cx + H * 0.08} cy={cy} r={H * 0.14} fill={b} opacity=".8" /></>,
    documentary: <>{[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M0 ${H * 0.2 + i * 18} Q ${W / 2} ${H * 0.05 + i * 22 + t.shape * 8} ${W} ${H * 0.25 + i * 16}`} fill="none" stroke={ink} strokeWidth="1.5" opacity={0.15 + i * 0.07} />)}</>,
    family: <><circle cx={W * 0.78} cy={H * 0.18} r={H * 0.08} fill={ink} opacity=".6" /><ellipse cx={W * 0.3} cy={H * 0.62} rx={W * 0.55} ry={H * 0.2} fill={a} opacity=".7" /><ellipse cx={W * 0.85} cy={H * 0.66} rx={W * 0.5} ry={H * 0.18} fill={b} opacity=".6" /></>,
    crime: <>{Array.from({ length: 9 }, (_, i) => <rect key={i} x={0} y={i * H * 0.07} width={W} height={H * 0.035} fill={ink} opacity=".08" />)}<rect x={cx - 3} y={0} width={6} height={H * 0.55} fill={ink} opacity=".5" /></>,
  };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} role="img" aria-label={`${t.title} poster`} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={`g${uid}`} x1="0" y1="0" x2={t.shape === 1 ? "1" : "0.3"} y2="1">
          <stop offset="0" stopColor={b} /><stop offset="1" stopColor={a} />
        </linearGradient>
        <linearGradient id={`s${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset=".45" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".55" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#g${uid})`} />
      {motif[t.genre]}
      <rect width={W} height={H} fill={`url(#s${uid})`} />
      <text x={wide ? 28 : 14} y={wide ? 30 : 22} fill={ink} opacity=".75" style={{ font: `600 ${wide ? 11 : 8}px var(--rt-font-body)`, letterSpacing: "0.18em" }}>
        {t.kind === "series" ? "REELBOX SERIES" : "REELBOX FILM"}
      </text>
      <text x={wide ? 28 : 14} y={H - (wide ? 28 : 16) - (lines.length - 1) * fs * 1.02} fill="#fff" style={{ font: `700 ${fs}px/1 var(--rt-font-heading)`, letterSpacing: "-0.02em" }}>
        {lines.map((l, i) => <tspan key={i} x={wide ? 28 : 14} dy={i ? fs * 1.02 : 0}>{l}</tspan>)}
      </text>
    </svg>
  );
}

export function TitleCard({ t, children }: { t: Title; children?: ReactNode }) {
  const { base } = useRiptide();
  return (
    <Link href={`${base}/title/${t.id}`} className="rb-tile" aria-label={`${t.title}, ${genreName(t.genre)}, ${t.year}`}>
      <Poster t={t} className="rb-tile__art" />
      {children}
      <span className="rb-tile__meta"><span>{t.year}</span><span>{t.maturity}</span><span>{runtime(t)}</span></span>
    </Link>
  );
}

/** Horizontal rail with visible previous/next buttons (no hover-only controls, no infinite scroll). */
export function Rail({ title, href, children }: { title: string; href?: string; children: ReactNode }) {
  const id = useId();
  const scroll = (dir: number) => document.getElementById(id)?.scrollBy({ left: dir * 640, behavior: "smooth" });
  return (
    <section className="rb-rail" aria-label={title}>
      <div className="rb-rail__head">
        <h2 className="rb-h3">{title}</h2>
        {href && <Link href={href} className="rb-rail__all">See all</Link>}
        <div className="rb-rail__nav">
          <button type="button" className="rb-iconbtn" aria-label={`Scroll ${title} left`} onClick={() => scroll(-1)}><Icon name="left" /></button>
          <button type="button" className="rb-iconbtn" aria-label={`Scroll ${title} right`} onClick={() => scroll(1)}><Icon name="right" /></button>
        </div>
      </div>
      <div id={id} className="rb-rail__track">{children}</div>
    </section>
  );
}

export function Stars({ value, count }: { value: number; count?: number }) {
  return (
    <span className="rb-stars" aria-label={`Rated ${value} out of 5${count ? ` by ${count.toLocaleString("en-IN")} viewers` : ""}`}>
      <Icon name="star" size={15} fill /> <b>{value.toFixed(1)}</b>{count !== undefined && <span className="rb-muted">({count.toLocaleString("en-IN")})</span>}
    </span>
  );
}

/** Minimal toast: `const [toast, show] = useToast()`; render {toast}. */
export function useToast(): [ReactNode, (msg: string) => void] {
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 3200);
    return () => clearTimeout(t);
  }, [msg]);
  return [<div key="toast" className="rb-toast" role="status" aria-live="polite" data-open={msg ? "" : undefined}>{msg}</div>, setMsg];
}

const SIGNUP_STEPS = [
  { step: "plans", label: "Plan" },
  { step: "signup-email", label: "Email" },
  { step: "signup-password", label: "Password" },
  { step: "signup-plan", label: "Review" },
  { step: "payment", label: "Payment" },
];
export function SignupProgress({ current }: { current: string }) {
  const i = SIGNUP_STEPS.findIndex((s) => s.step === current);
  return (
    <ol className="rb-progress" aria-label="Sign-up progress">
      {SIGNUP_STEPS.map((s, k) => (
        <li key={s.step} data-state={k < i ? "done" : k === i ? "current" : "todo"} aria-current={k === i ? "step" : undefined}>
          <span>{k + 1}</span>{s.label}
        </li>
      ))}
    </ol>
  );
}
