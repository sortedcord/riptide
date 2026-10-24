export type PlanId = "mobile" | "basic" | "standard" | "premium";

export type Plan = {
  id: PlanId; name: string; /** Monthly price before GST, in rupees. */ price: number;
  quality: string; resolution: string; screens: number; downloads: number;
  devices: string; audio: string;
};

/** Monthly prices exclude 18% GST; the GST line is added by shop.config.ts buildLines. */
export const PLANS: Plan[] = [
  { id: "mobile", name: "Mobile", price: 150, quality: "Good", resolution: "480p", screens: 1, downloads: 1, devices: "Phone and tablet", audio: "Stereo" },
  { id: "basic", name: "Basic", price: 200, quality: "Better", resolution: "720p (HD)", screens: 1, downloads: 1, devices: "Phone, tablet, computer and TV", audio: "Stereo" },
  { id: "standard", name: "Standard", price: 450, quality: "Great", resolution: "1080p (Full HD)", screens: 2, downloads: 2, devices: "Phone, tablet, computer and TV", audio: "Stereo and 5.1 surround" },
  { id: "premium", name: "Premium", price: 600, quality: "Best", resolution: "4K (Ultra HD) + HDR", screens: 4, downloads: 6, devices: "Phone, tablet, computer and TV", audio: "Spatial audio" },
];
export const planById = (id: string | undefined) => PLANS.find((p) => p.id === id);

export const GST_RATE = 0.18;
/** Optional add-on: one extra member slot (own profile + login, shares the plan's screens). */
export const EXTRA_MEMBER = { key: "extra-member", base: 100, gst: 18 };

/**
 * Fixed sandbox reference date ("today"). All dates on the site are computed from it, never from
 * Date.now(), so every visit renders the same page.
 */
export const REF_DATE = { y: 2026, m: 10, d: 24 }; // 24 Oct 2026

const fmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
/** Date `months` after REF_DATE with day `day` (defaults to the reference day), formatted "12 Nov 2026". */
export function refDate(months = 0, day = REF_DATE.d): string {
  return fmt.format(new Date(Date.UTC(REF_DATE.y, REF_DATE.m - 1 + months, day)));
}

/** Demo account: active Standard membership since 12 Mar 2025, billed on the 12th. */
export const DEMO = {
  name: "Demo Viewer",
  email: "demo.viewer@reelbox.example",
  memberSince: "12 Mar 2025",
  billingDay: 12,
  method: "UPI · demo@okreel",
  /** Next charge: 12 Nov 2026. Current period ends the day before. */
  nextBilling: () => refDate(1, 12),
  accessEnds: () => refDate(1, 11),
  /** Past invoices: the 12th of each of the last 4 months. */
  history: () => [0, -1, -2, -3].map((m) => refDate(m, 12)),
};
