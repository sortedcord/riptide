/** Illustrated pack shots drawn in SVG (the catalogue has no photography yet). */
type Art = { kind: "sack" | "bottle" | "box" | "jar" | "pouch"; tint: string; pack: string; band: string };

const ART: Record<string, Art> = {
  "atta-5": { kind: "sack", tint: "#f3eadb", pack: "#e9d3a8", band: "#b5651d" },
  "olive-1": { kind: "bottle", tint: "#eef1de", pack: "#7f8f2e", band: "#f2e6b8" },
  "tea-500": { kind: "box", tint: "#f6e6df", pack: "#8c2f1f", band: "#e7b75a" },
  "dal-1": { kind: "pouch", tint: "#fbf0d4", pack: "#e9b949", band: "#2f6d3f" },
  "rice-5": { kind: "sack", tint: "#eef0f3", pack: "#f7f4ec", band: "#3a5a9b" },
  "ghee-500": { kind: "jar", tint: "#fbf3dc", pack: "#f0c95a", band: "#1f5c3d" },
  "coffee-500": { kind: "pouch", tint: "#efe6de", pack: "#4a2c20", band: "#d9a35c" },
};
const FALLBACK: Art = { kind: "box", tint: "#efeee8", pack: "#9aa39b", band: "#ffffff" };

function Pack({ a }: { a: Art }) {
  switch (a.kind) {
    case "sack":
      return <><path d="M34 30q26-8 52 0l6 62q-32 8-64 0z" fill={a.pack} /><path d="M34 30q26-8 52 0" stroke="#0002" strokeWidth="3" fill="none" />
        <rect x="38" y="52" width="44" height="22" rx="4" fill={a.band} /><rect x="46" y="60" width="28" height="6" rx="3" fill="#fff8" /></>;
    case "bottle":
      return <><rect x="53" y="14" width="14" height="10" rx="2" fill="#2e3a12" /><path d="M54 24h12v10l8 10v52a6 6 0 0 1-6 6H52a6 6 0 0 1-6-6V44l8-10z" fill={a.pack} />
        <rect x="46" y="56" width="28" height="24" fill={a.band} /><rect x="51" y="63" width="18" height="4" rx="2" fill="#7f8f2e" /></>;
    case "box":
      return <><path d="M36 30h48v66H36z" fill={a.pack} /><path d="M36 30l8-8h48l-8 8z" fill="#0003" /><path d="M84 30l8-8v66l-8 8z" fill="#0002" />
        <rect x="42" y="48" width="36" height="26" rx="13" fill={a.band} /><rect x="50" y="58" width="20" height="6" rx="3" fill="#fff9" /></>;
    case "jar":
      return <><rect x="42" y="26" width="36" height="12" rx="3" fill={a.band} /><rect x="38" y="38" width="44" height="56" rx="10" fill={a.pack} />
        <rect x="38" y="54" width="44" height="22" fill="#fffaf0" /><rect x="48" y="62" width="24" height="6" rx="3" fill={a.band} /></>;
    default:
      return <><path d="M38 26h44l-2 10 4 56a4 4 0 0 1-4 4H40a4 4 0 0 1-4-4l4-56z" fill={a.pack} /><path d="M38 26h44" stroke="#0003" strokeWidth="4" />
        <circle cx="60" cy="62" r="15" fill={a.band} /><circle cx="60" cy="62" r="7" fill="#fff6" /></>;
  }
}

export function ProductImage({ id, label }: { id: string; label: string }) {
  const a = ART[id] ?? FALLBACK;
  return (
    <div className="pimg" style={{ background: a.tint }}>
      <svg viewBox="0 0 120 120" role="img" aria-label={label}>
        <ellipse cx="60" cy="100" rx="32" ry="5" fill="#0000000f" />
        <Pack a={a} />
      </svg>
    </div>
  );
}
