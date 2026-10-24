"use client";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";
import { useRiptide } from "@riptide/core";

type Doc = { title: string; updated: string; sections: [string, string[]][] };
const DOCS: Record<string, Doc> = {
  terms: {
    title: "Terms of use", updated: "1 Oct 2026",
    sections: [
      ["1. The service", ["Reelbox Media Pvt. Ltd. (\"Reelbox\", fictional) provides streaming of films and series to members in India. A membership lets you watch on the number of screens your plan allows."]],
      ["2. Plans and prices", ["We offer four monthly plans: Mobile, Basic, Standard and Premium. Each plan page states the video quality, the number of screens you can watch on at once, the devices supported and the monthly price.", "Prices are shown before 18% GST, with the GST amount and the total shown next to every price. There are no other mandatory fees."]],
      ["3. Billing", ["Your membership starts on the day you pay and renews every month on the same date, at the price shown when you signed up, until you cancel. There is no free trial and no minimum term.", "Optional add-ons, such as an extra member slot, are never added unless you choose them, and are billed with your plan."]],
      ["4. Changing plans", ["You can switch plans from Account at any time. The new plan and price apply from your next billing date. Switching is free."]],
      ["5. Cancelling", ["You can cancel at any time from Account → Cancel membership. See the Cancellation & refunds policy for details."]],
      ["6. Sandbox notice", ["This is a Riptide sandbox. No real payment is taken and no content is streamed."]],
    ],
  },
  cancellation: {
    title: "Cancellation & refunds", updated: "1 Oct 2026",
    sections: [
      ["How to cancel", ["Open Account and choose Cancel membership. On the next page you can tell us why you're leaving (optional) and then confirm with the Cancel membership button. That's it: two steps, no phone call and no retention offer you have to decline."]],
      ["When access ends", ["You keep watching until the end of the billing period you've already paid for. Account shows that date before and after you cancel. You won't be charged again."]],
      ["Refunds", ["We don't refund partial months, because you keep access until the period ends. If you were charged in error (for example, twice for the same month), contact us within 30 days for a full refund of the duplicate charge."]],
      ["Fees", ["There is no cancellation fee and no early-termination charge."]],
      ["Restarting", ["You can restart from Account at any time before or after your access ends."]],
    ],
  },
  privacy: {
    title: "Privacy", updated: "1 Oct 2026",
    sections: [
      ["What we collect", ["Your email address, your plan and add-on choices, and what you watch (so we can show Continue watching). In this sandbox, all of this stays in your browser's session storage and is cleared when you close the tab."]],
      ["Marketing", ["We only email you about new releases and offers if you tick \"Send me new releases and offers by email\" during sign-up. It's unticked by default and you can unsubscribe anytime."]],
      ["Payments", ["Payment details typed on the payment page are never sent or stored in this sandbox. Only the order summary is submitted to a mock processor that stores nothing."]],
      ["Your rights", ["You can ask us to export or delete your data at any time from the Help centre."]],
    ],
  },
  help: {
    title: "Help centre", updated: "1 Oct 2026",
    sections: [
      ["Signing up", ["Pick a plan on the Plans page, enter your email, continue as the demo user (no password or code needed), review your membership and pay. Every price shows GST and the total."]],
      ["Managing your membership", ["Account shows your plan, the next billing date and amount, and lets you switch plans or cancel."]],
      ["Watching", ["Browse by genre, search by title, cast or language, and add titles to My List. Playback isn't available in this sandbox."]],
      ["Contact", ["Write to help@reelbox.example (fictional). We reply within one working day, Monday to Saturday, 9 am to 9 pm IST."]],
    ],
  },
};

export default function Policy({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const doc = DOCS[slug];
  if (!doc) notFound();
  const { base } = useRiptide();
  return (
    <main data-riptide-step="policies" className="rb-wrap rb-page rb-narrow">
      <nav aria-label="Breadcrumb" className="rb-crumbs"><Link href={base}>Home</Link><span aria-hidden>/</span><span aria-current="page">{doc.title}</span></nav>
      <article className="rb-prose">
        <h1 className="rb-h1">{doc.title}</h1>
        <p className="rb-fine">Last updated {doc.updated}</p>
        {doc.sections.map(([h, ps]) => (
          <section key={h}><h2 className="rb-h3">{h}</h2>{ps.map((p) => <p key={p}>{p}</p>)}</section>
        ))}
      </article>
    </main>
  );
}
