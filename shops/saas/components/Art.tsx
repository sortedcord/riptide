/** Generated for Riptide: Prism Studio logo, app icons and hero art. All original inline SVG. */

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`} role="img" aria-label="Prism Studio">
      <svg viewBox="0 0 34 30" className="h-[1.6em] w-auto" aria-hidden>
        <defs>
          <linearGradient id="ps-logo-g" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#E8553D" /><stop offset=".35" stopColor="#F2A93B" />
            <stop offset=".65" stopColor="#2FA7B8" /><stop offset="1" stopColor="#8B4FC9" />
          </linearGradient>
        </defs>
        <path d="M14 3 26 27H2Z" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round" />
        <path d="M14 3 18.5 27" stroke="currentColor" strokeWidth="1.6" />
        <path d="M17 15 33 10v3.5l-16 4.5Z" fill="url(#ps-logo-g)" />
      </svg>
      <span aria-hidden className="text-[1.15em] leading-none tracking-[-0.03em]"><b className="font-heading font-extrabold">prism</b><span className="font-medium"> studio</span></span>
    </span>
  );
}

const TILE: Record<string, [string, string]> = {
  lumen: ["#F6B54A", "#E0612E"],
  contour: ["#3DB39F", "#17677A"],
  framewise: ["#8C55D6", "#43279A"],
  tessera: ["#EA6A86", "#9D2E57"],
  quire: ["#5B8CF0", "#233F9E"],
  kern: ["#59554E", "#22211F"],
};

/** Faceted app glyphs: shapes only, no letters. */
function Glyph({ id }: { id: string }) {
  const s = { fill: "none", stroke: "#FFFDF8", strokeWidth: 3, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  switch (id) {
    case "lumen":
      return (<g {...s}><circle cx="32" cy="32" r="13" /><path d="M32 19l6 11M45 32l-12 1M38 43l-7-10M24 42l7-10M19 30l13 2M27 20l5 12" strokeWidth="2" /></g>);
    case "contour":
      return (<g {...s}><path d="M16 44C22 22 42 42 48 20" /><rect x="13" y="41" width="6" height="6" fill="#FFFDF8" stroke="none" /><rect x="45" y="17" width="6" height="6" fill="#FFFDF8" stroke="none" /><path d="M16 44 30 26M48 20 36 38" strokeWidth="1.5" strokeDasharray="2 3" /></g>);
    case "framewise":
      return (<g {...s}><rect x="15" y="20" width="26" height="20" rx="3" /><rect x="22" y="25" width="26" height="20" rx="3" fill="rgb(255 253 248 / .18)" /><path d="M32 31v8l7-4Z" fill="#FFFDF8" stroke="none" /></g>);
    case "tessera":
      return (<g {...s}><rect x="15" y="15" width="15" height="15" rx="2" /><rect x="34" y="15" width="15" height="9" rx="2" fill="rgb(255 253 248 / .3)" /><rect x="34" y="28" width="15" height="21" rx="2" /><rect x="15" y="34" width="15" height="15" rx="2" fill="rgb(255 253 248 / .3)" /></g>);
    case "quire":
      return (<g {...s}><path d="M20 14h17l9 9v27H20Z" /><path d="M37 14v9h9" /><path d="M26 32h14M26 38h14M26 44h8" strokeWidth="2" /></g>);
    case "kern":
      return (<g {...s}><path d="M20 16v32M14 16h12M14 48h12M44 16v32M38 16h12M38 48h12" /><path d="M28 32h8M30 28l-3 4 3 4M34 28l3 4-3 4" strokeWidth="2" /></g>);
    default:
      return null;
  }
}

export function AppIcon({ id, size = 56, className }: { id: string; size?: number; className?: string }) {
  const [a, b] = TILE[id] ?? ["#777", "#333"];
  const gid = `ps-tile-${id}`;
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></linearGradient>
      </defs>
      {/* Cut-corner tile: the Prism facet */}
      <path d="M10 2h44l8 8v44l-8 8H10l-8-8V10Z" fill={`url(#${gid})`} />
      <path d="M54 2l8 8H54Z" fill="rgb(255 255 255 / .35)" />
      <Glyph id={id} />
    </svg>
  );
}

export function HeroArt() {
  return (
    <svg viewBox="0 0 560 440" className="h-auto w-full" aria-hidden>
      <defs>
        <linearGradient id="ps-beam" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#E8553D" /><stop offset=".2" stopColor="#F2A93B" /><stop offset=".4" stopColor="#6DBE6A" />
          <stop offset=".6" stopColor="#2FA7B8" /><stop offset=".8" stopColor="#3140C9" /><stop offset="1" stopColor="#8B4FC9" />
        </linearGradient>
        <linearGradient id="ps-glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFDF8" /><stop offset="1" stopColor="#E3DDCF" /></linearGradient>
      </defs>
      <path d="M0 214 L228 200" stroke="#1B1A21" strokeWidth="3" />
      <path d="M300 196 L560 96 L560 330 Z" fill="url(#ps-beam)" opacity=".92" />
      <path d="M210 60 L370 340 H50 Z" fill="url(#ps-glass)" stroke="#1B1A21" strokeWidth="3" strokeLinejoin="round" />
      <path d="M210 60 L240 340" stroke="#1B1A21" strokeWidth="1.5" opacity=".5" />
      <g transform="translate(400 300) rotate(-8)"><rect width="120" height="90" rx="12" fill="#FFFDF8" stroke="#1B1A21" strokeWidth="2" /><path d="M14 70 44 38l18 20 14-12 30 24" fill="none" stroke="#E0612E" strokeWidth="3" strokeLinejoin="round" /><circle cx="88" cy="26" r="8" fill="#F6B54A" /></g>
      <g transform="translate(380 40) rotate(6)"><rect width="110" height="70" rx="12" fill="#1B1A21" /><path d="M16 50C30 16 60 52 94 18" fill="none" stroke="#3DB39F" strokeWidth="3" /><rect x="12" y="46" width="8" height="8" fill="#FFFDF8" /><rect x="90" y="14" width="8" height="8" fill="#FFFDF8" /></g>
    </svg>
  );
}
