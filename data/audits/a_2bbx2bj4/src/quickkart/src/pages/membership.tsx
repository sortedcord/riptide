import { Icon } from "../components/Icon";

/** KartPlus: ₹99/month, free delivery. Shown before the user commits. */
export default function Membership() {
  return (
    <main className="page narrow">
      <section className="plus-hero">
        <span className="logo-word light">Kart<b>Plus</b></span>
        <h1>KartPlus</h1>
        <p className="plus-price">₹99 per month, billed monthly. Free delivery on every order.</p>
      </section>
      <section className="card">
        <ul className="ticks">
          <li><Icon name="truck" size={18} /> Free delivery on every order</li>
          <li><Icon name="clock" size={18} /> 14-day free trial</li>
          <li><Icon name="upi" size={18} /> UPI AutoPay or card mandate</li>
        </ul>
        <p>Free for the first 14 days. After that ₹99 is charged on the same date each month until you cancel.
           We send a reminder 3 days before the first charge and a pre-debit notification 24 hours before every renewal.</p>
        <p>Pay with UPI AutoPay or a card mandate (max ₹99 per debit, valid 12 months). You approve the mandate with your UPI PIN or card OTP.</p>
        <div className="actions">
          <button className="btn btn-primary btn-lg">Start 14-day free trial</button>
          <button className="btn btn-outline btn-lg">Not now</button>
        </div>
      </section>
    </main>
  );
}
