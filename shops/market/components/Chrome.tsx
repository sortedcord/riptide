"use client";
import Link from "next/link";
import { Slot, SANDBOX_NOTICE, useRiptide, useSession } from "@riptide/core";
import type { MarketState } from "@/shop.config";
import { brand } from "@/brand";

export function Header() {
  const { base } = useRiptide();
  const [s] = useSession<MarketState>();
  const count = s.cart.reduce((n, l) => n + l.qty, 0);
  return (
    <header className="border-b border-line bg-surface">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3" aria-label="Main">
        <Link href={base} className="font-heading text-2xl font-bold text-primary">{brand.name}</Link>
        <Link href={`${base}/cart`} className="rt-link">Cart ({count})</Link>
      </nav>
    </header>
  );
}

export function Footer() {
  const { base } = useRiptide();
  return (
    <footer className="mt-16 border-t border-line bg-surface px-4 py-8 text-sm text-muted">
      <Slot id="footer.links.list" as="ul" className="mx-auto flex max-w-6xl gap-6">
        <Slot id="footer.links.help" as="li"><Link href={`${base}`}>Help</Link></Slot>
        <Slot id="footer.links.terms" as="li"><Link href={`${base}`}>Terms</Link></Slot>
      </Slot>
      <p className="mx-auto mt-6 max-w-6xl text-xs">{SANDBOX_NOTICE}</p>
    </footer>
  );
}
