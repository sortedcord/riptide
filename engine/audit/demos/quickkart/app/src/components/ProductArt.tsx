/** Inline SVG pack shots for the seeded catalogue and the category row. */
import type { ReactNode } from "react";

const ART: Record<string, { bg: string; draw: ReactNode }> = {
  "atta-5": {
    bg: "#fbefd5",
    draw: (
      <>
        <path d="M30 26h40l6 58H24z" fill="#e9b25b" />
        <path d="M30 26h40l-2 8H32z" fill="#c98a2e" />
        <rect x="32" y="44" width="36" height="22" rx="4" fill="#fff8e8" />
        <path d="M50 48v15M50 52l-5-3M50 52l5-3M50 57l-5-3M50 57l5-3" stroke="#c98a2e" strokeWidth="2" strokeLinecap="round" />
        <text x="50" y="78" textAnchor="middle" fontSize="8" fontWeight="700" fill="#7a4d12">5 KG</text>
      </>
    ),
  },
  "olive-1": {
    bg: "#e8f1d9",
    draw: (
      <>
        <rect x="44" y="12" width="12" height="10" rx="2" fill="#2f4d1d" />
        <path d="M44 22h12v8l8 10v44a4 4 0 0 1-4 4H40a4 4 0 0 1-4-4V40l8-10z" fill="#7a9b2e" />
        <rect x="38" y="48" width="24" height="24" rx="3" fill="#f6f1dc" />
        <ellipse cx="50" cy="60" rx="5" ry="7" fill="#4f6b1b" />
        <path d="M50 53c3-3 7-3 9-2" stroke="#4f6b1b" strokeWidth="2" fill="none" strokeLinecap="round" />
      </>
    ),
  },
  "tea-500": {
    bg: "#f6e2dc",
    draw: (
      <>
        <path d="M28 30 50 22l22 8v50l-22 8-22-8z" fill="#b5392b" />
        <path d="M50 22v66l22-8V30z" fill="#8e2a1f" />
        <path d="M34 46c4-8 12-8 14 0-4 6-10 6-14 0z" fill="#5fae4f" />
        <rect x="32" y="56" width="14" height="3" rx="1.5" fill="#f4d58d" />
        <rect x="32" y="62" width="10" height="3" rx="1.5" fill="#f4d58d" />
      </>
    ),
  },
  dairy: {
    bg: "#e3eefb",
    draw: (
      <>
        <path d="M36 30h28v54H36z" fill="#fff" stroke="#9cb9de" strokeWidth="2" />
        <path d="M36 30l6-12h16l6 12z" fill="#d9e6f6" stroke="#9cb9de" strokeWidth="2" />
        <rect x="40" y="50" width="20" height="16" rx="3" fill="#3d7bd1" />
      </>
    ),
  },
  snacks: {
    bg: "#fdf0c9",
    draw: (
      <>
        <path d="M32 20h36l-4 8 4 8v40l-4 8 4 4H32l4-4-4-8V36l4-8z" fill="#f2a516" />
        <circle cx="50" cy="56" r="11" fill="#fff3c4" />
        <circle cx="46" cy="53" r="2" fill="#d9860b" /><circle cx="54" cy="58" r="2" fill="#d9860b" />
      </>
    ),
  },
  home: {
    bg: "#e2f4ef",
    draw: (
      <>
        <path d="M44 18h14v8h6v6H44z" fill="#1f8a70" />
        <path d="M40 32h24l2 8v42a4 4 0 0 1-4 4H42a4 4 0 0 1-4-4V40z" fill="#3cc3a0" />
        <rect x="42" y="50" width="20" height="18" rx="3" fill="#fff" />
        <circle cx="52" cy="59" r="4" fill="#3cc3a0" />
      </>
    ),
  },
};

const BASKET = {
  bg: "#eef2e6",
  draw: <path d="M22 44h56l-6 34H28zM34 44l10-18M66 44 56 26" stroke="#3b8b2a" strokeWidth="4" fill="none" strokeLinejoin="round" strokeLinecap="round" />,
};

export function ProductArt({ id, size = 120 }: { id: string; size?: number }) {
  const a = ART[id] ?? BASKET;
  return (
    <svg className="art" width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="" style={{ background: a.bg }}>
      <ellipse cx="50" cy="90" rx="26" ry="4" fill="rgba(0,0,0,.08)" />
      {a.draw}
    </svg>
  );
}
