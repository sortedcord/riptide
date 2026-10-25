/** KartPlus: ₹99/month, free delivery. Shown before the user commits. */
export default function Membership() {
  return (
    <main>
      <h1>KartPlus</h1>
      <p>₹99 per month, billed monthly. Free delivery on every order.</p>
      <p>Free for the first 14 days. After that ₹99 is charged on the same date each month until you cancel.
         We send a reminder 3 days before the first charge and a pre-debit notification 24 hours before every renewal.</p>
      <p>Pay with UPI AutoPay or a card mandate (max ₹99 per debit, valid 12 months). You approve the mandate with your UPI PIN or card OTP.</p>
      <div>
        <button className="btn">Start 14-day free trial</button>
        <button className="btn">Not now</button>
      </div>
    </main>
  );
}
