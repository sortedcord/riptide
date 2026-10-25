import type { UiMock } from "@/lib/audits";

/**
 * Draws the auditor's reconstruction of an offending screen as SVG: a small browser frame with the page name,
 * the elements stacked as the user sees them, and the rule-breaking ones ringed and numbered.
 * Everything is built from structured fields; text goes in as escaped SVG text nodes, never as markup.
 */
const W = 380, PAD = 18, LINE = 17;

/** Greedy word wrap by an average glyph width (12.5px font ≈ 6.6px per char). */
function wrap(text: string, width: number, px = 6.6): string[] {
  const max = Math.max(8, Math.floor(width / px));
  const out: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    if ((line + " " + word).trim().length > max && line) { out.push(line); line = word; } else line = (line + " " + word).trim();
  }
  if (line) out.push(line);
  return out.slice(0, 4);
}

type El = UiMock["elements"][number];

/** Height and drawing of one element at y. */
function layout(e: El, y: number, inner: number): { h: number; node: React.ReactNode } {
  const x = PAD;
  switch (e.kind) {
    case "heading":
      return { h: 26, node: <text x={x} y={y + 18} className="mk-h">{e.text}</text> };
    case "text": {
      const lines = wrap(e.text, inner);
      return { h: lines.length * LINE + 6, node: <text x={x} y={y + 14} className="mk-t">{lines.map((l, i) => <tspan key={i} x={x} dy={i ? LINE : 0}>{l}</tspan>)}</text> };
    }
    case "checkbox": {
      const lines = wrap(e.text, inner - 26);
      return { h: Math.max(24, lines.length * LINE + 8), node: (
        <g>
          <rect x={x} y={y + 4} width={15} height={15} rx={3} className={e.checked ? "mk-box mk-box--on" : "mk-box"} />
          {e.checked && <path d={`M ${x + 3.5} ${y + 11.5} l 3 3 l 5.5 -6.5`} className="mk-tick" />}
          <text x={x + 24} y={y + 16} className="mk-t">{lines.map((l, i) => <tspan key={i} x={x + 24} dy={i ? LINE : 0}>{l}</tspan>)}</text>
        </g>
      ) };
    }
    case "toggle":
      return { h: 28, node: (
        <g>
          <rect x={x} y={y + 5} width={32} height={18} rx={9} className={e.checked ? "mk-sw mk-sw--on" : "mk-sw"} />
          <circle cx={e.checked ? x + 23 : x + 9} cy={y + 14} r={6.5} className="mk-knob" />
          <text x={x + 42} y={y + 18} className="mk-t">{wrap(e.text, inner - 42)[0]}</text>
        </g>
      ) };
    case "button": {
      const em = e.emphasis ?? "secondary";
      if (em === "tiny" || em === "muted") return { h: 22, node: <text x={x} y={y + 15} className={em === "tiny" ? "mk-tiny" : "mk-muted"}>{e.text}</text> };
      const bw = Math.min(inner, Math.max(110, e.text.length * 7.4 + 28));
      return { h: 42, node: (
        <g>
          <rect x={x} y={y + 4} width={bw} height={32} rx={8} className={em === "primary" ? "mk-btn mk-btn--p" : "mk-btn"} />
          <text x={x + bw / 2} y={y + 25} textAnchor="middle" className={em === "primary" ? "mk-btn-t mk-btn-t--p" : "mk-btn-t"}>{e.text}</text>
        </g>
      ) };
    }
    case "price":
      return { h: 24, node: (
        <g>
          <text x={x} y={y + 16} className="mk-t">{wrap(e.text, inner - 70)[0]}</text>
          <text x={x + inner} y={y + 16} textAnchor="end" className="mk-amt">{e.amount ?? ""}</text>
        </g>
      ) };
    case "badge": {
      const bw = e.text.length * 6.6 + 18;
      return { h: 26, node: <g><rect x={x} y={y + 4} width={bw} height={19} rx={9.5} className="mk-badge" /><text x={x + 9} y={y + 17.5} className="mk-badge-t">{e.text}</text></g> };
    }
    case "timer": {
      const bw = e.text.length * 7 + 34;
      return { h: 30, node: <g><rect x={x} y={y + 4} width={bw} height={23} rx={6} className="mk-timer" /><text x={x + 10} y={y + 20} className="mk-timer-t">⏱ {e.text}</text></g> };
    }
    case "banner": {
      const lines = wrap(e.text, inner - 20);
      const h = lines.length * LINE + 16;
      return { h: h + 8, node: (
        <g>
          <rect x={x} y={y + 4} width={inner} height={h} rx={8} className="mk-banner" />
          <text x={x + 10} y={y + 20} className="mk-t">{lines.map((l, i) => <tspan key={i} x={x + 10} dy={i ? LINE : 0}>{l}</tspan>)}</text>
        </g>
      ) };
    }
    case "input":
      return { h: 40, node: <g><rect x={x} y={y + 4} width={inner} height={30} rx={6} className="mk-input" /><text x={x + 10} y={y + 24} className="mk-muted">{e.text}</text></g> };
    case "link":
      return { h: 22, node: <text x={x} y={y + 15} className="mk-link">{e.text}</text> };
  }
}

export function UiMockSvg({ mock, title }: { mock: UiMock; title: string }) {
  const inner = W - PAD * 2;
  // Lay out top to bottom first (a plain loop), then render.
  const placed: { e: El; top: number; h: number; node: React.ReactNode; mark: number }[] = [];
  let y = 44, n = 0;
  for (const e of mock.elements) {
    const { h, node } = layout(e, y, inner);
    placed.push({ e, top: y, h, node, mark: e.flagged ? ++n : 0 });
    y += h + 6;
  }
  const drawn = placed.map(({ e, top, h, node, mark }, i) => {
    return (
      <g key={i}>
        {node}
        {e.flagged && (
          <g>
            <rect x={PAD - 6} y={top} width={inner + 12} height={h + 2} rx={8} className="mk-flag" />
            <circle cx={W - 10} cy={top + 10} r={9} className="mk-flag-dot" />
            <text x={W - 10} y={top + 14} textAnchor="middle" className="mk-flag-n">{mark}</text>
          </g>
        )}
      </g>
    );
  });
  const H = y + 10;
  return (
    <svg viewBox={`0 0 ${W + 12} ${H}`} width="100%" style={{ maxWidth: W + 12 }} role="img" aria-label={`${title}: reconstruction of the ${mock.page} screen, problem elements ringed`} className="mk">
      <rect x={0.5} y={0.5} width={W - 1} height={H - 1} rx={12} className="mk-frame" />
      <rect x={0.5} y={0.5} width={W - 1} height={30} rx={12} className="mk-chrome" />
      <rect x={0.5} y={18} width={W - 1} height={13} className="mk-chrome" />
      {[14, 28, 42].map((cx) => <circle key={cx} cx={cx} cy={15.5} r={4} className="mk-dot" />)}
      <rect x={58} y={7} width={W - 76} height={17} rx={8.5} className="mk-url" />
      <text x={68} y={19.5} className="mk-url-t">{mock.page}</text>
      {drawn}
    </svg>
  );
}
