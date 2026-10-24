import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AutoRefresh } from "@/components/client";
import { Nav } from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = { title: "Riptide console", robots: { index: false, follow: false } };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="mx-auto flex max-w-[1560px] flex-col md:flex-row">
          <Nav />
          <main className="min-w-0 flex-1 px-4 py-8 md:px-10 md:py-10">{children}</main>
        </div>
        <AutoRefresh />
      </body>
    </html>
  );
}
