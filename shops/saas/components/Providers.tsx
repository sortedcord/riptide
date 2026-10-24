"use client";
import { RiptideProvider, type Manifest } from "@riptide/core";
import type { ReactNode } from "react";
import { config } from "@/shop.config";

export function Providers({ manifest, variant, children }: { manifest: Manifest; variant: string; children: ReactNode }) {
  return <RiptideProvider config={config} manifest={manifest} variant={variant}>{children}</RiptideProvider>;
}
