import { JsonLd } from "@riptide/core";
import { headJsonLd, headMetadata, loadManifest } from "@riptide/core/server";
import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import { Header, Footer } from "@/components/Chrome";
import { config } from "@/shop.config";
import { brand } from "@/brand";

type P = { params: Promise<{ variant: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { variant } = await params;
  return headMetadata(await loadManifest(config, variant), { title: { default: brand.name, template: `%s · ${brand.name}` } });
}

export default async function VariantLayout({ children, params }: P & { children: React.ReactNode }) {
  const { variant } = await params;
  const manifest = await loadManifest(config, variant);
  return (
    <Providers manifest={manifest} variant={variant}>
      <JsonLd items={headJsonLd(manifest)} />
      <Header />
      {children}
      <Footer />
    </Providers>
  );
}
