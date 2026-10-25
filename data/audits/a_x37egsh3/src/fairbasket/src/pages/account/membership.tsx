/** Account → FairPass. Cancel and autopay management are one click away from the account page. */
export default function MembershipAccount({ renewsOn }: { renewsOn: string }) {
  return (
    <main>
      <h1>Your FairPass</h1>
      <p>Active · ₹99/month · renews {renewsOn}. You will get a pre-debit notification 24 hours before the charge.</p>
      <section>
        <h2>Autopay mandate</h2>
        <p>UPI AutoPay · limit ₹99 per debit · created 14 Sep 2026</p>
        <button>Pause autopay</button> <button>Revoke mandate</button>
      </section>
      <section>
        <h2>Cancel FairPass</h2>
        <p>Your benefits continue until {renewsOn}. No further charges.</p>
        <button>Cancel membership</button>
      </section>
    </main>
  );
}
