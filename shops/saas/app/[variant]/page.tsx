"use client";
import Link from "next/link";
import { Slot, formatINR, useRiptide } from "@riptide/core";
import { APPS, TRIAL_DAYS } from "@/catalog";
import { AppIcon, HeroArt } from "@/components/Art";
import { Stars, useQuote } from "@/components/ui";

const SEL = { plan: "single" as const, app: "lumen", term: "monthly" as const, seats: 1 };

const QUOTES = [
  { name: "Meera Raghunathan", role: "Wedding photographer, Kochi", text: "Lumen's batch presets cut my culling-to-delivery time from four days to one. The sky masks are genuinely good." },
  { name: "Arjun Malhotra", role: "Motion designer, Gurugram", text: "I moved our studio's edits to Framewise last year. Hindi auto-captions alone saved us an intern's worth of hours." },
  { name: "Farah Siddiqui", role: "Brand designer, Hyderabad", text: "Contour plus Kern is my whole toolkit. Devanagari pairings that actually look right, finally." },
];

const FAQ = [
  ["How does the free trial work?", `Every plan starts with a ${TRIAL_DAYS}-day free trial. We show the exact date of your first charge and the amount before you start, and you can cancel from Account in two clicks before that date to pay nothing.`],
  ["Do prices include GST?", "Prices are shown as the base price plus 18% GST, with the total next to it, so the amount you see is the amount you pay."],
  ["What's the difference between the billing terms?", "Monthly has no commitment. Annual, billed monthly is cheaper per month but is a 12-month commitment with an early-termination fee after the first 14 days. Annual, prepaid is paid once for the year and is the cheapest per month."],
  ["Can I switch plans later?", "Yes. Switch plan or billing term from Account → Manage plan. Changes take effect on your next billing date and we show the new amount before you confirm."],
  ["Where is my work stored?", "Files stay on your device unless you save them to Prism Cloud. Cloud storage is in Indian data centres (Mumbai and Chennai)."],
] as const;

export default function Home() {
  const { base } = useRiptide();
  const q = useQuote(SEL);
  const plan = q?.lines.find((l) => l.key === "plan")?.amount ?? 0;
  const gst = q?.lines.find((l) => l.key === "gst")?.amount ?? 0;
  return (
    <main data-riptide-step="home">
      <section className="ps-wrap grid items-center gap-10 pb-12 pt-10 lg:grid-cols-[1.05fr_1fr] lg:pt-16">
        <div>
          <span className="ps-chip"><span className="h-2 w-2 rounded-full bg-success" /> Version 2026.3 is out: faster raw, Hindi captions</span>
          <Slot id="home.hero.title" as="h1" className="mt-6 text-[2.6rem] font-extrabold leading-[1.02] sm:text-[3.6rem] lg:text-[4.2rem]">
            Every creative app you need, in one studio.
          </Slot>
          <Slot id="home.hero.subtitle" as="p" className="mt-5 max-w-xl text-lg text-muted">
            Six apps for photo, vector, video, layout, PDF and type.
          </Slot>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Slot id="home.hero.cta" as={Link} href={`${base}/pricing`} className="rt-btn" variant="primary">See plans and pricing</Slot>
            <Link href={`${base}#apps`} className="rt-btn" data-variant="ghost">Explore the apps</Link>
          </div>
          <Slot id="home.trial.note" as="p" className="mt-4 text-sm text-muted">
            14-day free trial on every plan. Cancel online in two clicks.
          </Slot>
        </div>
        <HeroArt />
      </section>

      <div className="ps-wrap"><Slot id="home.promo.banner" className="empty:hidden" /></div>

      <section id="apps" className="ps-wrap scroll-mt-24 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="ps-eyebrow">The suite</p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Six apps. One subscription.</h2>
          </div>
          <Slot id="home.plans.teaser" as="p" className="ps-mono text-sm text-muted">
            {q ? `Single app ${formatINR(plan)}/mo + ${formatINR(gst)} GST, month to month` : " "}
          </Slot>
        </div>
        <Slot id="home.apps.list" as="ul" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {APPS.map((a) => (
            <Slot key={a.id} id={`home.apps.${a.id}`} as="li" className="ps-panel group flex flex-col gap-4 p-6 transition hover:-translate-y-0.5">
              <div className="flex items-start justify-between">
                <AppIcon id={a.id} size={60} />
                <span className="ps-chip">{a.category}</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">Prism {a.name}</h3>
                <p className="text-sm text-muted">{a.kind}</p>
              </div>
              <p className="flex-1 text-[0.95rem]">{a.tagline}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2"><Stars value={a.rating} /> {a.rating} <span className="text-muted">({a.reviews.toLocaleString("en-IN")})</span></span>
                <Link href={`${base}/apps/${a.id}`} className="rt-link">Learn more <span aria-hidden>→</span></Link>
              </div>
            </Slot>
          ))}
        </Slot>
      </section>

      <section className="ps-wrap py-12">
        <div className="ps-panel grid gap-8 overflow-hidden p-8 md:grid-cols-3 md:p-10">
          {[
            ["One library, every app", "Swatches, brushes, fonts and brand kits sync across Lumen, Contour, Tessera and Framewise."],
            ["Made for Indian scripts", "Kern ships 310 families with Devanagari, Tamil, Bengali, Telugu and more, and every app shapes them correctly."],
            ["Work offline, sync later", "Apps run on your machine. Prism Cloud is optional, stored in Mumbai and Chennai."],
          ].map(([t, b]) => (
            <div key={t}>
              <div className="ps-spectrum w-12" />
              <h3 className="mt-4 text-lg font-bold">{t}</h3>
              <p className="mt-2 text-muted">{b}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="ps-wrap py-12">
        <p className="ps-eyebrow">From the community</p>
        <h2 className="mt-2 text-3xl font-bold">Made with Prism</h2>
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {QUOTES.map((t) => (
            <li key={t.name} className="ps-panel p-6">
              <blockquote className="text-[1.02rem] leading-relaxed">“{t.text}”</blockquote>
              <p className="mt-4 font-semibold">{t.name}</p>
              <p className="text-sm text-muted">{t.role}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="ps-wrap grid gap-8 py-12 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <p className="ps-eyebrow">Questions</p>
          <h2 className="mt-2 text-3xl font-bold">Plans, trials and billing</h2>
          <p className="mt-3 text-muted">Everything about cancelling, refunds and commitments is also in our <Link className="rt-link" href={`${base}/policies/cancellation`}>cancellation &amp; refund policy</Link>.</p>
        </div>
        <div className="flex flex-col gap-3">
          {FAQ.map(([qn, a]) => (
            <details key={qn} className="ps-panel group p-5">
              <summary className="cursor-pointer list-none font-semibold">{qn}</summary>
              <p className="mt-3 text-muted">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
