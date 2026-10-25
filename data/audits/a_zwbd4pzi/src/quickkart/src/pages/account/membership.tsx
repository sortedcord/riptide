/** Account → KartPlus. */
export default function MembershipAccount({ renewsOn }: { renewsOn: string }) {
  return (
    <main>
      <h1>Your KartPlus</h1>
      <p>Active · ₹99/month · renews automatically on {renewsOn}.</p>
      <section>
        <h2>Need help with your membership?</h2>
        <p>To cancel KartPlus, call our membership desk on 1800 266 9090 (Mon–Fri, 10 am – 6 pm). Cancellation requests by email or chat are not accepted.</p>
      </section>
    </main>
  );
}
