import { AccountNav } from "../../components/SideNav";

/** Account → FairPass. Cancel and autopay management are one click away from the account page. */
export default function MembershipAccount({ renewsOn }: { renewsOn: string }) {
  return (
    <main className="with-side">
      <AccountNav current="/account/membership" />
      <div className="stack">
        <h1>Your FairPass</h1>
        <section className="card status-card">
          <span className="pill pill-ok">Active</span>
          <p>Active · ₹99/month · renews {renewsOn}. You will get a pre-debit notification 24 hours before the charge.</p>
        </section>
        <section className="card">
          <h2>Autopay mandate</h2>
          <p>UPI AutoPay · limit ₹99 per debit · created 14 Sep 2026</p>
          <div className="choice-row">
            <button className="btn btn-choice">Pause autopay</button> <button className="btn btn-choice">Revoke mandate</button>
          </div>
        </section>
        <section className="card">
          <h2>Cancel FairPass</h2>
          <p>Your benefits continue until {renewsOn}. No further charges.</p>
          <button className="btn btn-choice">Cancel membership</button>
        </section>
      </div>
    </main>
  );
}
