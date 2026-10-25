/** Small inline line icons (24px grid, currentColor). */
const PATHS = {
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm9 16-4.3-4.3",
  cart: "M3 4h2l2.4 11h10.2L20 8H6.2M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 8a7 7 0 0 1 14 0",
  pin: "M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  truck: "M3 6h11v9H3zM14 9h4l3 3v3h-7M7 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm10 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",
  shield: "M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6l-7-3zm-3 9 2 2 4-4",
  rupee: "M7 5h10M7 9h10M7 5h3a4 4 0 0 1 0 8H7l7 6",
  return: "M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3",
  star: "m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3z",
  store: "M4 9l1.5-5h13L20 9M4 9v11h16V9M4 9h16M9 20v-6h6v6",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-13v4l3 2",
  check: "m5 12 5 5L20 7",
  info: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-10v6m0-9.5v.5",
  card: "M3 6h18v12H3zM3 10h18",
  bank: "M3 10h18L12 4 3 10zm2 0v8m4.5-8v8m5-8v8M19 10v8M3 20h18",
  cash: "M3 7h18v10H3zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  phone: "M7 3h10v18H7zM11 18h2",
  mail: "M3 6h18v12H3zm0 0 9 7 9-7",
  close: "M6 6l12 12M18 6 6 18",
};

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  );
}

/** The FairBasket mark: a basket with a leaf. */
export function Logo() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#1f5c3d" />
      <path d="M7 14h18l-2.2 9.2a2 2 0 0 1-2 1.6h-9.6a2 2 0 0 1-2-1.6L7 14z" fill="#f4efe3" />
      <path d="M11 14l3-6m7 6-3-6" stroke="#f4efe3" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16 17.5v4.5m-3.5-4.5.6 4.5m6.4-4.5-.6 4.5" stroke="#1f5c3d" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
