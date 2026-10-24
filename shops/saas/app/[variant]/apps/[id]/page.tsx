"use client";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { use } from "react";
import { Slot, SlotButton, formatINR, prng, useRiptide, useSession } from "@riptide/core";
import { APPS, appById } from "@/catalog";
import type { SaasState } from "@/shop.config";
import { AppIcon } from "@/components/Art";
import { Crumbs, Stars, useQuote } from "@/components/ui";

const NAMES = ["Kavya Menon", "Rohit Deshpande", "Sneha Banerjee", "Imran Qureshi", "Priya Nair", "Vikram Sethi", "Lakshmi Subramanian", "Aditya Kulkarni", "Neha Choudhary", "Siddharth Rao"];
const CITIES = ["Chennai", "Pune", "Kolkata", "Lucknow", "Thiruvananthapuram", "Jaipur", "Coimbatore", "Indore", "Bhubaneswar", "Mysuru"];
const LINES = [
  "Stable on my three-year-old laptop, which I did not expect.",
  "The learning curve is real for the first week, then it clicks.",
  "Export presets are the feature I didn't know I needed.",
  "Would love more tutorials in regional languages, but the app itself is solid.",
  "Switched from a free tool and the time saved paid for the plan in a month.",
  "Occasional slowdowns on very large files; support replied within a day.",
];

function reviews(id: string) {
  const r = prng(`reviews:${id}`);
  return Array.from({ length: 4 }, (_, i) => ({
    name: NAMES[Math.floor(r() * NAMES.length)],
    city: CITIES[Math.floor(r() * CITIES.length)],
    stars: 3 + Math.round(r() * 2),
    text: LINES[(Math.floor(r() * LINES.length) + i) % LINES.length],
    date: `${1 + Math.floor(r() * 27)} ${["Jun", "Jul", "Aug", "Sep", "Oct"][Math.floor(r() * 5)]} 2026`,
  }));
}

export default function AppPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const app = appById(id);
  const { base } = useRiptide();
  const [, set] = useSession<SaasState>();
  const router = useRouter();
  const q = useQuote(app ? { plan: "single", app: app.id, term: "monthly", seats: 1 } : undefined);
  if (!app) notFound();
  const plan = q?.lines.find((l) => l.key === "plan")?.amount ?? 0;
  const gst = q?.lines.find((l) => l.key === "gst")?.amount ?? 0;
  const others = APPS.filter((a) => a.id !== app.id).slice(0, 3);

  return (
    <main data-riptide-step="app" className="ps-wrap py-8">
      <Crumbs items={[["Home", base], ["Apps", `${base}#apps`], [`Prism ${app.name}`]]} />
      <Slot id="app.promo.banner" className="mt-4 empty:hidden" />
      <section className="mt-6 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <div className="min-w-0">
          <div className="flex items-center gap-5">
            <AppIcon id={app.id} size={88} />
            <div>
              <p className="ps-eyebrow">{app.kind}</p>
              <h1 className="mt-1 text-4xl font-extrabold sm:text-5xl">Prism {app.name}</h1>
              <p className="mt-2 flex flex-wrap items-center gap-2 text-sm"><Stars value={app.rating} /> <b>{app.rating}</b> <span className="text-muted">· {app.reviews.toLocaleString("en-IN")} ratings · v{app.version}</span></p>
            </div>
          </div>
          <p className="mt-6 text-xl leading-snug">{app.tagline}</p>
          <p className="mt-4 text-muted leading-relaxed">{app.description}</p>
          <h2 className="mt-10 text-2xl font-bold">What you can do</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {app.features.map((f) => (
              <li key={f} className="flex gap-3 rounded-[var(--rt-radius-sm)] border border-line bg-surface p-4">
                <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden className="mt-0.5 shrink-0"><path d="M4 10.5 8 14l8-8" fill="none" stroke="var(--rt-success)" strokeWidth="2.2" strokeLinecap="round" /></svg>
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <h2 className="mt-10 text-2xl font-bold">Specifications</h2>
          <table className="ps-table mt-3">
            <tbody>
              <tr><th scope="row">File formats</th><td>{app.formats}</td></tr>
              <tr><th scope="row">Platforms</th><td>{app.platforms}</td></tr>
              <tr><th scope="row">System requirements</th><td>{app.requirements}</td></tr>
              <tr><th scope="row">Current version</th><td>{app.version} (released Sep 2026)</td></tr>
              <tr><th scope="row">Languages</th><td>English, हिन्दी, தமிழ், বাংলা, मराठी</td></tr>
            </tbody>
          </table>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="ps-panel p-6">
            <p className="ps-eyebrow">Single app plan · monthly</p>
            <Slot id="app.price.panel" as="p" className="mt-3 text-3xl font-extrabold">
              {q ? `${formatINR(plan)}/mo + ${formatINR(gst)} GST` : " "}
            </Slot>
            <p className="mt-1 text-sm text-muted">{q ? `${formatINR(q.total)} per month in total. Also included in All Apps and Team.` : " "}</p>
            <p className="mt-4 text-sm">Lower monthly prices are available on annual terms. The pricing page shows every term, its commitment and the free-trial dates before you choose.</p>
            <SlotButton id="app.cta.plans" variant="primary" className="mt-5 w-full"
              onClick={() => { set({ app: app.id }); router.push(`${base}/pricing`); }}>
              See plans &amp; free trial
            </SlotButton>
          </div>
        </aside>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-bold">Reviews</h2>
        <ul className="mt-4 grid gap-4 md:grid-cols-2">
          {reviews(app.id).map((r, i) => (
            <li key={i} className="ps-panel p-5">
              <div className="flex items-center justify-between gap-2"><Stars value={r.stars} /><span className="text-xs text-muted">{r.date}</span></div>
              <p className="mt-3">{r.text}</p>
              <p className="mt-3 text-sm font-semibold">{r.name} <span className="font-normal text-muted">· {r.city}</span></p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-bold">Works well with</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-3">
          {others.map((a) => (
            <li key={a.id}><Link href={`${base}/apps/${a.id}`} className="ps-panel flex items-center gap-4 p-4 hover:-translate-y-0.5 transition"><AppIcon id={a.id} size={44} /><span><b>Prism {a.name}</b><br /><span className="text-sm text-muted">{a.kind}</span></span></Link></li>
          ))}
        </ul>
      </section>
    </main>
  );
}
