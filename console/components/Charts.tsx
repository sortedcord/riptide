"use client";
import Link from "next/link";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

/**
 * Small inline-SVG charts for ratings (0–100 scale throughout). Text uses text tokens, never the series colour;
 * every mark has a hover/focus tooltip and every chart a table view, so nothing depends on colour or hover alone.
 */

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

const fmt = (v: number | null | undefined) => (v == null ? "—" : String(Math.round(v * 10) / 10));

function Tip({ x, y, children, right }: { x: number; y: number; children: ReactNode; right?: boolean }) {
  return (
    <div role="tooltip" className="viz-tip" style={{ left: x, top: y, transform: right ? "translate(-100%, -100%) translate(-10px, -8px)" : "translate(10px, -100%) translate(0, -8px)" }}>
      {children}
    </div>
  );
}

export function TableView({ head, rows }: { head: string[]; rows: (string | number | null)[][] }) {
  return (
    <details className="mt-3">
      <summary className="cursor-pointer text-xs text-[var(--muted)]">Table view</summary>
      <div className="scroll-x mt-2">
        <table className="t">
          <thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className={j ? "tabular-nums" : ""}>{c ?? "—"}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </details>
  );
}

// ------------------------------------------------------------------ horizontal bars (one rating per agent)

export type BarRow = { id: string; label: string; value: number; color: string; href?: string; detail: [string, number | null][] };

export function RatingBars({ rows }: { rows: BarRow[] }) {
  const [ref, w] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<{ i: number; x: number; y: number } | null>(null);
  const LABEL = Math.min(220, Math.max(120, w * 0.3)), BAR = 18, GAP = 14, VALUE = 44;
  const plot = Math.max(0, w - LABEL - VALUE);
  const H = rows.length * (BAR + GAP) + 22;
  const x = (v: number) => LABEL + (plot * Math.max(0, Math.min(100, v))) / 100;

  return (
    <div ref={ref} className="viz relative" onPointerLeave={() => setHover(null)}>
      {w > 0 && (
        <svg width={w} height={H} role="img" aria-label="Overall rating per agent, 0 to 100">
          {[0, 25, 50, 75, 100].map((t) => (
            <g key={t}>
              <line x1={x(t)} x2={x(t)} y1={0} y2={H - 18} className="viz-grid" />
              <text x={x(t)} y={H - 4} textAnchor="middle" className="viz-axis">{t}</text>
            </g>
          ))}
          {rows.map((r, i) => {
            const y = i * (BAR + GAP) + 4;
            const bar = (
              <g
                onPointerMove={(e) => { const b = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect(); setHover({ i, x: e.clientX - b.left, y: e.clientY - b.top }); }}
                onFocus={() => setHover({ i, x: x(r.value), y })} onBlur={() => setHover(null)}
              >
                <rect x={0} y={y - GAP / 2} width={w} height={BAR + GAP} fill="transparent" />
                <text x={LABEL - 10} y={y + BAR / 2} dominantBaseline="central" textAnchor="end" className="viz-label">{r.label}</text>
                <path d={`M ${LABEL} ${y} H ${Math.max(LABEL, x(r.value) - 4)} a 4 4 0 0 1 4 4 V ${y + BAR - 4} a 4 4 0 0 1 -4 4 H ${LABEL} Z`} fill={r.color} />
                <text x={x(r.value) + 8} y={y + BAR / 2} dominantBaseline="central" className="viz-value">{fmt(r.value)}</text>
              </g>
            );
            return r.href ? <Link key={r.id} href={r.href} aria-label={`${r.label}: ${fmt(r.value)}. Open agent page`}>{bar}</Link> : <g key={r.id}>{bar}</g>;
          })}
        </svg>
      )}
      {hover && rows[hover.i] && (
        <Tip x={hover.x} y={hover.y} right={hover.x > w * 0.6}>
          <div className="viz-tip__head"><span className="viz-swatch" style={{ background: rows[hover.i].color }} />{rows[hover.i].label}</div>
          <div className="viz-tip__row"><b>{fmt(rows[hover.i].value)}</b> overall</div>
          {rows[hover.i].detail.map(([k, v]) => <div key={k} className="viz-tip__row"><b>{fmt(v)}</b> {k}</div>)}
        </Tip>
      )}
      <TableView head={["Agent", "Overall", ...(rows[0]?.detail.map(([k]) => k) ?? [])]} rows={rows.map((r) => [r.label, fmt(r.value), ...r.detail.map(([, v]) => fmt(v))])} />
    </div>
  );
}

// ------------------------------------------------------------------ lines over suites

export type Series = { name: string; color: string; values: (number | null)[]; strong?: boolean };

export function LineChart({ x, series, label, height = 240 }: { x: { label: string; sub?: string }[]; series: Series[]; label: string; height?: number }) {
  const [ref, w] = useWidth<HTMLDivElement>();
  const [at, setAt] = useState<number | null>(null);
  const L = 34, Rt = series.length > 1 && series.length <= 4 ? 96 : 16, T = 10, B = 42;
  const pw = Math.max(0, w - L - Rt), ph = height - T - B;
  const xi = (i: number) => L + (x.length === 1 ? pw / 2 : (pw * i) / (x.length - 1));
  const yv = (v: number) => T + ph - (ph * Math.max(0, Math.min(100, v))) / 100;
  const nearest = (px: number) => (x.length === 1 ? 0 : Math.max(0, Math.min(x.length - 1, Math.round(((px - L) / pw) * (x.length - 1)))));
  const path = (vals: (number | null)[]) => {
    let d = "", pen = false;
    vals.forEach((v, i) => { if (v == null) { pen = false; return; } d += `${pen ? "L" : "M"} ${xi(i)} ${yv(v)} `; pen = true; });
    return d;
  };
  const lastIdx = (vals: (number | null)[]) => { for (let i = vals.length - 1; i >= 0; i--) if (vals[i] != null) return i; return -1; };

  return (
    <div className="viz">
      {series.length > 1 && (
        <ul className="viz-legend" aria-label="Legend">
          {series.map((s) => <li key={s.name}><span className="viz-swatch" style={{ background: s.color }} />{s.name}</li>)}
        </ul>
      )}
      <div ref={ref} className="relative" onPointerLeave={() => setAt(null)}>
        {w > 0 && (
          <svg width={w} height={height} role="img" aria-label={label} tabIndex={0}
            onPointerMove={(e) => { const b = e.currentTarget.getBoundingClientRect(); setAt(nearest(e.clientX - b.left)); }}
            onFocus={() => setAt(x.length - 1)} onBlur={() => setAt(null)}
            onKeyDown={(e) => { if (e.key === "ArrowLeft") setAt((a) => Math.max(0, (a ?? 0) - 1)); if (e.key === "ArrowRight") setAt((a) => Math.min(x.length - 1, (a ?? -1) + 1)); }}>
            {[0, 25, 50, 75, 100].map((t) => (
              <g key={t}>
                <line x1={L} x2={L + pw} y1={yv(t)} y2={yv(t)} className="viz-grid" />
                <text x={L - 8} y={yv(t)} dominantBaseline="central" textAnchor="end" className="viz-axis">{t}</text>
              </g>
            ))}
            {x.map((c, i) => (
              <g key={c.label}>
                <text x={xi(i)} y={T + ph + 16} textAnchor="middle" className="viz-axis">{c.label}</text>
                {c.sub && <text x={xi(i)} y={T + ph + 30} textAnchor="middle" className="viz-axis viz-axis--sub">{c.sub}</text>}
              </g>
            ))}
            {at != null && <line x1={xi(at)} x2={xi(at)} y1={T} y2={T + ph} className="viz-crosshair" />}
            {series.map((s) => (
              <g key={s.name}>
                <path d={path(s.values)} fill="none" stroke={s.color} strokeWidth={s.strong ? 2.5 : 2} strokeLinejoin="round" strokeLinecap="round" />
                {s.values.map((v, i) => v == null ? null : (
                  <circle key={i} cx={xi(i)} cy={yv(v)} r={at === i ? 5.5 : 4.5} fill={s.color} className="viz-dot" />
                ))}
                {series.length > 1 && series.length <= 4 && lastIdx(s.values) >= 0 && (
                  <text x={xi(lastIdx(s.values)) + 10} y={yv(s.values[lastIdx(s.values)]!)} dominantBaseline="central" className="viz-label">{s.name}</text>
                )}
              </g>
            ))}
          </svg>
        )}
        {at != null && x[at] && (
          <Tip x={xi(at)} y={T + 6} right={xi(at) > w * 0.6}>
            <div className="viz-tip__head">{x[at].label}{x[at].sub ? <span className="text-[var(--muted)]"> · {x[at].sub}</span> : null}</div>
            {series.map((s) => <div key={s.name} className="viz-tip__row"><span className="viz-swatch" style={{ background: s.color }} /><b>{fmt(s.values[at])}</b> {s.name}</div>)}
          </Tip>
        )}
      </div>
      {x.length === 1 && <p className="mt-1 text-xs text-[var(--muted)]">One suite so far; the line appears once this agent is rated on another suite.</p>}
      <TableView head={["Suite", ...series.map((s) => s.name)]} rows={x.map((c, i) => [`${c.label}${c.sub ? ` (${c.sub})` : ""}`, ...series.map((s) => fmt(s.values[i]))])} />
    </div>
  );
}
