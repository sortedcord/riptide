"use client";
import Link from "next/link";
import { SANDBOX_NOTICE, Slot, useRiptide } from "@riptide/core";
import { brand } from "@/brand";
import profile from "@/data/profile.json";

/** Mark: a horizon line with a climbing arc. Drawn for Skyline Air. */
export function Logo({ light = false }: { light?: boolean }) {
  const c = light ? "#fff" : "var(--rt-primary)";
  return (
    <span className="sk-logo" aria-label={brand.name}>
      <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden>
        <rect width="34" height="34" rx="9" fill={c} />
        <path d="M6 23h22" stroke={light ? "var(--rt-primary)" : "#fff"} strokeWidth="2.2" strokeLinecap="round" />
        <path d="M8 20c5-1 10-5 14-11" stroke="var(--rt-accent)" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        <circle cx="23.5" cy="8" r="2.2" fill="var(--rt-accent)" />
      </svg>
      <span className="sk-logo__word" style={{ color: c }}>skyline<b>air</b></span>
    </span>
  );
}

export function Icon({ d, size = 18 }: { d: string; size?: number }) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}
export const ICONS = {
  plane: "M2 14l8-2 4-8h2l-1 8 6 1 1-3h1v6h-1l-1-3-6 1 1 8h-2l-4-8-8-2z",
  user: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c1-4 4-6 8-6s7 2 8 6",
  bag: "M7 8V6a5 5 0 0110 0v2M4 8h16l-1 13H5z",
  help: "M12 21a9 9 0 100-18 9 9 0 000 18zM9.5 9a2.5 2.5 0 115 0c0 2-2.5 2-2.5 4M12 17h.01",
  swap: "M7 7h13l-4-4M17 17H4l4 4",
  check: "M5 12l5 5 9-10",
  seat: "M7 4v9h10M7 13l-1 6M17 13l1 6M6 19h12",
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
  meal: "M4 11h16a8 8 0 01-16 0zM12 4v3M3 20h18",
  ticket: "M3 7h18v3a2 2 0 000 4v3H3v-3a2 2 0 000-4z",
};

export function Header() {
  const { base } = useRiptide();
  return (
    <header className="sk-header">
      <div className="sk-header__in">
        <Link href={base} className="sk-header__logo"><Logo /></Link>
        <nav aria-label="Main" className="sk-nav">
          <Link href={base}><Icon d={ICONS.plane} /> Book flights</Link>
          <Link href={`${base}/policies/fare-rules`}><Icon d={ICONS.ticket} /> Fare families</Link>
          <Link href={`${base}/policies/baggage`}><Icon d={ICONS.bag} /> Baggage</Link>
          <Link href={`${base}/policies/cancellation`}><Icon d={ICONS.help} /> Help</Link>
        </nav>
        <Link href={`${base}/account`} className="sk-account" aria-label={`My account (${profile.name})`}>
          <span className="sk-avatar" aria-hidden>{profile.name.split(" ").map((p) => p[0]).join("")}</span>
          <span className="sk-account__name">{profile.name.split(" ")[0]}</span>
        </Link>
      </div>
    </header>
  );
}

export function Footer() {
  const { base } = useRiptide();
  return (
    <footer className="sk-footer">
      <div className="sk-footer__in">
        <div className="sk-footer__brand">
          <Logo light />
          <p>{brand.tagline} A fictional domestic carrier flying A320-family aircraft between 13 Indian cities.</p>
        </div>
        <div>
          <h2>About</h2>
          <Link href={base}>Book flights</Link>
          <Link href={`${base}/account`}>My account</Link>
          <span>Fleet: A320 &amp; A320neo</span>
        </div>
        <div>
          <h2>Help</h2>
          <span>Customer care 1800 000 0000 (sandbox)</span>
          <span>Web check-in opens 48 h before departure</span>
        </div>
        <div>
          <h2>Policies</h2>
          <Slot id="footer.links.list" as="nav" aria-label="Policies" className="sk-footer__list">
            <Slot id="footer.links.baggage" as={Link} href={`${base}/policies/baggage`}>Baggage</Slot>
            <Slot id="footer.links.fare-rules" as={Link} href={`${base}/policies/fare-rules`}>Fare rules</Slot>
            <Slot id="footer.links.cancellation" as={Link} href={`${base}/policies/cancellation`}>Cancellation &amp; refunds</Slot>
            <Slot id="footer.links.terms" as={Link} href={`${base}/policies/terms`}>Terms of carriage</Slot>
            <Slot id="footer.links.privacy" as={Link} href={`${base}/policies/privacy`}>Privacy</Slot>
          </Slot>
        </div>
        <div>
          <h2>Social</h2>
          <span>@skylineair.example</span>
          <span>Skyline Air on video (fictional)</span>
        </div>
      </div>
      <p className="sk-footer__notice">{SANDBOX_NOTICE} © 2026 Skyline Air (fictional).</p>
    </footer>
  );
}
