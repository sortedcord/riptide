import type { Metadata } from "next";
import { Figtree, Fraunces } from "next/font/google";
import { brand } from "@/brand";
import "./globals.css";

const body = Figtree({ subsets: ["latin"], variable: "--font-ff-body" });
const heading = Fraunces({ subsets: ["latin"], variable: "--font-ff-heading", axes: ["SOFT", "opsz"] });

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${body.variable} ${heading.variable}`}>
      <body style={{ ...brand.tokens, "--rt-font-body": "var(--font-ff-body)", "--rt-font-heading": "var(--font-ff-heading)" } as React.CSSProperties}>
        {children}
      </body>
    </html>
  );
}
