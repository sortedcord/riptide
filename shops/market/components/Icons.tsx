/** Cartwheel's own icon set: 1.7px rounded strokes. Generated for Riptide. */
import type { SVGProps } from "react";

const P: Record<string, string> = {
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4",
  cart: "M3 4h2.2l2.3 11.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L21 8H6.1M9.5 20.5h.01M17.5 20.5h.01",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 20c1.4-3.4 4.2-5 7.5-5s6.1 1.6 7.5 5",
  pin: "M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  truck: "M2.5 6.5h11v9h-11zM13.5 9.5h4l3 3v3h-7M6 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM17 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",
  shield: "M12 3l7.5 3v5.5c0 4.5-3.2 8-7.5 9.5-4.3-1.5-7.5-5-7.5-9.5V6zM8.8 12l2.2 2.2 4.4-4.4",
  gift: "M3.5 9h17v3.5h-17zM5 12.5h14V20H5zM12 9v11M12 9c-2-3.5-6-3.5-6-1s4 1 6 1zm0 0c2-3.5 6-3.5 6-1s-4 1-6 1z",
  tag: "M3.5 12.2V4.5a1 1 0 0 1 1-1h7.7l8.3 8.3a1 1 0 0 1 0 1.4l-7.2 7.2a1 1 0 0 1-1.4 0zM8 8h.01",
  return: "M9 14l-5-5 5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11",
  star: "M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z",
  check: "M5 12.5l4.5 4.5L19 7.5",
  chevronL: "M15 5l-7 7 7 7",
  chevronR: "M9 5l7 7-7 7",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  trash: "M4.5 7h15M10 11v6M14 11v6M6 7l1 12.5a1.5 1.5 0 0 0 1.5 1.5h7a1.5 1.5 0 0 0 1.5-1.5L18 7M9 7V4.5h6V7",
  heart: "M12 20s-7.5-4.6-7.5-10A4.5 4.5 0 0 1 12 7.4 4.5 4.5 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z",
  store: "M3.5 9.5L5 4h14l1.5 5.5M3.5 9.5h17M3.5 9.5a2.8 2.8 0 0 0 5.6 0 2.9 2.9 0 0 0 5.8 0 2.8 2.8 0 0 0 5.6 0M5 12v8h14v-8M10 20v-5h4v5",
  lock: "M6 10.5h12v9.5H6zM8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3",
  box: "M12 3l8 4.5v9L12 21l-8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9",
  spark: "M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8",
  help: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01",
  close: "M6 6l12 12M18 6L6 18",
};

export type IconName = keyof typeof P;

export function Icon({ name, size = 20, ...rest }: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...rest}>
      <path d={P[name]} />
    </svg>
  );
}

/** Cartwheel mark: a wheel whose spokes form a soft asterisk. */
export function Logo({ light = false, className }: { light?: boolean; className?: string }) {
  const fg = light ? "#f6f1e4" : "#0b3328";
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <svg aria-hidden width="30" height="30" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="13.5" fill="none" stroke="#eaa53c" strokeWidth="3" />
        {[0, 45, 90, 135].map((r) => <rect key={r} x="15" y="6" width="2" height="20" rx="1" fill={fg} transform={`rotate(${r} 16 16)`} />)}
        <circle cx="16" cy="16" r="3.4" fill="#eaa53c" />
      </svg>
      <span style={{ fontFamily: "var(--rt-font-heading)", fontWeight: 600, fontSize: 24, letterSpacing: "-0.02em", color: fg, fontVariationSettings: '"SOFT" 100, "opsz" 72' }}>
        cartwheel
      </span>
    </span>
  );
}
