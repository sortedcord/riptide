import { prng } from "@riptide/core";
import type { ReactNode } from "react";
import type { Art } from "@/data/restaurants";

/** Generated, deterministic food illustrations (no image files). Same seed → same picture. */

const BG = ["#f6e3c4", "#f3d9cf", "#e6ecd2", "#f1e1ea", "#dfe9e6", "#f5e6b8", "#efdcc8"];
const CURRY = ["#c8641e", "#a23a1d", "#6f8a2a", "#e0a63f", "#8a3f1c", "#d9822b", "#efd9a6"];
const GREENS = ["#4f8a32", "#6fa83d", "#2f6b2a", "#8cbf55"];
const DRINK = ["#e8b04a", "#f2d7a8", "#d65a6a", "#8fbf4a", "#7b4a2e", "#f0e2c8", "#e98a3a"];

type R = () => number;
const pick = <T,>(r: R, a: T[]) => a[Math.floor(r() * a.length)];
const range = (r: R, a: number, b: number) => a + r() * (b - a);

function Bowl({ r, fill, color }: { r: R; fill: ReactNode; color: string }) {
  return (
    <>
      <ellipse cx="60" cy="98" rx="40" ry="7" fill="#000" opacity=".08" />
      {fill}
      <path d="M20 60 Q24 98 60 100 Q96 98 100 60 Z" fill={color} />
      <path d="M20 60 Q24 98 60 100 Q96 98 100 60" fill="none" stroke="#000" strokeOpacity=".12" strokeWidth="1.5" />
      <path d="M28 70 Q32 86 46 92" stroke="#fff" strokeOpacity=".35" strokeWidth="3" fill="none" strokeLinecap="round" />
      {r() > 0.4 && <Steam />}
    </>
  );
}

function Steam() {
  return (
    <g stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity=".8">
      <path d="M46 34 q-5 -7 0 -13 q5 -6 0 -12" />
      <path d="M60 30 q-5 -7 0 -13 q5 -6 0 -12" />
      <path d="M74 34 q-5 -7 0 -13 q5 -6 0 -12" />
    </g>
  );
}

function Leaves({ r, n, cx, cy, spread }: { r: R; n: number; cx: number; cy: number; spread: number }) {
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <ellipse key={i} cx={cx + range(r, -spread, spread)} cy={cy + range(r, -spread / 3, spread / 3)} rx="4" ry="1.8"
          fill={pick(r, GREENS)} transform={`rotate(${Math.floor(range(r, 0, 180))} ${cx} ${cy})`} />
      ))}
    </>
  );
}

function Plate({ rx = 46, ry = 40 }: { rx?: number; ry?: number }) {
  return (
    <>
      <ellipse cx="60" cy="66" rx={rx} ry={ry} fill="#fffaf0" />
      <ellipse cx="60" cy="66" rx={rx - 7} ry={ry - 6} fill="none" stroke="#e7dccb" strokeWidth="1.5" />
    </>
  );
}

function shape(art: Art, r: R): ReactNode {
  switch (art) {
    case "bowl": {
      const c = pick(r, CURRY);
      return (
        <Bowl r={r} color={pick(r, ["#b65a33", "#c99a3c", "#f3ece0", "#7a4a33"])} fill={
          <>
            <ellipse cx="60" cy="60" rx="40" ry="11" fill={c} />
            <path d="M42 59 q10 -6 18 0 q8 6 16 0" stroke="#fff6e6" strokeWidth="2.5" fill="none" opacity=".85" strokeLinecap="round" />
            <Leaves r={r} n={5} cx={60} cy={58} spread={24} />
          </>
        } />
      );
    }
    case "rice": {
      const rice = pick(r, ["#f4e3b5", "#f0c25a", "#f6ead0"]);
      return (
        <Bowl r={r} color={pick(r, ["#7a4a33", "#b65a33", "#2f4f5a"])} fill={
          <>
            <path d="M22 60 Q60 14 98 60 Z" fill={rice} />
            {Array.from({ length: 26 }, (_, i) => (
              <ellipse key={i} cx={range(r, 34, 86)} cy={range(r, 38, 58)} rx="2.4" ry="1" fill={r() > 0.5 ? "#fffaf0" : "#e5a12e"}
                transform={`rotate(${Math.floor(range(r, 0, 180))} 60 50)`} opacity=".9" />
            ))}
            {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={range(r, 40, 80)} cy={range(r, 40, 56)} r="1.8" fill="#7a3d18" />)}
            <Leaves r={r} n={3} cx={60} cy={40} spread={14} />
          </>
        } />
      );
    }
    case "bread":
      return (
        <>
          <Plate />
          <path d="M26 72 Q24 46 58 42 Q92 40 94 62 Q96 86 62 90 Q30 92 26 72 Z" fill="#e6bb7c" />
          <path d="M34 66 Q38 52 60 50 Q84 50 86 64" fill="none" stroke="#fff" strokeOpacity=".4" strokeWidth="3" strokeLinecap="round" />
          {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={range(r, 34, 86)} cy={range(r, 50, 84)} r={range(r, 1.2, 3.2)} fill="#8a4b1d" opacity=".75" />)}
          {r() > 0.5 && <Leaves r={r} n={6} cx={60} cy={66} spread={22} />}
        </>
      );
    case "pizza": {
      const top = pick(r, ["#9e2a1f", "#3c6b2a", "#2b2b2b", "#d9822b"]);
      return (
        <>
          <circle cx="60" cy="64" r="48" fill="#c58b4f" />
          <circle cx="60" cy="64" r="40" fill="#e2a75a" />
          <circle cx="60" cy="64" r="34" fill="#c2412d" />
          {Array.from({ length: 9 }, (_, i) => <circle key={i} cx={range(r, 36, 84)} cy={range(r, 40, 88)} r={range(r, 5, 9)} fill="#f6d77a" />)}
          {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={range(r, 38, 82)} cy={range(r, 42, 86)} r="3.4" fill={top} />)}
          <g stroke="#a8692f" strokeWidth="1.2" opacity=".55">
            <line x1="60" y1="24" x2="60" y2="104" /><line x1="20" y1="64" x2="100" y2="64" />
            <line x1="32" y1="36" x2="88" y2="92" /><line x1="88" y1="36" x2="32" y2="92" />
          </g>
        </>
      );
    }
    case "burger":
      return (
        <>
          <ellipse cx="60" cy="100" rx="40" ry="6" fill="#000" opacity=".08" />
          <rect x="24" y="82" width="72" height="14" rx="7" fill="#d58e3f" />
          <rect x="22" y="70" width="76" height="14" rx="7" fill={pick(r, ["#5b3018", "#e6b25a", "#7a4a2b"])} />
          <path d="M22 72 L60 80 L98 72 L94 66 L26 66 Z" fill="#f2c443" />
          <path d="M20 64 q6 -6 12 0 q6 6 12 0 q6 -6 12 0 q6 6 12 0 q6 -6 12 0 q6 6 12 0 l2 4 H20 Z" fill="#6fa83d" />
          <path d="M24 62 Q24 30 60 30 Q96 30 96 62 Z" fill="#e09a45" />
          <path d="M36 46 Q44 36 58 35" stroke="#fff" strokeOpacity=".35" strokeWidth="3" fill="none" strokeLinecap="round" />
          {Array.from({ length: 9 }, (_, i) => <ellipse key={i} cx={range(r, 36, 84)} cy={range(r, 38, 54)} rx="2" ry="1.1" fill="#fff6e0" />)}
        </>
      );
    case "drink": {
      const c = pick(r, DRINK);
      return (
        <>
          <ellipse cx="60" cy="104" rx="26" ry="5" fill="#000" opacity=".08" />
          <path d="M36 30 L84 30 L78 102 L42 102 Z" fill="#ffffff" opacity=".55" />
          <path d="M38 46 L82 46 L78 102 L42 102 Z" fill={c} />
          <rect x="46" y="52" width="11" height="11" rx="2" fill="#fff" opacity=".45" transform="rotate(12 51 57)" />
          <rect x="60" y="60" width="11" height="11" rx="2" fill="#fff" opacity=".4" transform="rotate(-10 65 65)" />
          <path d="M36 30 L84 30 L78 102 L42 102 Z" fill="none" stroke="#000" strokeOpacity=".12" strokeWidth="1.5" />
          <line x1="70" y1="14" x2="62" y2="80" stroke={pick(r, ["#4a1f3d", "#3a7a35", "#d65a6a"])} strokeWidth="4" strokeLinecap="round" />
          {r() > 0.4 && <><circle cx="84" cy="32" r="10" fill="#f2d24a" /><circle cx="84" cy="32" r="7" fill="#f8e58a" /></>}
        </>
      );
    }
    case "dessert":
      if (r() > 0.5)
        return (
          <>
            <Plate />
            {[[44, 60], [70, 56], [56, 78], [78, 78]].map(([x, y], i) => (
              <g key={i}>
                <circle cx={x} cy={y} r="12" fill={pick(r, ["#7a3518", "#f2e2b6", "#e8a33a", "#f7f0e2", "#d9a3b0"])} />
                <circle cx={x - 4} cy={y - 4} r="3" fill="#fff" opacity=".45" />
              </g>
            ))}
            {Array.from({ length: 8 }, (_, i) => <rect key={i} x={range(r, 36, 84)} y={range(r, 48, 88)} width="3" height="1.6" fill="#7fae4a" />)}
          </>
        );
      return (
        <Bowl r={() => 1} color={pick(r, ["#d9a3b0", "#f3ece0", "#c99a3c"])} fill={
          <>
            <circle cx="48" cy="52" r="15" fill={pick(r, ["#f7e6c4", "#e9c7d2", "#cfe2b8"])} />
            <circle cx="72" cy="52" r="15" fill={pick(r, ["#7a4a2e", "#f2c25a", "#f7f0e2"])} />
            <circle cx="60" cy="40" r="13" fill={pick(r, ["#e8a33a", "#f7e6c4", "#d65a6a"])} />
            <circle cx="60" cy="26" r="4" fill="#b8202a" />
          </>
        } />
      );
    case "dosa":
      return (
        <>
          <Plate rx={50} ry={38} />
          <path d="M16 74 L98 46 Q106 50 102 58 L22 86 Q12 84 16 74 Z" fill="#e3a54a" />
          <g stroke="#a86426" strokeWidth="1.5" opacity=".55">
            {[30, 46, 62, 78].map((x) => <line key={x} x1={x} y1={82 - (x - 16) * 0.34} x2={x + 4} y2={70 - (x - 16) * 0.34} />)}
          </g>
          <circle cx="34" cy="50" r="10" fill="#f7f3ea" stroke="#e0d5c2" />
          <circle cx="86" cy="84" r="10" fill="#d4572e" stroke="#e0d5c2" />
          <circle cx="58" cy="94" r="8" fill="#e9a23b" stroke="#e0d5c2" />
        </>
      );
    case "momo":
      return (
        <>
          <Plate />
          {[[40, 62], [62, 56], [82, 66], [50, 82], [74, 84]].slice(0, 4 + Math.floor(r() * 2)).map(([x, y], i) => (
            <g key={i}>
              <path d={`M${x - 13} ${y + 6} Q${x - 12} ${y - 14} ${x} ${y - 14} Q${x + 12} ${y - 14} ${x + 13} ${y + 6} Z`} fill={r() > 0.7 ? "#e6b46a" : "#f7efe0"} stroke="#e1cfb3" />
              <path d={`M${x - 5} ${y - 10} q5 4 10 0`} stroke="#d9c4a2" fill="none" />
            </g>
          ))}
          <circle cx="88" cy="40" r="9" fill="#c8321f" stroke="#e0d5c2" />
        </>
      );
    case "salad":
      return (
        <Bowl r={() => 0} color={pick(r, ["#f3ece0", "#c9e1d6", "#2f4f5a"])} fill={
          <>
            <ellipse cx="60" cy="58" rx="40" ry="13" fill="#5f9a3a" />
            {Array.from({ length: 16 }, (_, i) => (
              <ellipse key={i} cx={range(r, 28, 92)} cy={range(r, 46, 62)} rx="8" ry="4" fill={pick(r, GREENS)} transform={`rotate(${Math.floor(range(r, -40, 40))} 60 55)`} />
            ))}
            {Array.from({ length: 4 }, (_, i) => <circle key={i} cx={range(r, 34, 86)} cy={range(r, 46, 60)} r="4" fill="#d8392b" />)}
            {Array.from({ length: 4 }, (_, i) => <rect key={i} x={range(r, 34, 84)} y={range(r, 46, 58)} width="6" height="6" rx="1" fill="#fbf6ea" />)}
          </>
        } />
      );
    case "snack":
      if (r() > 0.5)
        return (
          <>
            <Plate />
            {Array.from({ length: 14 }, (_, i) => (
              <rect key={i} x={range(r, 36, 80)} y={range(r, 46, 80)} width="5" height="26" rx="2" fill={pick(r, ["#efc04a", "#e8b03a", "#f4cf62"])}
                transform={`rotate(${Math.floor(range(r, -50, 50))} 60 66)`} />
            ))}
            <circle cx="88" cy="44" r="8" fill="#c8321f" stroke="#e0d5c2" />
          </>
        );
      return (
        <>
          <Plate />
          {[[42, 56], [64, 52], [84, 62], [48, 78], [70, 76], [58, 64]].map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="11" fill={pick(r, ["#e2a54e", "#d18c3a", "#c97b2c"])} />
              <circle cx={x} cy={y} r="5" fill={pick(r, ["#f7f3ea", "#6b8e3a", "#8a4a20"])} opacity=".85" />
            </g>
          ))}
          <Leaves r={r} n={6} cx={62} cy={64} spread={24} />
        </>
      );
    case "fish":
      return (
        <>
          <Plate rx={50} ry={38} />
          <path d="M22 68 Q46 42 78 56 L98 44 L94 68 L98 90 L78 78 Q46 94 22 68 Z" fill="#c9792e" />
          {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={range(r, 32, 76)} cy={range(r, 58, 80)} r="1.4" fill="#f4d58a" />)}
          <path d="M30 96 A14 14 0 0 1 58 96 Z" fill="#f2d24a" transform="rotate(-12 44 96)" />
          <circle cx="86" cy="94" r="7" fill="none" stroke="#9a4a8a" strokeWidth="2.5" />
          <path d="M28 44 q8 -8 20 -4" stroke="#3a7a35" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      );
  }
}

export function FoodArt({ art, seed, className, label, bare }: { art: Art; seed: string; className?: string; label?: string; bare?: boolean }) {
  const r = prng(`art:${seed}`);
  const bg = pick(r, BG);
  return (
    <svg viewBox="0 0 120 120" className={className} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      {!bare && <rect width="120" height="120" fill={bg} />}
      {shape(art, r)}
    </svg>
  );
}

/** Wide restaurant cover: tinted pattern + the restaurant's signature dish. */
export function CoverArt({ art, seed, hue, className }: { art: Art; seed: string; hue: number; className?: string }) {
  return (
    <div className={`ff-cover ${className ?? ""}`} style={{ "--ff-hue": hue } as React.CSSProperties}>
      <FoodArt art={art} seed={seed} bare className="ff-cover__art" />
    </div>
  );
}
