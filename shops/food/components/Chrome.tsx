"use client";
import Link from "next/link";
import Form from "next/form";
import { SANDBOX_NOTICE, Slot, useHydrated, useRiptide, useSession } from "@riptide/core";
import { brand } from "@/brand";
import type { FoodState } from "@/shop.config";
import { Icon } from "./ui";

export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
      <circle cx="20" cy="20" r="19" fill="var(--ff-turmeric)" />
      <circle cx="20" cy="20" r="14" fill="none" stroke="#fff6e6" strokeWidth="1.5" opacity=".7" />
      <path d="M14 9v8a6 6 0 0 0 4.5 5.8V31a1.5 1.5 0 0 0 3 0v-8.2A6 6 0 0 0 26 17V9" fill="none" stroke="var(--rt-primary)" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M18 9v7M22 9v7" stroke="var(--rt-primary)" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function Header() {
  const { base } = useRiptide();
  const [s] = useSession<FoodState>();
  const hydrated = useHydrated();
  const count = hydrated ? s.cart.reduce((t, l) => t + l.qty, 0) : 0;
  const where = !hydrated ? null : s.address ? `${s.address.label} · ${s.address.line2}` : s.city;
  return (
    <header className="ff-header">
      <div className="ff-header__inner">
        <Link href={base} className="ff-logo" aria-label={`${brand.name} home`}>
          <LogoMark />
          <span className="ff-logo__word">forkful</span>
        </Link>
        <Slot id="header.location.button" as={Link} href={`${base}/location`} className="ff-loc" aria-label="Change delivery location">
          <Icon name="pin" size={18} />
          <span className="ff-loc__text">{where ? <>Deliver to <strong>{where}</strong></> : "Set delivery location"}</span>
        </Slot>
        <Form action={base} role="search" className="ff-search">
          <label htmlFor="ff-q" className="sr-only">Search restaurants and dishes</label>
          <Icon name="search" size={18} />
          <input id="ff-q" name="q" type="search" placeholder="Search restaurants, cuisines or dishes" />
          <button type="submit" className="ff-search__btn">Search</button>
        </Form>
        <nav aria-label="Main" className="ff-nav">
          <Link href={`${base}?offers=1`} className="ff-nav__link"><Icon name="tag" size={18} /><span>Offers</span></Link>
          <Link href={`${base}/policies/help`} className="ff-nav__link"><Icon name="clock" size={18} /><span>Help</span></Link>
          <Link href={`${base}/account`} className="ff-nav__link" aria-label="Account"><Icon name="user" size={18} /><span>Account</span></Link>
          <Slot id="header.cart.link" as={Link} href={`${base}/cart`} className="ff-nav__link ff-nav__cart" aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}>
            <Icon name="bag" size={18} /><span>Cart</span>{count > 0 && <span className="ff-badge-count">{count}</span>}
          </Slot>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  const { base } = useRiptide();
  const p = (slug: string) => `${base}/policies/${slug}`;
  return (
    <footer className="ff-footer">
      <div className="ff-footer__inner">
        <div className="ff-footer__brand">
          <Link href={base} className="ff-logo" aria-label={`${brand.name} home`}><LogoMark size={30} /><span className="ff-logo__word">forkful</span></Link>
          <p>{brand.tagline} Ordering from 12 partner kitchens across 10 cities.</p>
        </div>
        <div>
          <h2>About</h2>
          <ul>
            <li><Link href={p("about")}>About Forkful</Link></li>
            <li><Link href={`${base}/account`}>Forkful Pass</Link></li>
            <li><Link href={`${base}/location`}>Cities we deliver to</Link></li>
          </ul>
        </div>
        <div>
          <h2>Help &amp; policies</h2>
          <Slot id="footer.links.list" className="ff-footer__links">
            <Slot id="footer.links.help" as={Link} href={p("help")}>Help &amp; FAQs</Slot>
            <Slot id="footer.links.delivery" as={Link} href={p("delivery")}>Delivery policy</Slot>
            <Slot id="footer.links.refund" as={Link} href={p("refund")}>Refunds &amp; cancellation</Slot>
            <Slot id="footer.links.terms" as={Link} href={p("terms")}>Terms of use</Slot>
            <Slot id="footer.links.privacy" as={Link} href={p("privacy")}>Privacy policy</Slot>
          </Slot>
        </div>
        <div>
          <h2>Social</h2>
          <ul>
            <li><span>@forkful.eats</span></li>
            <li><span>Forkful Kitchen Diaries (blog)</span></li>
            <li><span>Partner with us: partners@forkful.example</span></li>
          </ul>
        </div>
      </div>
      <p className="ff-footer__notice">© 2026 Forkful Foods (fictional). {SANDBOX_NOTICE}</p>
    </footer>
  );
}
