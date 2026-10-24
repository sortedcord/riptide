import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { COUPONS, DONATION, PASS_PRICE, PLATFORM_FEE, TIPS } from "@/data/profile";

type Doc = { title: string; intro: string; sections: [string, string[]][] };
const updated = "Last updated 1 October 2026";

const DOCS: Record<string, Doc> = {
  about: {
    title: "About Forkful",
    intro: "Forkful connects you with neighbourhood kitchens and delivery partners across ten Indian cities.",
    sections: [
      ["What we do", ["We list partner restaurants, take your order, and arrange delivery by an independent delivery partner. Restaurants set their menu prices and packaging charges; Forkful sets the delivery and platform fees."]],
      ["How we price", ["Every fee is shown on the restaurant page before you add anything, and again in the bill on your cart. The total only changes when you change your order or choose an optional extra."]],
    ],
  },
  help: {
    title: "Help & FAQs",
    intro: "Answers to the questions we hear most often.",
    sections: [
      ["How do I place an order?", ["Choose a delivery location, pick a restaurant, tap Add on a dish, choose size, add-ons and spice level, then open your cart. Review the bill, continue to checkout, choose an address and continue to payment."]],
      ["What fees will I pay?", [`Item total, the restaurant's delivery fee and packaging charge, a platform fee of ₹${PLATFORM_FEE}, and GST. All of them are shown in the bill from your first cart view.`]],
      ["Do I have to tip?", [`No. The tip selector starts at No tip. If you choose a tip (₹${TIPS.join(", ₹")}), 100% goes to your delivery partner.`]],
      ["Can I order from two restaurants at once?", ["Not in one order. If you add a dish from a different restaurant, we'll tell you first that it replaces your current cart."]],
      ["How do coupons work?", [`One coupon per order. Available codes and their minimum item totals are listed in your cart: ${COUPONS.map((c) => `${c.code} (${c.title})`).join(", ")}.`]],
      ["Do I need to sign in?", ["No. This store uses a demo profile with saved addresses. There is no OTP or email verification."]],
    ],
  },
  terms: {
    title: "Terms of use",
    intro: "These terms apply when you use Forkful to order food. Forkful is a fictional service in a test sandbox; no real orders are placed and no money is taken.",
    sections: [
      ["Orders", ["An order is placed with a single restaurant. Prices on the menu are set by the restaurant and include the restaurant's pricing for any size or add-on you choose."]],
      ["Charges", [`The bill lists: item total, delivery fee (set per restaurant and shown on its page), restaurant packaging, a platform fee of ₹${PLATFORM_FEE}, and GST (5% on food and packaging, 18% on the platform fee). Coupon discounts appear as a separate line. No other charges are added after the cart.`]],
      ["Optional extras", [`Tips, a ₹${DONATION} donation, and Forkful Pass are optional and start switched off. They are only added if you select them, and each appears as its own line in the bill.`]],
      ["Forkful Pass", [`Forkful Pass costs ₹${PASS_PRICE} for one month (30 days), charged once with the order you add it to. It gives free delivery on orders above ₹199 from your next order. It does not renew automatically. If you haven't used any Pass benefit, you can ask for a full refund within 7 days.`]],
      ["Coupons", ["One coupon per order. A coupon applies only when its minimum item total and restaurant conditions are met; if your cart changes and the conditions are no longer met, the discount is removed and the bill shows this."]],
      ["Marketing", ["We only send offers by email if you tick the opt-in at checkout. It is unticked by default and you can opt out at any time."]],
    ],
  },
  refund: {
    title: "Refunds & cancellation",
    intro: "How cancellations and refunds work on Forkful.",
    sections: [
      ["Cancelling an order", ["You can cancel for free until the restaurant accepts your order. You'll get a full refund of everything you paid, including any tip, donation and Pass."]],
      ["After the restaurant accepts", ["Once food is being prepared, we can't cancel the order. If something goes wrong (missing items, wrong items, spillage, or a very late delivery) report it within 24 hours through Help & FAQs and we'll refund the affected items and their share of fees."]],
      ["How refunds are paid", ["Refunds go back to the original payment method within 5–7 working days. We never refund only as credits unless you ask for that."]],
      ["Tips and donations", ["If an order is cancelled, the tip and donation are refunded in full. For delivered orders, tips are passed to the delivery partner and donations to Annapurna Meals Trust."]],
      ["Forkful Pass", ["A Pass you haven't used can be refunded in full within 7 days of purchase. Pass does not auto-renew, so there's nothing to cancel later."]],
    ],
  },
  privacy: {
    title: "Privacy policy",
    intro: "What we collect, why, and what we don't do.",
    sections: [
      ["What this sandbox stores", ["Your cart, chosen address and checkout choices are kept in your browser's session storage for this tab only. They are cleared when you close the tab or add ?reset=1 to any address."]],
      ["Payment details", ["Payment fields on the payment page are never sent or stored. Pressing Pay sends only the order summary (items, fees and total) to our sandbox processor, which returns a reference number and stores nothing."]],
      ["Marketing", ["We email offers only if you tick 'Send me offers and updates by email'. The box is unticked by default."]],
      ["Sharing", ["The restaurant receives your order and delivery partner instructions. We don't sell personal data and don't use third-party advertising trackers."]],
    ],
  },
  delivery: {
    title: "Delivery policy",
    intro: "Where we deliver, how long it takes, and what it costs.",
    sections: [
      ["Areas", ["Forkful delivers in Bengaluru, Mumbai, Delhi, Hyderabad, Chennai, Pune, Kolkata, Ahmedabad, Jaipur and Kochi."]],
      ["Delivery times", ["The time shown on each restaurant (for example 30–40 min) is an estimate from when the restaurant accepts your order. Busy periods and weather can add time; we don't charge extra for delays."]],
      ["Delivery fee", ["Each restaurant has a fixed delivery fee, shown on its card, on its page, and in the bill. There are no surge, rain or late-night fees."]],
      ["Packaging and cutlery", ["Restaurants charge a fixed packaging fee per order, shown on the restaurant page and in the bill. Cutlery is sent only when you ask for it at checkout, and is free."]],
      ["Contactless delivery", ["Add instructions such as 'Leave at the door' at checkout and your delivery partner will follow them."]],
    ],
  },
};

type P = { params: Promise<{ variant: string; slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug } = await params;
  return { title: DOCS[slug]?.title ?? "Policies" };
}

export default async function PolicyPage({ params }: P) {
  const { variant, slug } = await params;
  const doc = DOCS[slug];
  if (!doc) notFound();
  return (
    <main data-riptide-step="policies" className="ff-wrap ff-policy">
      <aside className="ff-policy__nav" aria-label="Policies">
        <ul>
          {Object.entries(DOCS).map(([k, d]) => (
            <li key={k}><Link href={`/${variant}/policies/${k}`} aria-current={k === slug ? "page" : undefined}>{d.title}</Link></li>
          ))}
        </ul>
      </aside>
      <article className="ff-card ff-policy__doc">
        <h1 className="ff-display ff-display--sm">{doc.title}</h1>
        <p className="rt-fine">{updated}</p>
        <p className="ff-lead">{doc.intro}</p>
        {doc.sections.map(([h, ps]) => (
          <section key={h}>
            <h2 className="ff-h3">{h}</h2>
            {ps.map((p) => <p key={p}>{p}</p>)}
          </section>
        ))}
      </article>
    </main>
  );
}
