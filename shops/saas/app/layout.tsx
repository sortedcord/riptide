import type { Metadata } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import { brand } from "@/brand";
import "./globals.css";

const body = Inter({ subsets: ["latin"], variable: "--font-cw-body" });
const heading = Inter_Tight({ subsets: ["latin"], variable: "--font-cw-heading" });

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${body.variable} ${heading.variable}`}>
      <body style={{ ...brand.tokens, "--rt-font-body": "var(--font-cw-body)", "--rt-font-heading": "var(--font-cw-heading)" } as React.CSSProperties}>
        {children}
      </body>
    </html>
  );
}
