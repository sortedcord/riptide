"use client";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";
import { cn, formatINR, useRiptide } from "@riptide/core";
import { ADDONS, FARES, FARE_KEYS, RATES, SEAT_BANDS } from "@/lib/air";

type Policy = { title: string; updated: string; sections: [string, string[]][] };

const fareLines = (k: "change" | "cancel" | "checkin") => FARE_KEYS.map((f) => `${FARES[f].name}: ${FARES[f][k]}.`);

const POLICIES: Record<string, Policy> = {
  baggage: {
    title: "Baggage policy", updated: "1 October 2026",
    sections: [
      ["Cabin baggage", ["Every traveller may carry 1 cabin bag up to 7 kg and 55 × 35 × 25 cm. Plus fares also allow 1 personal item (laptop bag or handbag) up to 3 kg.", "Children (2–11 yrs) have the same allowance as adults."]],
      ["Check-in baggage", [...fareLines("checkin"), "The allowance is per traveller, per flight, for a maximum of one piece up to 32 kg."]],
      ["Extra baggage", [`Prepaid extra baggage is ${formatINR(ADDONS.baggage.price)} per traveller per flight for 10 kg, added on the Add-ons step. It is never added unless you choose it.`, "Excess baggage paid at the airport counter costs ₹550 per kg."]],
      ["Restricted items", ["Power banks and lithium batteries must be carried in the cabin, not in check-in baggage.", "Liquids in cabin baggage are limited to 100 ml containers in one 1-litre clear bag."]],
    ],
  },
  "fare-rules": {
    title: "Fare rules", updated: "1 October 2026",
    sections: [
      ["Fare families", FARE_KEYS.map((f) => `${FARES[f].name}: ${FARES[f].blurb} ${FARES[f].checkin}; ${FARES[f].seats.toLowerCase()}; ${FARES[f].meal.toLowerCase()}.`)],
      ["What every price includes", [
        "The fare shown on each flight in search results is the base fare per traveller.",
        `Taxes & airport charges are GST at 5% of the base fare plus ${formatINR(RATES.airport)} airport charges per traveller per flight.`,
        `A convenience fee of ${formatINR(RATES.convenience)} per traveller per flight applies to every online booking.`,
        "Both are shown in the fare summary from the moment you select a flight, and the total does not change unless you change your flights, fare family, seats or add-ons.",
      ]],
      ["Changes", [...fareLines("change"), "Changes can be made up to 2 hours before departure."]],
      ["Seats", Object.values(SEAT_BANDS).map((b) => `${b.label} (${b.where}): ${b.price ? `${formatINR(b.price)} per seat per flight` : "free"}.`).concat("Seat selection is optional. If you skip it, a free seat is assigned at check-in.")],
      ["Children", ["Children aged 2–11 pay the same fare as adults and have the same baggage allowance. Infants under 2 cannot be booked online in this sandbox."]],
    ],
  },
  cancellation: {
    title: "Cancellation & refunds", updated: "1 October 2026",
    sections: [
      ["Cancellation fees", [...fareLines("cancel"), "Fees are per traveller, per flight and never exceed the base fare paid."]],
      ["What is refunded", ["The base fare minus the cancellation fee, all taxes & airport charges, and any unused paid seats, extra baggage and meals are refunded.", `The convenience fee (${formatINR(RATES.convenience)} per traveller per flight) is not refundable.`, "Travel insurance can be cancelled for a full refund within 15 days of booking if you have not travelled."]],
      ["How to cancel", ["Cancel from My account: choose the trip, review the exact refund on one confirmation screen, then confirm. Bookings made in this sandbox are not stored, so My account shows no trips to cancel.", "Refunds go back to the original payment method within 7 working days."]],
      ["If we cancel or reschedule", ["If Skyline Air cancels a flight or moves it by more than 2 hours, you may choose a free change to another flight or a full refund, including the convenience fee."]],
    ],
  },
  terms: {
    title: "Terms of carriage", updated: "1 October 2026",
    sections: [
      ["About these terms", ["Skyline Air is a fictional airline inside the Riptide sandbox. No real tickets are issued and no payment is taken.", "These terms describe how the booking flow on this site behaves."]],
      ["Booking", ["Your booking is confirmed once payment succeeds. The order summary on the payment page lists every amount you will pay.", "Optional extras (paid seats, extra baggage, meals, insurance) are only added when you choose them."]],
      ["Check-in and boarding", ["Web check-in opens 48 hours and closes 2 hours before departure. Airport check-in closes 45 minutes before departure.", "Boarding gates close 25 minutes before departure. Carry a valid government photo ID."]],
      ["Your rights", ["Fare rules, baggage allowance and cancellation fees are those of the fare family shown at the time of booking.", "Nothing in these terms limits your rights under applicable consumer law."]],
    ],
  },
  privacy: {
    title: "Privacy policy", updated: "1 October 2026",
    sections: [
      ["What we collect", ["Traveller names, contact details and your selections are kept only in your browser's session storage for this tab, so the booking can be completed.", "Payment fields on the payment page are never sent or stored."]],
      ["Marketing", ["We send offers by email only if you tick “Send me Skyline Air offers by email” on the traveller details step. It is unticked by default and you can leave it that way."]],
      ["Sharing", ["We do not share your data with third parties. In this sandbox, nothing leaves your browser except the order summary sent to the mock payment endpoint, which stores nothing."]],
      ["Your choices", ["Closing the tab or adding ?reset=1 to any page clears your session data."]],
    ],
  },
};

export default function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { base } = useRiptide();
  const p = POLICIES[slug];
  if (!p) notFound();
  return (
    <main data-riptide-step="policies" className="sk-page sk-policy">
      <nav aria-label="Breadcrumb" className="sk-crumbs"><Link href={base}>Home</Link> / <span>Policies</span> / <span aria-current="page">{p.title}</span></nav>
      <div className="sk-policy__grid">
        <nav aria-label="Policies" className="sk-policy__nav">
          {Object.entries(POLICIES).map(([k, v]) => (
            <Link key={k} href={`${base}/policies/${k}`} className={cn(k === slug && "is-on")} aria-current={k === slug ? "page" : undefined}>{v.title}</Link>
          ))}
        </nav>
        <article className="sk-card">
          <h1 className="sk-h1">{p.title}</h1>
          <p className="sk-fine">Last updated {p.updated}</p>
          {p.sections.map(([h, paras]) => (
            <section key={h}>
              <h2 className="sk-h3">{h}</h2>
              <ul>{paras.map((t) => <li key={t}>{t}</li>)}</ul>
            </section>
          ))}
        </article>
      </div>
    </main>
  );
}
