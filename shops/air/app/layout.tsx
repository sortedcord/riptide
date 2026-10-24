import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Sora } from "next/font/google";
import { brand } from "@/brand";
import "./globals.css";

const body = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-sk-body" });
const heading = Sora({ subsets: ["latin"], variable: "--font-sk-heading" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-sk-mono" });

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${body.variable} ${heading.variable} ${mono.variable}`}>
      <body style={{ ...brand.tokens, "--rt-font-body": "var(--font-sk-body)", "--rt-font-heading": "var(--font-sk-heading)" } as React.CSSProperties}>
        {children}
      </body>
    </html>
  );
}
