"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Slot, SANDBOX_NOTICE, useHydrated, useRiptide } from "@riptide/core";
import { categories } from "@/data/catalog";
import { DEMO_ADDRESS, DEMO_USER } from "@/data/content";
import { useCart } from "./hooks";
import { Icon, Logo } from "./Icons";

function SearchBox() {
  const { base } = useRiptide();
  const q = useSearchParams().get("q") ?? "";
  const path = usePathname();
  return (
    <form role="search" action={`${base}/search`} className="cw-search" key={path + q}>
      <label htmlFor="cw-q" className="sr-only">Search Cartwheel</label>
      <input id="cw-q" name="q" type="search" defaultValue={q} placeholder="Search for products, brands and more" autoComplete="off" />
      <button type="submit"><Icon name="search" size={18} /><span className="hidden sm:inline">Search</span></button>
    </form>
  );
}

export function Header() {
  const { base } = useRiptide();
  const { count, state } = useCart();
  const hydrated = useHydrated();
  const pin = state.pin ?? DEMO_ADDRESS.pin;
  return (
    <header>
      <div className="cw-header">
        <div className="cw-wrap flex flex-wrap items-center gap-x-5 gap-y-3 py-3">
          <Link href={base} aria-label="Cartwheel home" className="shrink-0 no-underline"><Logo light /></Link>
          <div className="hidden min-w-0 shrink-0 items-center gap-1.5 text-xs leading-tight text-[#cfd6cc] lg:flex">
            <Icon name="pin" size={18} />
            <span>Deliver to {DEMO_USER.name.split(" ")[0]}<br /><strong className="text-sm text-white">{DEMO_ADDRESS.city} {hydrated ? pin : DEMO_ADDRESS.pin}</strong></span>
          </div>
          <div className="order-last w-full md:order-none md:w-auto md:flex-1">
            <Suspense fallback={<div className="cw-search h-12" />}><SearchBox /></Suspense>
          </div>
          <nav aria-label="Account" className="ml-auto flex items-center gap-1 md:ml-0">
            <Link href={`${base}/account`} className="cw-iconlink">
              <Icon name="user" />
              <span className="hidden leading-tight sm:inline"><span className="block text-[11px] font-normal text-[#cfd6cc]">Hi, {DEMO_USER.name.split(" ")[0]}</span>Account &amp; orders</span>
              <span className="sm:hidden">Account</span>
            </Link>
            <Link href={`${base}/cart`} className="cw-iconlink" aria-label={`Cart, ${hydrated ? count : 0} items`}>
              <Icon name="cart" size={22} />
              <span className="cw-badge-count">{hydrated ? count : 0}</span>
              <span className="hidden sm:inline">Cart</span>
            </Link>
          </nav>
        </div>
      </div>
      <nav aria-label="Categories" className="cw-catnav">
        <ul className="cw-wrap cw-hide-scroll flex gap-6 overflow-x-auto">
          <li><Link href={`${base}/search`} className="no-underline">All products</Link></li>
          {categories.map((c) => <li key={c.slug}><Link href={`${base}/search?cat=${c.slug}`} className="no-underline">{c.name}</Link></li>)}
          <li><Link href={`${base}/search?sort=discount`} className="no-underline">Deals</Link></li>
          <li><Link href={`${base}/account/membership`} className="no-underline">Cartwheel Plus</Link></li>
        </ul>
      </nav>
    </header>
  );
}

export function Footer() {
  const { base } = useRiptide();
  const p = (s: string) => `${base}/policies/${s}`;
  return (
    <footer className="cw-footer mt-16">
      <div className="cw-wrap grid grid-cols-2 gap-8 py-12 md:grid-cols-5">
        <div className="col-span-2 md:col-span-1">
          <Logo light />
          <p className="mt-3 max-w-xs text-sm leading-relaxed">A marketplace for everyday things, from independent sellers across India. Prices include GST; every fee is shown in your cart.</p>
        </div>
        <div>
          <h2>About</h2>
          <ul className="flex flex-col gap-2">
            <li><Link href={`${base}/help#about`}>About Cartwheel</Link></li>
            <li><Link href={`${base}/help#sell`}>Sell on Cartwheel</Link></li>
            <li><Link href={`${base}/help#careers`}>Careers</Link></li>
          </ul>
        </div>
        <div>
          <h2>Help</h2>
          <ul className="flex flex-col gap-2">
            <li><Link href={`${base}/account`}>Your orders</Link></li>
            <li><Link href={`${base}/account/membership`}>Manage Cartwheel Plus</Link></li>
            <li><Link href={`${base}/help#contact`}>Contact us</Link></li>
          </ul>
        </div>
        <div>
          <h2>Help &amp; policies</h2>
          <Slot id="footer.links.list" as="ul" className="flex flex-col gap-2">
            <Slot id="footer.links.help" as="li"><Link href={`${base}/help`}>Help centre</Link></Slot>
            <Slot id="footer.links.terms" as="li"><Link href={p("terms")}>Terms of Use</Link></Slot>
            <Slot id="footer.links.returns" as="li"><Link href={p("returns")}>Returns &amp; Refunds</Link></Slot>
            <Slot id="footer.links.privacy" as="li"><Link href={p("privacy")}>Privacy Policy</Link></Slot>
            <Slot id="footer.links.shipping" as="li"><Link href={p("shipping")}>Shipping Policy</Link></Slot>
          </Slot>
        </div>
        <div>
          <h2>Community</h2>
          <ul className="flex flex-col gap-2">
            <li><Link href={`${base}/help#community`}>Cartwheel Journal</Link></li>
            <li><Link href={`${base}/help#community`}>Seller stories</Link></li>
            <li><Link href={`${base}/help#community`}>Press</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="cw-wrap flex flex-col gap-1 py-5 text-xs text-[#9faba2] sm:flex-row sm:justify-between">
          <p>© 2026 Cartwheel Marketplace (fictional). Bengaluru, India.</p>
          <p>{SANDBOX_NOTICE}</p>
        </div>
      </div>
    </footer>
  );
}
