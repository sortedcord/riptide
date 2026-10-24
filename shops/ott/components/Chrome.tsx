"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SANDBOX_NOTICE, Slot, useRiptide } from "@riptide/core";
import { Icon, Logo } from "./ui";

export function Header() {
  const { base } = useRiptide();
  const path = usePathname();
  const nav = [
    { href: base, label: "Home" },
    { href: `${base}/browse`, label: "Browse" },
    { href: `${base}/search`, label: "Search" },
    { href: `${base}/plans`, label: "Plans" },
  ];
  return (
    <header className="rb-header">
      <div className="rb-wrap rb-header__row">
        <Link href={base} className="rb-header__logo" aria-label="Reelbox home"><Logo /></Link>
        <nav aria-label="Main" className="rb-nav">
          {nav.map((n) => (
            <Link key={n.label} href={n.href} aria-current={path === n.href ? "page" : undefined}>{n.label}</Link>
          ))}
        </nav>
        <form action={`${base}/search`} method="get" role="search" className="rb-header__search">
          <label htmlFor="rb-q" className="sr-only">Search titles</label>
          <Icon name="search" size={18} />
          <input id="rb-q" name="q" type="search" placeholder="Titles, genres, cast" autoComplete="off" />
        </form>
        <Link href={`${base}/account`} className="rb-header__account" aria-label="Account (Demo Viewer)">
          <span className="rb-avatar" aria-hidden>DV</span><span className="rb-header__account-label">Account</span>
        </Link>
      </div>
    </header>
  );
}

export function Footer() {
  const { base } = useRiptide();
  return (
    <footer className="rb-footer">
      <div className="rb-wrap rb-footer__grid">
        <div className="rb-footer__brand">
          <Logo size={24} />
          <p className="rb-muted">Original films and series, made and streamed in India. Plans from Mobile to Premium, billed monthly.</p>
        </div>
        <nav aria-label="About">
          <h2>About</h2>
          <Link href={base}>About Reelbox</Link>
          <Link href={`${base}/plans`}>Plans and pricing</Link>
          <Link href={`${base}/browse`}>Browse the catalogue</Link>
        </nav>
        <nav aria-label="Help">
          <h2>Help</h2>
          <Link href={`${base}/account`}>Your account</Link>
          <Link href={`${base}/account/cancel`}>Cancel membership</Link>
          <Link href={`${base}#faq`}>Questions</Link>
        </nav>
        <nav aria-label="Policies">
          <h2>Policies</h2>
          <Slot id="footer.links.list" className="rb-footer__links">
            <Slot id="footer.links.help" as={Link} href={`${base}/policies/help`}>Help centre</Slot>
            <Slot id="footer.links.terms" as={Link} href={`${base}/policies/terms`}>Terms of use</Slot>
            <Slot id="footer.links.cancellation" as={Link} href={`${base}/policies/cancellation`}>Cancellation &amp; refunds</Slot>
            <Slot id="footer.links.privacy" as={Link} href={`${base}/policies/privacy`}>Privacy</Slot>
          </Slot>
        </nav>
        <div>
          <h2>Social</h2>
          <ul className="rb-footer__social">
            <li>Reelbox Journal (blog)</li>
            <li>@reelbox.watch</li>
            <li>Reelbox Community forum</li>
          </ul>
        </div>
      </div>
      <div className="rb-wrap rb-footer__base">
        <span>© 2026 Reelbox Media Pvt. Ltd. (fictional) · Bengaluru 560 038</span>
        <span className="rb-sandbox">{SANDBOX_NOTICE}</span>
      </div>
    </footer>
  );
}
