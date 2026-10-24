import type { Metadata } from "next";
import { Bricolage_Grotesque, Onest } from "next/font/google";
import { brand } from "@/brand";
import "./globals.css";

const body = Onest({ subsets: ["latin"], variable: "--font-rb-body" });
const heading = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-rb-heading" });

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${body.variable} ${heading.variable}`}>
      <body style={{ ...brand.tokens, "--rt-font-body": "var(--font-rb-body)", "--rt-font-heading": "var(--font-rb-heading)" } as React.CSSProperties}>
        {children}
      </body>
    </html>
  );
}
