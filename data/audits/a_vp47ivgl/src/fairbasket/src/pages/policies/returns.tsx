import { PolicyNav } from "../../components/SideNav";

export default function Returns() {
  return (
    <main className="with-side">
      <PolicyNav current="/policies/returns" />
      <article className="card prose">
        <h1>Returns, refunds and cancellations</h1>
        <p>Unopened packaged items: return within 7 days for a full refund to the original payment method within 5 working days.</p>
        <p>Fresh produce: report quality issues within 48 hours for a replacement or refund.</p>
        <p>Orders can be cancelled free of charge until they are packed. Warranty, where offered by the manufacturer, is listed on the product page.</p>
      </article>
    </main>
  );
}
