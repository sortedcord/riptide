/**
 * Generated product illustrations (inline SVG, generated for Riptide). One flat drawing per product kind,
 * tinted by the chosen colour; `view` gives 4 compositions (front, angle, detail, in the box).
 * No hooks, so it renders in server and client components alike.
 */
import type { ReactNode } from "react";

export type ArtKind =
  | "phone" | "earbuds" | "smartwatch" | "laptop" | "speaker" | "powerbank" | "headphones"
  | "tshirt" | "shoe" | "backpack" | "kurta" | "jeans" | "sunglasses" | "analog"
  | "kettle" | "mixer" | "cooker" | "bedsheet" | "lamp" | "pan" | "bottle"
  | "tube" | "pump" | "trimmer" | "perfume" | "lipstick" | "jar"
  | "mat" | "dumbbell" | "bat" | "ball" | "helmet" | "racquet"
  | "sack" | "pouch" | "oil";

function mix(hex: string, to: string, t: number) {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const a = p(hex), b = p(to);
  return `#${a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, "0")).join("")}`;
}

type Pal = { c: string; a: string; s: string; h: string; ink: string };

const shapes: Record<ArtKind, (p: Pal) => ReactNode> = {
  phone: ({ c, s, h, ink }) => (<>
    <rect x="62" y="22" width="76" height="156" rx="14" fill={c} />
    <rect x="68" y="30" width="64" height="140" rx="9" fill={ink} />
    <rect x="68" y="30" width="64" height="140" rx="9" fill="url(#g)" opacity=".5" />
    <rect x="88" y="34" width="24" height="5" rx="2.5" fill={s} />
    <circle cx="100" cy="98" r="22" fill={h} opacity=".35" />
    <path d="M78 150h44" stroke={h} strokeWidth="3" strokeLinecap="round" opacity=".6" />
  </>),
  earbuds: ({ c, s, h }) => (<>
    <rect x="48" y="104" width="104" height="62" rx="28" fill={s} />
    <rect x="48" y="96" width="104" height="30" rx="15" fill={c} />
    <circle cx="100" cy="134" r="3" fill={h} />
    <ellipse cx="74" cy="70" rx="16" ry="18" fill={c} /><rect x="68" y="78" width="10" height="34" rx="5" fill={c} />
    <ellipse cx="126" cy="70" rx="16" ry="18" fill={c} /><rect x="122" y="78" width="10" height="34" rx="5" fill={c} />
    <circle cx="72" cy="66" r="6" fill={h} opacity=".5" /><circle cx="128" cy="66" r="6" fill={h} opacity=".5" />
  </>),
  smartwatch: ({ c, a, s, ink }) => (<>
    <rect x="78" y="18" width="44" height="54" rx="10" fill={c} /><rect x="78" y="128" width="44" height="54" rx="10" fill={c} />
    <rect x="62" y="58" width="76" height="84" rx="20" fill={s} />
    <rect x="68" y="64" width="64" height="72" rx="15" fill={ink} />
    <text x="100" y="104" textAnchor="middle" fontSize="18" fontFamily="sans-serif" fontWeight="700" fill="#fff">10:08</text>
    <path d="M84 116h32" stroke={a} strokeWidth="4" strokeLinecap="round" />
    <rect x="138" y="88" width="6" height="18" rx="3" fill={s} />
  </>),
  laptop: ({ c, s, ink, a }) => (<>
    <rect x="44" y="46" width="112" height="76" rx="7" fill={c} />
    <rect x="50" y="52" width="100" height="64" rx="3" fill={ink} />
    <path d="M58 104l22-22 14 12 20-24 28 34z" fill={a} opacity=".55" />
    <path d="M30 124h140l-10 16H40z" fill={s} />
    <rect x="86" y="126" width="28" height="4" rx="2" fill={c} />
  </>),
  speaker: ({ c, s, h, a }) => (<>
    <rect x="46" y="62" width="108" height="86" rx="30" fill={c} />
    <circle cx="100" cy="105" r="28" fill={s} /><circle cx="100" cy="105" r="14" fill={c} /><circle cx="100" cy="105" r="5" fill={h} />
    <path d="M146 72c14 6 20 22 18 40" stroke={a} strokeWidth="6" fill="none" strokeLinecap="round" />
    {[60, 70, 80].map((x) => <circle key={x} cx={x} cy="130" r="2.5" fill={h} opacity=".7" />)}
  </>),
  powerbank: ({ c, s, a, h }) => (<>
    <rect x="58" y="34" width="84" height="132" rx="16" fill={c} />
    <rect x="58" y="34" width="84" height="20" rx="10" fill={s} />
    <rect x="76" y="40" width="10" height="6" rx="2" fill={h} /><rect x="94" y="40" width="10" height="6" rx="2" fill={h} /><rect x="112" y="40" width="12" height="6" rx="3" fill={h} />
    {[0, 1, 2, 3].map((i) => <rect key={i} x={78 + i * 12} y="140" width="8" height="8" rx="2" fill={i < 3 ? a : s} />)}
    <path d="M104 78l-14 22h12l-6 22 16-26h-12z" fill={a} />
  </>),
  headphones: ({ c, s, a }) => (<>
    <path d="M48 112c0-40 22-70 52-70s52 30 52 70" stroke={c} strokeWidth="12" fill="none" strokeLinecap="round" />
    <rect x="34" y="100" width="34" height="60" rx="14" fill={c} /><rect x="132" y="100" width="34" height="60" rx="14" fill={c} />
    <rect x="58" y="108" width="14" height="44" rx="7" fill={s} /><rect x="128" y="108" width="14" height="44" rx="7" fill={s} />
    <rect x="94" y="38" width="12" height="10" rx="3" fill={a} />
  </>),
  tshirt: ({ c, s, a }) => (<>
    <path d="M70 34l-38 22 16 30 16-8v88h72V78l16 8 16-30-38-22c-4 12-16 18-30 18s-26-6-30-18z" fill={c} />
    <path d="M70 34c4 12 16 18 30 18s26-6 30-18" stroke={s} strokeWidth="5" fill="none" />
    <rect x="112" y="92" width="14" height="14" rx="2" fill={a} opacity=".5" />
  </>),
  shoe: ({ c, a, s, h }) => (<>
    <path d="M28 132c0-18 6-38 20-50l22 6c8 14 24 22 44 24l38 8c12 3 20 10 20 22v6H28z" fill={c} />
    <path d="M28 142h144v12c0 4-3 6-6 6H34c-3 0-6-2-6-6z" fill={s} />
    <path d="M48 82l22 6c2 10 4 20 2 30" stroke={a} strokeWidth="6" fill="none" />
    {[0, 1, 2].map((i) => <path key={i} d={`M${80 + i * 10} ${96 + i * 3}l8 -10`} stroke={h} strokeWidth="3" strokeLinecap="round" />)}
    <path d="M118 120c10 2 26 4 40 10" stroke={a} strokeWidth="4" fill="none" strokeLinecap="round" />
  </>),
  backpack: ({ c, a, s }) => (<>
    <path d="M78 40c0-14 44-14 44 0" stroke={s} strokeWidth="8" fill="none" />
    <rect x="52" y="44" width="96" height="128" rx="30" fill={c} />
    <rect x="64" y="108" width="72" height="50" rx="14" fill={s} />
    <path d="M70 120h60" stroke={a} strokeWidth="4" strokeLinecap="round" />
    <rect x="94" y="70" width="12" height="20" rx="4" fill={a} />
  </>),
  kurta: ({ c, a, h }) => (<>
    <path d="M78 26l-34 20-14 56 20 4 10-30v102h80V76l10 30 20-4-14-56-34-20c-4 10-12 14-22 14s-18-4-22-14z" fill={c} />
    <path d="M100 40v30" stroke={h} strokeWidth="3" />
    {[[80, 100], [120, 100], [100, 124], [80, 148], [120, 148], [100, 172]].map(([x, y], i) => (
      <g key={i} fill={a}><circle cx={x} cy={y} r="5" /><circle cx={x} cy={y} r="9" fill="none" stroke={a} strokeWidth="1.5" /></g>
    ))}
  </>),
  jeans: ({ c, a, s }) => (<>
    <path d="M60 30h80l8 146h-36l-12-96-12 96H52z" fill={c} />
    <rect x="60" y="30" width="80" height="14" fill={s} />
    <path d="M70 44c4 14 16 18 26 18M130 44c-4 14-16 18-26 18" stroke={a} strokeWidth="2.5" fill="none" strokeDasharray="4 3" />
    <circle cx="100" cy="37" r="3.5" fill={a} />
  </>),
  sunglasses: ({ c, a, s }) => (<>
    <path d="M24 84h152" stroke={c} strokeWidth="8" strokeLinecap="round" />
    <rect x="30" y="80" width="62" height="48" rx="16" fill={c} /><rect x="108" y="80" width="62" height="48" rx="16" fill={c} />
    <rect x="37" y="86" width="48" height="36" rx="11" fill={s} /><rect x="115" y="86" width="48" height="36" rx="11" fill={s} />
    <path d="M44 96l16-6M122 96l16-6" stroke={a} strokeWidth="4" strokeLinecap="round" opacity=".7" />
  </>),
  analog: ({ c, a, s, ink }) => (<>
    <rect x="80" y="14" width="40" height="60" rx="8" fill={c} /><rect x="80" y="126" width="40" height="60" rx="8" fill={c} />
    <circle cx="100" cy="100" r="44" fill={s} /><circle cx="100" cy="100" r="37" fill={a} />
    {[0, 90, 180, 270].map((d) => <rect key={d} x="98.5" y="67" width="3" height="8" fill={ink} transform={`rotate(${d} 100 100)`} />)}
    <path d="M100 100V76M100 100l16 10" stroke={ink} strokeWidth="3.5" strokeLinecap="round" />
    <rect x="144" y="94" width="8" height="12" rx="2" fill={s} />
  </>),
  kettle: ({ c, s, ink, h }) => (<>
    <path d="M60 64h70l10 96H50z" fill={c} />
    <path d="M128 76c22 0 26 50 6 64" stroke={ink} strokeWidth="10" fill="none" strokeLinecap="round" />
    <path d="M60 80L34 64l4-8 26 10z" fill={c} />
    <rect x="70" y="52" width="50" height="14" rx="7" fill={ink} />
    <rect x="44" y="158" width="102" height="14" rx="5" fill={ink} />
    <path d="M70 80v66" stroke={h} strokeWidth="6" strokeLinecap="round" opacity=".55" />
    <rect x="84" y="112" width="20" height="8" rx="4" fill={s} />
  </>),
  mixer: ({ c, a, s, h }) => (<>
    <path d="M70 30h60l-6 70H76z" fill={h} opacity=".7" stroke={s} strokeWidth="3" />
    <rect x="66" y="22" width="68" height="12" rx="5" fill={a} />
    <path d="M56 100h88l8 70H48z" fill={c} />
    <circle cx="100" cy="136" r="12" fill={a} /><path d="M100 128v8" stroke={h} strokeWidth="3" strokeLinecap="round" />
    <rect x="52" y="164" width="96" height="10" rx="4" fill={s} />
  </>),
  cooker: ({ c, s, ink, h }) => (<>
    <rect x="44" y="80" width="108" height="84" rx="18" fill={c} />
    <path d="M40 80h116v-8c0-6-4-10-10-10H50c-6 0-10 4-10 10z" fill={s} />
    <rect x="150" y="68" width="40" height="12" rx="6" fill={ink} />
    <rect x="92" y="44" width="16" height="18" rx="5" fill={ink} />
    <path d="M58 98v50" stroke={h} strokeWidth="6" strokeLinecap="round" opacity=".55" />
  </>),
  bedsheet: ({ c, a, h }) => (<>
    <path d="M30 80l70-30 70 30-70 30z" fill={h} />
    <path d="M30 80v50l70 30v-50z" fill={c} /><path d="M170 80v50l-70 30v-50z" fill={c} opacity=".8" />
    <path d="M30 96l70 30 70-30" stroke={a} strokeWidth="3" fill="none" opacity=".8" />
    <rect x="70" y="56" width="38" height="20" rx="8" fill="#fff" transform="rotate(-22 89 66)" />
  </>),
  lamp: ({ c, a, s }) => (<>
    <path d="M64 30h72l18 56H46z" fill={a} />
    <rect x="96" y="86" width="8" height="18" fill={s} />
    <path d="M78 104c-12 20-8 52 22 52s34-32 22-52z" fill={c} />
    <rect x="70" y="156" width="60" height="10" rx="5" fill={s} />
  </>),
  pan: ({ c, a, h }) => (<>
    <ellipse cx="92" cy="108" rx="64" ry="20" fill={h} opacity=".6" />
    <path d="M28 108c0 36 28 56 64 56s64-20 64-56" fill={c} />
    <ellipse cx="92" cy="104" rx="56" ry="14" fill="#fff" opacity=".18" stroke={h} strokeWidth="2" />
    <rect x="80" y="74" width="24" height="10" rx="5" fill={a} />
    <rect x="152" y="104" width="38" height="12" rx="6" fill={a} transform="rotate(-8 152 110)" />
  </>),
  bottle: ({ c, s, h }) => (<>
    <rect x="80" y="20" width="40" height="26" rx="8" fill={s} />
    <path d="M76 52c0-6 4-8 8-8h32c4 0 8 2 8 8v118c0 6-4 10-10 10H86c-6 0-10-4-10-10z" fill={c} />
    <rect x="84" y="60" width="8" height="100" rx="4" fill={h} opacity=".45" />
  </>),
  tube: ({ c, a, h }) => (<>
    <path d="M70 32h60l-8 120H78z" fill={c} />
    <rect x="68" y="26" width="64" height="10" rx="2" fill={h} />
    <rect x="86" y="152" width="28" height="26" rx="6" fill={a} />
    <rect x="80" y="70" width="40" height="34" rx="6" fill="#fff" opacity=".75" />
    <path d="M88 82h24M88 92h16" stroke={a} strokeWidth="3" strokeLinecap="round" />
  </>),
  pump: ({ c, a, s }) => (<>
    <rect x="94" y="22" width="12" height="26" fill={s} /><rect x="94" y="22" width="40" height="10" rx="4" fill={s} />
    <rect x="80" y="44" width="40" height="14" rx="4" fill={s} />
    <rect x="62" y="56" width="76" height="120" rx="20" fill={c} />
    <rect x="74" y="92" width="52" height="50" rx="8" fill={a} opacity=".85" />
    <circle cx="100" cy="117" r="12" fill={c} />
  </>),
  trimmer: ({ c, a, s, h }) => (<>
    <rect x="76" y="30" width="48" height="24" rx="4" fill={s} />
    {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={80 + i * 7} y="22" width="4" height="12" fill={h} />)}
    <path d="M74 52h52l-6 120c0 4-4 8-8 8H88c-4 0-8-4-8-8z" fill={c} />
    <circle cx="100" cy="92" r="9" fill={a} />
    <rect x="94" y="120" width="12" height="30" rx="6" fill={a} opacity=".6" />
  </>),
  perfume: ({ c, a, h }) => (<>
    <rect x="88" y="24" width="24" height="30" rx="4" fill={a} />
    <rect x="94" y="52" width="12" height="12" fill={h} />
    <rect x="56" y="62" width="88" height="110" rx="18" fill={c} opacity=".88" />
    <rect x="66" y="74" width="68" height="86" rx="12" fill={h} opacity=".35" />
    <rect x="76" y="104" width="48" height="26" rx="4" fill="#fff" opacity=".85" />
    <path d="M86 117h28" stroke={a} strokeWidth="3" strokeLinecap="round" />
  </>),
  lipstick: ({ c, a, s }) => (<>
    <path d="M84 40l32-14v56H84z" fill={c} />
    <rect x="80" y="80" width="40" height="22" rx="3" fill={s} />
    <rect x="76" y="100" width="48" height="76" rx="6" fill={a} />
    <rect x="76" y="110" width="48" height="6" fill={s} opacity=".6" />
  </>),
  jar: ({ c, a, h }) => (<>
    <rect x="58" y="44" width="84" height="26" rx="8" fill={a} />
    <path d="M54 70h92v86c0 10-8 18-18 18H72c-10 0-18-8-18-18z" fill={c} />
    <rect x="66" y="96" width="68" height="44" rx="6" fill="#fff" opacity=".8" />
    <path d="M78 110h44M78 122h30" stroke={a} strokeWidth="4" strokeLinecap="round" />
    <rect x="62" y="78" width="10" height="70" rx="5" fill={h} opacity=".35" />
  </>),
  mat: ({ c, a, s }) => (<>
    <path d="M24 136l110-62 44 26-110 62z" fill={c} />
    <path d="M24 136l44 26v10l-44-26z" fill={s} />
    <circle cx="150" cy="70" r="24" fill={c} /><circle cx="150" cy="70" r="16" fill={s} /><circle cx="150" cy="70" r="8" fill={c} />
    <path d="M60 128l88-50" stroke={a} strokeWidth="2.5" strokeDasharray="6 5" opacity=".7" />
  </>),
  dumbbell: ({ c, s }) => (<>
    {[60, 130].map((y) => (
      <g key={y}>
        <rect x="70" y={y + 12} width="60" height="10" rx="5" fill={s} />
        <path d={`M34 ${y}l12-7h14l8 7v34l-8 7H46l-12-7z`} fill={c} />
        <path d={`M132 ${y}l8-7h14l12 7v34l-12 7h-14l-8-7z`} fill={c} />
      </g>
    ))}
  </>),
  bat: ({ c, a, s }) => (<>
    <g transform="rotate(-30 100 100)">
      <rect x="92" y="10" width="16" height="56" rx="6" fill={a} />
      {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M92 ${18 + i * 9}h16`} stroke={s} strokeWidth="2" />)}
      <path d="M80 64h40l4 116c0 6-4 10-10 10H86c-6 0-10-4-10-10z" fill={c} />
      <rect x="84" y="100" width="32" height="20" rx="3" fill={a} opacity=".7" />
    </g>
  </>),
  ball: ({ c, a, ink }) => (<>
    <circle cx="100" cy="100" r="64" fill={c} />
    <path d="M100 74l24 18-9 28H85l-9-28z" fill={ink} />
    <path d="M100 74V40M124 92l30-12M115 120l20 26M85 120l-20 26M76 92l-30-12" stroke={ink} strokeWidth="3" />
    <path d="M56 56c10-10 22-16 36-18" stroke={a} strokeWidth="6" fill="none" strokeLinecap="round" />
  </>),
  helmet: ({ c, s, a }) => (<>
    <path d="M34 128c0-48 30-80 70-80s62 30 62 72v8z" fill={c} />
    {[70, 96, 122].map((x) => <path key={x} d={`M${x} 64c4 14 6 28 6 44`} stroke={s} strokeWidth="8" fill="none" strokeLinecap="round" />)}
    <path d="M34 128h132l-8 14H50z" fill={s} />
    <rect x="152" y="112" width="14" height="10" rx="3" fill={a} />
    <path d="M60 142c10 22 50 22 70 0" stroke={s} strokeWidth="3" fill="none" />
  </>),
  racquet: ({ c, a, h }) => (<>
    <g transform="rotate(-25 100 100)">
      <ellipse cx="100" cy="66" rx="40" ry="50" fill="none" stroke={c} strokeWidth="9" />
      {[-24, -12, 0, 12, 24].map((x) => <path key={x} d={`M${100 + x} 22v88`} stroke={h} strokeWidth="1.5" />)}
      {[-30, -15, 0, 15, 30].map((y) => <path key={y} d={`M64 ${66 + y}h72`} stroke={h} strokeWidth="1.5" />)}
      <rect x="96" y="114" width="8" height="40" fill={c} />
      <rect x="92" y="150" width="16" height="40" rx="6" fill={a} />
    </g>
  </>),
  sack: ({ c, a, h }) => (<>
    <path d="M64 40c10 8 62 8 72 0l8 18c10 30 12 80 4 108-4 8-92 8-96 0-8-28-6-78 4-108z" fill={c} />
    <path d="M62 50c14 8 62 8 76 0" stroke={a} strokeWidth="5" fill="none" />
    <rect x="70" y="90" width="60" height="50" rx="8" fill={a} />
    <path d="M84 110c8-12 24-12 32 0M84 122h32" stroke={h} strokeWidth="3.5" fill="none" strokeLinecap="round" />
  </>),
  pouch: ({ c, a, h }) => (<>
    <path d="M60 36h80l4 128c0 6-4 10-10 10H66c-6 0-10-4-10-10z" fill={c} />
    <rect x="60" y="36" width="80" height="14" fill={a} opacity=".9" />
    <path d="M64 58h72" stroke={h} strokeWidth="2" strokeDasharray="4 3" opacity=".7" />
    <circle cx="100" cy="112" r="24" fill={a} />
    <path d="M90 112c4-10 16-10 20 0-4 10-16 10-20 0z" fill={c} />
  </>),
  oil: ({ c, a, s }) => (<>
    <rect x="88" y="18" width="24" height="16" rx="3" fill={a} />
    <path d="M88 34h24l6 22c14 8 20 20 20 34v76c0 6-4 10-10 10H72c-6 0-10-4-10-10V90c0-14 6-26 20-34z" fill={c} opacity=".9" />
    <rect x="70" y="100" width="60" height="46" rx="6" fill={a} />
    <path d="M100 110c8 10 8 18 0 24-8-6-8-14 0-24z" fill={c} />
    <rect x="72" y="66" width="8" height="30" rx="4" fill={s} opacity=".35" />
  </>),
};

export function Art({ kind, color, accent, view = 0, label, className }: {
  kind: ArtKind; color: string; accent: string; view?: number; label?: string; className?: string;
}) {
  const p: Pal = { c: color, a: accent, s: mix(color, "#000000", 0.28), h: mix(color, "#ffffff", 0.55), ink: "#1c2026" };
  const bg = [mix(color, "#ffffff", 0.86), mix(accent, "#ffffff", 0.82), mix(color, "#ffffff", 0.78), "#f3f0ea"][view % 4];
  const transform = ["", "rotate(-9 100 100) translate(4 4) scale(.94)", "translate(-60 -50) scale(1.6)", "translate(-8 18) scale(.72)"][view % 4];
  return (
    <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" className={className} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".5" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
      </defs>
      <rect width="200" height="200" fill={bg} />
      {view % 4 === 1 && <circle cx="150" cy="44" r="56" fill={mix(accent, "#ffffff", 0.6)} opacity=".5" />}
      <ellipse cx="100" cy="182" rx="62" ry="7" fill="#000" opacity=".07" />
      <g transform={transform}>{shapes[kind](p)}</g>
      {view % 4 === 3 && (
        <g>
          <path d="M128 112l40-14 22 10v50l-40 14-22-10z" fill="#d9c7a4" />
          <path d="M128 112l22 10v50l-22-10z" fill="#c4b08a" />
          <path d="M150 122l40-14" stroke="#b49d75" strokeWidth="2" />
          <path d="M139 117l40-14" stroke="#efe3c8" strokeWidth="4" />
        </g>
      )}
    </svg>
  );
}
