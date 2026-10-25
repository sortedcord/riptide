"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const NAV = [
  ["/", "Overview"],
  ["/pipeline", "Pipeline"],
  ["/shops", "Shops"],
  ["/variants", "Variants"],
  ["/suites", "Suites & ratings"],
  ["/agents", "Agent ratings"],
  ["/audits", "Platform auditing"],
  ["/runs", "Runs"],
  ["/jobs", "Agents & jobs"],
  ["/settings", "Settings"],
] as const;

/** The anglerfish symbol (dark-theme variant of docs/assets/logo.png). */
const Mark = () => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src="/riptide-logo.png" alt="" width={40} height={32} className="h-8 w-auto flex-none" />
);

export function Nav() {
  const path = usePathname();
  const list = useRef<HTMLUListElement>(null);
  // On narrow screens the nav scrolls sideways; keep the current page's tab in view.
  useEffect(() => { list.current?.querySelector("[aria-current=page]")?.scrollIntoView({ block: "nearest", inline: "nearest" }); }, [path]);
  const on = (href: string) => (href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`));
  return (
    <nav aria-label="Main" className="relative flex flex-col gap-6 overflow-hidden bg-[var(--es-charcoal)] p-4 md:sticky md:top-4 md:m-4 md:mr-0 md:h-[calc(100vh-2rem)] md:w-60 md:shrink-0 md:rounded-[16px] md:p-5">
      <Link href="/" className="es-brand px-1" aria-label="Riptide console home">
        <Mark />
        <span>Riptide <span className="font-normal text-[var(--muted)]">console</span></span>
      </Link>
      <ul ref={list} className="flex gap-1 overflow-x-auto md:flex-col">
        {NAV.map(([href, label]) => (
          <li key={href}>
            <Link href={href} className="es-nav-link" aria-current={on(href) ? "page" : undefined}>{label}</Link>
          </li>
        ))}
      </ul>
      <div className="es-blades es-nav-blades absolute right-0 bottom-0 h-28" aria-hidden="true">
        <div className="es-blade es-blade--2" />
        <div className="es-blade es-blade--3" />
        <div className="es-blade es-blade--4" />
        <div className="es-blade es-blade--1" />
      </div>
    </nav>
  );
}
