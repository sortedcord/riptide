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
  ["/runs", "Runs"],
  ["/jobs", "Agents & jobs"],
  ["/settings", "Settings"],
] as const;

/** Emberspire "spire strokes" mark. */
const Mark = () => (
  <svg viewBox="0 0 294.57 297.53" fill="currentColor" aria-hidden="true">
    <path d="M102.45,112.5H14.06c-7.77,0-14.06-6.3-14.06-14.06s6.3-14.06,14.06-14.06h88.39c6.81,0,12.96-3.77,16.05-9.84l25.09-49.32c7.91-15.55,23.67-25.21,41.12-25.21h94.31c7.77,0,14.06,6.3,14.06,14.06s-6.3,14.06-14.06,14.06h-94.31c-6.81,0-12.96,3.77-16.05,9.84l-25.09,49.32c-7.91,15.55-23.67,25.21-41.12,25.21Z" />
    <path d="M103.19,205.01H14.8c-7.77,0-14.06-6.3-14.06-14.06s6.3-14.06,14.06-14.06h88.39c6.81,0,12.96-3.77,16.05-9.84l25.09-49.32c7.91-15.55,23.67-25.21,41.12-25.21h94.31c7.77,0,14.06,6.3,14.06,14.06s-6.3,14.06-14.06,14.06h-94.31c-6.81,0-12.96,3.77-16.05,9.84l-25.09,49.32c-7.91,15.55-23.67,25.21-41.12,25.21Z" />
    <path d="M103.93,297.53H15.54c-7.77,0-14.06-6.3-14.06-14.06s6.3-14.06,14.06-14.06h88.39c6.81,0,12.96-3.77,16.05-9.84l25.09-49.32c7.91-15.55,23.67-25.21,41.12-25.21h94.31c7.77,0,14.06,6.3,14.06,14.06s-6.3,14.06-14.06,14.06h-94.31c-6.81,0-12.96,3.77-16.05,9.84l-25.09,49.32c-7.91,15.55-23.67,25.21-41.12,25.21Z" />
  </svg>
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
