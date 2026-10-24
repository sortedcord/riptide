import Link from "next/link";
import { notFound } from "next/navigation";
import { PRICE, REFUND_WINDOW_DAYS, STORAGE_PRICE, TRIAL_DAYS } from "@/catalog";

type Section = { h: string; id?: string; p: string[] };
const UPDATED = "Last updated 1 October 2026";

const POLICIES: Record<string, { title: string; intro: string; sections: Section[] }> = {
  terms: {
    title: "Terms of use",
    intro: "These terms cover your Prism ID and any Prism Studio subscription. Prism Studio Software Pvt. Ltd. is a fictional company in a test environment.",
    sections: [
      { h: "Plans and prices", p: [
        `Plans are Single app (₹${PRICE.single.monthly}/month), All Apps (₹${PRICE.all.monthly}/month) and Team (₹${PRICE.team.monthly}/seat/month, minimum 2 seats) on the monthly term, with lower per-month prices on annual terms. GST at 18% is added to every price and shown next to it before you buy.`,
        "The price you see on the plan card and at review is the price you are charged. We do not add fees at payment.",
      ] },
      { h: "Billing terms", p: [
        "Monthly: billed every month, no commitment.",
        "Annual, billed monthly: billed every month for 12 months. This is a 12-month commitment (see the cancellation policy for the early-termination fee).",
        "Annual, prepaid: billed once for 12 months, then yearly at the same price until you cancel.",
      ] },
      { h: "Free trials", p: [
        `Every plan can start with a ${TRIAL_DAYS}-day free trial. Nothing is charged during the trial. Before you start we show the trial dates, the date of the first charge and its amount. If you cancel before that date you pay nothing.`,
      ] },
      { h: "Optional add-ons", p: [
        `Stock assets & +1 TB cloud storage costs ₹${STORAGE_PRICE}/month + GST (billed yearly on prepaid plans). It is never added unless you choose it, and you can remove it any time.`,
      ] },
      { h: "Changing plans", p: ["You can switch plan or billing term from Account → Manage plan. The new plan and price start on your next billing date, and we show the new amount before you confirm."] },
    ],
  },
  cancellation: {
    title: "Cancellation & refunds",
    intro: "You can cancel any plan online. It takes two clicks from your account page: Cancel plan, then confirm. Giving a reason is optional.",
    sections: [
      { h: "How to cancel", p: ["Go to Account and select Cancel plan. The next screen tells you when access ends and whether a refund or fee applies, then select Cancel plan again to confirm. You can also choose Keep plan to go back."] },
      { h: `Within ${REFUND_WINDOW_DAYS} days`, p: [`If you cancel within ${REFUND_WINDOW_DAYS} days of your first payment, on any term, you get a full refund to your original payment method within 5–7 working days and access ends on the day you cancel.`] },
      { h: "Monthly", p: ["No commitment and no fee. Your plan stops renewing, you keep access until the end of the month you've already paid for, and there is no refund for that month."] },
      { h: "Annual, billed monthly", p: ["After the first 14 days, cancelling ends the commitment early. We charge a one-time early-termination fee of 50% of the monthly payments left in your 12-month term, and show the exact amount on the cancel screen before you confirm. You keep access until the end of the month you've paid for."] },
      { h: "Annual, prepaid", p: ["After the first 14 days there is no refund and no fee. Your plan stops renewing and you keep access until the end of the year you've paid for."] },
      { h: "Free trials", p: ["Cancel any time before the first charge date shown at sign-up and you are not charged."] },
    ],
  },
  privacy: {
    title: "Privacy",
    intro: "This sandbox stores nothing about you on a server. Your choices are kept in your browser's session storage and are cleared when you close the tab or add ?reset=1 to any address.",
    sections: [
      { h: "What we collect", p: ["In this sandbox: nothing. The account is a shared demo profile and payment fields are never sent or saved."] },
      { h: "Marketing email", p: ["We only send tutorials, product news and offers if you tick the box at review. It is unticked unless you tick it, and you can unsubscribe at any time."] },
      { h: "Cloud storage", p: ["Prism Cloud files are stored in Indian data centres (Mumbai and Chennai)."] },
    ],
  },
  help: {
    title: "Help centre",
    intro: "Quick answers to the questions we hear most.",
    sections: [
      { h: "Start a free trial", p: ["Open Pricing, choose a billing term, then select Start 14-day free trial on a plan. Continue as the demo user, review your plan and add a payment method. Nothing is charged until the date shown."] },
      { h: "Cancel a plan", p: ["Account → Cancel plan → Cancel plan. See the cancellation & refunds policy for what happens to your money."] },
      { h: "Switch plan or billing term", p: ["Account → Manage plan. Pick the new plan and term, then Switch plan. It applies from your next billing date."] },
      { h: "Contact us", p: ["Email help@prismstudio.in (fictional) or call 1800-555-0147 (fictional), Monday to Saturday, 9:00–19:00 IST."] },
    ],
  },
  about: {
    title: "About Prism Studio",
    intro: "Prism Studio makes creative software for photographers, designers, editors and type lovers. We started in Bengaluru in 2014 with one photo app and now make six.",
    sections: [
      { h: "Careers", id: "careers", p: ["We're hiring engineers, designers and support specialists in Bengaluru and Pune. (This is a fictional company; there are no real openings.)"] },
      { h: "Press", id: "press", p: ["For press enquiries, write to press@prismstudio.in (fictional)."] },
      { h: "Community", id: "community", p: ["Join creator livestreams every Thursday and the community forum for tutorials, critiques and feature requests. Find us as @prismstudio.in."] },
    ],
  },
};

export default async function Policy({ params }: { params: Promise<{ variant: string; slug: string }> }) {
  const { variant, slug } = await params;
  const doc = POLICIES[slug];
  if (!doc) notFound();
  return (
    <main data-riptide-step="policies" className="ps-wrap grid gap-10 py-10 lg:grid-cols-[220px_1fr]">
      <nav aria-label="Policies" className="flex flex-col gap-2 text-sm">
        {Object.entries(POLICIES).map(([k, v]) => (
          <Link key={k} href={`/${variant}/policies/${k}`} className={k === slug ? "font-bold" : "text-muted hover:text-fg"} aria-current={k === slug ? "page" : undefined}>{v.title}</Link>
        ))}
      </nav>
      <article className="ps-prose max-w-3xl">
        <p className="ps-eyebrow">{UPDATED}</p>
        <h1 className="mt-2 text-4xl font-extrabold">{doc.title}</h1>
        <p className="mt-4 text-lg text-muted">{doc.intro}</p>
        {doc.sections.map((s) => (
          <section key={s.h} id={s.id} className="scroll-mt-24">
            <h2>{s.h}</h2>
            {s.p.map((t) => <p key={t}>{t}</p>)}
          </section>
        ))}
      </article>
    </main>
  );
}
