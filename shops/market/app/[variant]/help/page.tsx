import Link from "next/link";
import type { Metadata } from "next";
import { FAQS, POLICIES } from "@/data/content";
import { Crumbs } from "@/components/Ui";

export const metadata: Metadata = { title: "Help centre" };

export default async function Help({ params }: { params: Promise<{ variant: string }> }) {
  const { variant } = await params;
  const base = `/${variant}`;
  const blocks: [string, string, string][] = [
    ["about", "About Cartwheel", "Cartwheel is a marketplace for everyday things, connecting shoppers with independent sellers across India. We show every fee upfront and never add extras you didn't choose."],
    ["sell", "Sell on Cartwheel", "Sellers list products, set their own prices and ship through Cartwheel Logistics. Seller ratings and return windows are shown on every product page."],
    ["careers", "Careers", "We're a small team in Bengaluru working on search, logistics and seller tools."],
    ["contact", "Contact us", "Chat with support from your account, 8 am to 10 pm every day, or write to help@cartwheel.example. We reply within one working day."],
    ["community", "Community", "The Cartwheel Journal shares seller stories, buying guides and updates from the team."],
  ];
  return (
    <main data-riptide-step="policies" className="cw-wrap max-w-4xl pt-5">
      <Crumbs items={[["Home", base], ["Help centre"]]} />
      <h1 className="mt-4 text-3xl font-semibold">Help centre</h1>
      <section className="mt-6" aria-labelledby="faq-h">
        <h2 id="faq-h" className="cw-h2">Frequently asked questions</h2>
        <div className="mt-3 flex flex-col gap-2">
          {FAQS.map(([q, a]) => (
            <details key={q} className="cw-panel-flat p-4">
              <summary className="cursor-pointer font-semibold">{q}</summary>
              <p className="mt-2 text-sm text-[#2f3a34]">{a}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="mt-8 grid gap-3 sm:grid-cols-2" aria-label="Policies">
        {POLICIES.map((p) => (
          <Link key={p.slug} href={`${base}/policies/${p.slug}`} className="cw-panel-flat p-4 no-underline hover:shadow-[var(--rt-shadow)]">
            <strong>{p.title}</strong><span className="mt-1 block text-sm text-muted">{p.intro}</span>
          </Link>
        ))}
      </section>
      {blocks.map(([id, h, t]) => (
        <section key={id} id={id} className="mt-8 scroll-mt-4">
          <h2 className="cw-h2">{h}</h2>
          <p className="mt-2 text-[#2f3a34]">{t}</p>
        </section>
      ))}
    </main>
  );
}
