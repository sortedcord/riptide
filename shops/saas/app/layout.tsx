import type { Metadata } from "next";
import { Figtree, Syne, IBM_Plex_Mono } from "next/font/google";
import { brand } from "@/brand";
import "./globals.css";

const body = Figtree({ subsets: ["latin"], variable: "--font-ps-body" });
const heading = Syne({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-ps-heading" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-ps-mono" });

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${body.variable} ${heading.variable} ${mono.variable}`}>
      <body style={{ ...brand.tokens, "--rt-font-body": "var(--font-ps-body)", "--rt-font-heading": "var(--font-ps-heading)" } as React.CSSProperties}>
        {children}
      </body>
    </html>
  );
}
