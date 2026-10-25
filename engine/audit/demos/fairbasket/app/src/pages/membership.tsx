import { Icon } from "../components/Icons";

/** FairPass: ₹99/month, free delivery. Shown before the user commits. */
export default function Membership() {
  return (
    <main className="narrow">
      <section className="card plan">
        <p className="eyebrow">Membership</p>
        <h1>FairPass</h1>
        <p className="plan-price"><b>₹99</b> / month</p>
        <p>₹99 per month, billed monthly. Free delivery on every order. No minimum commitment.</p>
        <ul className="ticks">
          <li><Icon name="check" /> Free delivery on every order, no minimum basket</li>
          <li><Icon name="check" /> Cancel anytime in Account → FairPass</li>
          <li><Icon name="check" /> Reminder before the first charge and before every renewal</li>
        </ul>
        <div className="terms-box">
          <h2>How billing works</h2>
          <p>Free for the first 14 days. After that ₹99 is charged on the same date each month until you cancel.
             We send a reminder 3 days before the first charge and a pre-debit notification 24 hours before every renewal.</p>
          <p>Pay with UPI AutoPay or a card mandate (max ₹99 per debit). You approve the mandate with your UPI PIN or card OTP. The mandate is valid for 12 months and can be revoked anytime in Account → FairPass.</p>
        </div>
        <div className="choice-row">
          <button className="btn btn-choice">Start 14-day free trial</button>
          <button className="btn btn-choice">Not now</button>
        </div>
      </section>
    </main>
  );
}
