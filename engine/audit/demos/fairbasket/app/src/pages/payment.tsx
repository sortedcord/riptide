import { priceBreakup } from "../lib/pricing";
import type { CartLine } from "../lib/cart";
import { PriceSummary } from "../components/PriceSummary";
import { Icon, type IconName } from "../components/Icons";

const METHODS: [IconName, string, string][] = [
  ["phone", "UPI", "Any UPI app"], ["card", "Card", "Debit or credit"], ["bank", "Netbanking", "All major banks"], ["cash", "Cash on delivery", "Pay at the door"],
];

export default function Payment({ lines, member, selected }: { lines: CartLine[]; member: boolean; selected: { carryBag: boolean; donation: boolean } }) {
  const { lines: breakup, total } = priceBreakup(lines, selected, member);
  return (
    <main>
      <ol className="steps"><li className="done">Cart</li><li className="done">Address</li><li className="on">Payment</li></ol>
      <h1>Payment</h1>
      <div className="two-col">
        <div className="stack">
          <section className="card">
            <h2>Choose a payment method</h2>
            <div className="methods">
              {METHODS.map(([icon, name, sub]) => (
                <label key={name} className="method"><input type="radio" name="method" /><Icon name={icon} /><span><b>{name}</b><small>{sub}</small></span></label>
              ))}
            </div>
            <p>Methods: UPI, card, netbanking, cash on delivery. No payment method carries an extra fee.</p>
          </section>
          <p className="note-banner"><Icon name="info" /> <span>Recurring payments (FairPass) can be cancelled anytime in Account → FairPass → Manage autopay.</span></p>
        </div>
        <PriceSummary title="Order summary" lines={breakup} total={total} totalLabel="Amount payable">
          <p className="secure"><Icon name="shield" size={15} /> Payments are processed securely.</p>
          <button className="btn btn-primary btn-block">Pay ₹{total}</button>
        </PriceSummary>
      </div>
    </main>
  );
}
