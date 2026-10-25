import { Icon } from "../../components/Icon";

/** Account → KartPlus. */
export default function MembershipAccount({ renewsOn }: { renewsOn: string }) {
  return (
    <main className="page narrow">
      <h1>Your KartPlus</h1>
      <section className="card plus-card">
        <span className="logo-word light">Kart<b>Plus</b></span>
        <p className="pill-row">Active · ₹99/month · renews automatically on {renewsOn}.</p>
      </section>
      <section className="card">
        <h2><Icon name="phone" size={18} /> Need help with your membership?</h2>
        <p>To cancel KartPlus, call our membership desk on 1800 266 9090 (Mon–Fri, 10 am – 6 pm). Cancellation requests by email or chat are not accepted.</p>
      </section>
    </main>
  );
}
