"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Slot, SlotButton, formatINR, useFlow, useRiptide } from "@riptide/core";
import { Icon, Poster, useOtt, usePlanQuote } from "@/components/ui";
import { PLANS, type Plan } from "@/lib/plans";
import { titleById } from "@/lib/catalogue";

const HERO_IDS = ["the-salt-ledger", "copper-sky-colony", "marigold-summer", "monsoon-protocol", "pip-and-the-paper-tiger", "velvet-arithmetic", "rivers-that-remember", "the-quiet-array"];

const FAQS: [string, string][] = [
  ["What is Reelbox?", "Reelbox is a streaming service for original Indian films, series, documentaries and kids' shows. Watch on your phone, tablet, computer or TV, as much as you like, for one monthly price."],
  ["How much does it cost?", "Plans start at the Mobile price shown above and go up to Premium. Every price on this site shows 18% GST separately and the total you pay. There are no other fees."],
  ["How does billing work?", "You're billed monthly from the day you sign up, at the same price, until you cancel. There's no free trial, no annual commitment and no cancellation fee."],
  ["How do I cancel?", "Go to Account and choose Cancel membership. It takes two steps, and you keep watching until the end of the period you've already paid for. You won't be charged again."],
  ["Can I change my plan later?", "Yes. Switch plans any time from Account. The new price applies from your next billing date."],
  ["Is there anything for children?", "Every plan includes Kids profiles with a curated catalogue rated U and U/A 7+, and a PIN lock for other profiles."],
];

function TeaserPlan({ p }: { p: Plan }) {
  const q = usePlanQuote(p.id);
  return (
    <li className="rb-teaser__plan">
      <span className="rb-teaser__name">{p.name}</span>
      <span className="rb-teaser__res">{p.resolution} · {p.screens} screen{p.screens > 1 ? "s" : ""}</span>
      <span className="rb-teaser__price"><b>{formatINR(q.total)}</b>/month</span>
      <span className="rb-fine">{formatINR(p.price)} + {formatINR(q.lines.find((l) => l.key === "gst")?.amount ?? 0)} GST</span>
    </li>
  );
}

export default function Landing() {
  const { base } = useRiptide();
  const flow = useFlow("purchase");
  const router = useRouter();
  const [, set] = useOtt();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const from = usePlanQuote("mobile");
  const start = flow.href(flow.steps[0].path);

  function getStarted(e: React.FormEvent) {
    e.preventDefault();
    if (email && !/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email address, or leave it blank and add it later.");
    if (email) set({ email });
    router.push(start);
  }

  return (
    <main data-riptide-step="home">
      <section className="rb-hero">
        <div className="rb-hero__wall" aria-hidden>
          {HERO_IDS.map((id) => <Poster key={id} t={titleById(id)!} className="rb-hero__poster" />)}
        </div>
        <div className="rb-wrap rb-hero__inner">
          <p className="rb-eyebrow">64 original films and series</p>
          <Slot id="home.hero.title" as="h1" className="rb-display">Stories worth staying in for.</Slot>
          <Slot id="home.hero.subtitle" as="p" className="rb-lede">
            {`Plans from ${formatINR(from.total)}/month incl. GST. Cancel anytime.`}
          </Slot>
          <form className="rb-hero__form" onSubmit={getStarted} noValidate>
            <div className="rb-hero__field">
              <label htmlFor="hero-email">Email (optional, you can add it later)</label>
              <input id="hero-email" type="email" className="rt-input" placeholder="you@example.com" value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }} aria-invalid={!!error} aria-describedby={error ? "hero-email-err" : undefined} />
              {error && <span id="hero-email-err" className="rb-error">{error}</span>}
            </div>
            <SlotButton id="home.hero.cta" type="submit" variant="primary" className="rb-hero__go">Get started</SlotButton>
          </form>
          <div className="rb-hero__alt">
            <span className="rb-muted">Already a member?</span>
            <SlotButton id="home.hero.demo" as={Link} href={`${base}/browse`} variant="ghost">Continue as demo user</SlotButton>
          </div>
        </div>
      </section>

      <div className="rb-wrap rb-stack">
        <Slot id="home.promo.banner" className="rb-promo-slot" />

        <Slot id="home.plans.teaser" as="section" className="rb-teaser" aria-labelledby="teaser-h">
          <div className="rb-teaser__head">
            <h2 id="teaser-h" className="rb-h2">One price a month. Four ways to watch.</h2>
            <Link href={`${base}/plans`} className="rt-link">Compare plans <Icon name="right" size={16} /></Link>
          </div>
          <ul className="rb-teaser__list">{PLANS.map((p) => <TeaserPlan key={p.id} p={p} />)}</ul>
          <p className="rb-fine">Prices are per month and shown with 18% GST. Billed monthly. No commitment.</p>
        </Slot>

        <Slot id="home.features.list" as="section" className="rb-features" aria-label="Why Reelbox">
          <Slot id="home.features.downloads" className="rb-feature">
            <Icon name="down" size={28} /><h3 className="rb-h3">Download and go</h3>
            <p className="rb-muted">Save episodes to your phone or tablet and watch offline on the train, the flight or the hill station with no signal.</p>
          </Slot>
          <Slot id="home.features.kids" className="rb-feature">
            <Icon name="kids" size={28} /><h3 className="rb-h3">Profiles for kids</h3>
            <p className="rb-muted">A calm, curated space rated U and U/A 7+, with no autoplay trailers and a PIN for grown-up profiles.</p>
          </Slot>
          <Slot id="home.features.cancel" className="rb-feature">
            <Icon name="check" size={28} /><h3 className="rb-h3">Cancel in two steps</h3>
            <p className="rb-muted">No calls, no forms to post. Cancel from Account and keep watching until your paid month ends.</p>
          </Slot>
        </Slot>

        <section id="faq" aria-labelledby="faq-h" className="rb-faq">
          <h2 id="faq-h" className="rb-h2">Questions, answered</h2>
          <Slot id="home.faq.list" className="rb-faq__list">
            {FAQS.map(([q, a]) => (
              <details key={q} className="rb-faq__item">
                <summary>{q}<Icon name="plus" size={18} /></summary>
                <p>{a}</p>
              </details>
            ))}
          </Slot>
        </section>
      </div>
    </main>
  );
}
