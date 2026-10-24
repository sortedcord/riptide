"use client";
import Link from "next/link";
import { SANDBOX_NOTICE, Slot, useHydrated, useRiptide, useSession } from "@riptide/core";
import { brand } from "@/brand";
import { APPS } from "@/catalog";
import type { SaasState } from "@/shop.config";
import { Logo } from "./Art";

const ic = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };

export function Header() {
  const { base } = useRiptide();
  const [s] = useSession<SaasState>();
  const hydrated = useHydrated();
  const hasPlan = hydrated && !!s.plan;
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-[color-mix(in_srgb,var(--rt-bg)_88%,transparent)] backdrop-blur">
      <div className="ps-wrap flex h-16 items-center gap-6">
        <Link href={base} className="shrink-0 text-fg" aria-label={`${brand.name} home`}><Logo className="text-lg" /></Link>
        <nav aria-label="Main" className="hidden items-center gap-5 text-[0.95rem] font-medium md:flex">
          <Link href={`${base}#apps`} className="hover:underline">Apps</Link>
          <Link href={`${base}/pricing`} className="hover:underline">Pricing</Link>
          <Link href={`${base}/apps/kern`} className="hover:underline">Fonts</Link>
          <Link href={`${base}/policies/help`} className="hover:underline">Help</Link>
        </nav>
        <form role="search" action={`${base}/search`} className="ml-auto hidden max-w-xs flex-1 sm:block">
          <label htmlFor="ps-search" className="sr-only">Search apps and help</label>
          <div className="flex items-center gap-2 rounded-full border border-line bg-surface px-3">
            <svg {...ic} width={16} height={16}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            <input id="ps-search" name="q" placeholder="Search apps, e.g. video" className="h-10 w-full bg-transparent text-sm outline-none" />
          </div>
        </form>
        <div className="ml-auto flex items-center gap-1 sm:ml-0">
          <Link href={`${base}/search`} className="grid h-10 w-10 place-items-center rounded-full hover:bg-surface-2 sm:hidden" aria-label="Search">
            <svg {...ic}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          </Link>
          <Link href={hasPlan ? `${base}/review` : `${base}/pricing`} className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-surface-2" aria-label={hasPlan ? "Your plan selection (1 plan)" : "Your plan selection (empty)"}>
            <svg {...ic}><path d="M5 8h14l-1.2 11.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>
            {hasPlan && <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-accent" />}
          </Link>
          <Link href={`${base}/account`} className="flex h-10 items-center gap-2 rounded-full px-2 hover:bg-surface-2" aria-label="Account">
            <svg {...ic}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
            <span className="hidden text-sm font-medium lg:inline">Account</span>
          </Link>
        </div>
      </div>
      <nav aria-label="Main (mobile)" className="ps-wrap flex gap-5 overflow-x-auto pb-2 text-sm font-medium md:hidden">
        <Link href={`${base}#apps`}>Apps</Link>
        <Link href={`${base}/pricing`}>Pricing</Link>
        <Link href={`${base}/apps/kern`}>Fonts</Link>
        <Link href={`${base}/policies/help`}>Help</Link>
      </nav>
    </header>
  );
}

export function Footer() {
  const { base } = useRiptide();
  const p = (slug: string) => `${base}/policies/${slug}`;
  return (
    <footer className="mt-24 bg-fg text-[#E9E4D8]">
      <div className="ps-spectrum !rounded-none" />
      <div className="ps-wrap grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
        <div>
          <Logo className="text-lg text-[#FFFDF8]" />
          <p className="mt-4 max-w-xs text-sm text-[#B9B3A6]">{brand.tagline} Made in Bengaluru and Pune since 2014.</p>
          <p className="mt-4 text-xs text-[#9A9487]">Prism Studio Software Pvt. Ltd. · GSTIN 29AAKCP4471M1Z9 (fictional)</p>
        </div>
        <FooterCol title="Apps">
          {APPS.map((a) => <li key={a.id}><Link href={`${base}/apps/${a.id}`} className="hover:underline">Prism {a.name}</Link></li>)}
        </FooterCol>
        <FooterCol title="About">
          <li><Link href={p("about")} className="hover:underline">About Prism</Link></li>
          <Slot id="footer.links.careers" as="li"><Link href={`${p("about")}#careers`} className="hover:underline">Careers</Link></Slot>
          <li><Link href={`${p("about")}#press`} className="hover:underline">Press</Link></li>
          <li><Link href={`${base}/pricing`} className="hover:underline">Pricing</Link></li>
        </FooterCol>
        <div>
          <h2 className="ps-eyebrow !text-[#9A9487]">Help &amp; policies</h2>
          <Slot id="footer.links.list" as="ul" className="mt-4 flex flex-col gap-2 text-sm">
            <Slot id="footer.links.help" as="li"><Link href={p("help")} className="hover:underline">Help centre</Link></Slot>
            <Slot id="footer.links.terms" as="li"><Link href={p("terms")} className="hover:underline">Terms of use</Link></Slot>
            <Slot id="footer.links.refunds" as="li"><Link href={p("cancellation")} className="hover:underline">Cancellation &amp; refunds</Link></Slot>
            <Slot id="footer.links.privacy" as="li"><Link href={p("privacy")} className="hover:underline">Privacy</Link></Slot>
          </Slot>
        </div>
        <FooterCol title="Social">
          <li><Link href={`${p("about")}#community`} className="hover:underline">Community forum</Link></li>
          <li><Link href={`${p("about")}#community`} className="hover:underline">Creator livestreams</Link></li>
          <li><Link href={`${p("about")}#community`} className="hover:underline">@prismstudio.in</Link></li>
        </FooterCol>
      </div>
      <div className="border-t border-white/10">
        <div className="ps-wrap flex flex-wrap justify-between gap-2 py-5 text-xs text-[#9A9487]">
          <span>© 2026 Prism Studio. Prices in ₹. GST (18%) is shown next to every price.</span>
          <span>{SANDBOX_NOTICE}</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="ps-eyebrow !text-[#9A9487]">{title}</h2>
      <ul className="mt-4 flex flex-col gap-2 text-sm">{children}</ul>
    </div>
  );
}
