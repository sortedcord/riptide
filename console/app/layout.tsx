import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { AutoRefresh } from "@/components/client";
import "./globals.css";

export const metadata: Metadata = { title: "Riptide console", robots: { index: false, follow: false } };

const NAV = [
  ["/", "Overview"],
  ["/variants", "Variants"],
  ["/suites", "Suites & ratings"],
  ["/runs", "Runs"],
  ["/jobs", "Agents & jobs"],
] as const;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="mx-auto flex max-w-[1500px] flex-col md:flex-row">
          <nav aria-label="Main" className="border-b border-[var(--border)] p-4 md:sticky md:top-0 md:h-screen md:w-56 md:shrink-0 md:border-r md:border-b-0">
            <Link href="/" className="mb-6 block text-lg font-bold tracking-tight">
              Riptide <span className="font-normal text-[var(--muted)]">console</span>
            </Link>
            <ul className="flex gap-1 overflow-x-auto md:flex-col">
              {NAV.map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="block whitespace-nowrap rounded-md px-3 py-2 text-sm hover:bg-[var(--surface-2)]">{label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
        </div>
        <AutoRefresh />
      </body>
    </html>
  );
}
