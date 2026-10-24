import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { POLICIES } from "@/data/content";
import { Crumbs } from "@/components/Ui";

type P = { params: Promise<{ variant: string; slug: string }> };

export function generateStaticParams() {
  return POLICIES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug } = await params;
  return { title: POLICIES.find((p) => p.slug === slug)?.title ?? "Policy" };
}

export default async function Policy({ params }: P) {
  const { variant, slug } = await params;
  const pol = POLICIES.find((p) => p.slug === slug);
  if (!pol) notFound();
  const base = `/${variant}`;
  return (
    <main data-riptide-step="policies" className="cw-wrap pt-5">
      <Crumbs items={[["Home", base], ["Policies"], [pol.title]]} />
      <div className="mt-5 grid gap-8 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Policies" className="h-fit lg:sticky lg:top-4">
          <ul className="flex flex-wrap gap-2 lg:flex-col">
            {POLICIES.map((p) => (
              <li key={p.slug}>
                <Link href={`${base}/policies/${p.slug}`} aria-current={p.slug === slug ? "page" : undefined}
                  className={`block rounded-lg px-3 py-2 text-sm no-underline ${p.slug === slug ? "bg-ink font-semibold text-white" : "hover:bg-surface-2"}`}>{p.title}</Link>
              </li>
            ))}
            <li><Link href={`${base}/help`} className="block rounded-lg px-3 py-2 text-sm no-underline hover:bg-surface-2">Help centre</Link></li>
          </ul>
        </nav>
        <article className="cw-prose cw-panel-flat p-6 md:p-10">
          <h1 className="text-3xl font-semibold">{pol.title}</h1>
          <p className="mt-1 text-sm text-muted">Last updated {pol.updated}</p>
          <p className="mt-5 text-lg">{pol.intro}</p>
          {pol.sections.map((s) => (
            <section key={s.h}>
              <h2>{s.h}</h2>
              {s.p.map((t) => <p key={t}>{t}</p>)}
            </section>
          ))}
          <p className="mt-8 text-sm text-muted">Cartwheel is a fictional store in the Riptide sandbox. Questions? See the <Link href={`${base}/help`} className="rt-link">Help centre</Link>.</p>
        </article>
      </div>
    </main>
  );
}
