import { priceBreakup } from "../lib/pricing";
import type { CartLine } from "../lib/cart";
import { PriceSummary } from "../components/PriceSummary";
import { Icon } from "../components/Icons";

export default function Checkout({ lines, member, selected }: { lines: CartLine[]; member: boolean; selected: { carryBag: boolean; donation: boolean } }) {
  const { lines: breakup, total } = priceBreakup(lines, selected, member);
  return (
    <main>
      <ol className="steps"><li className="done">Cart</li><li className="on">Address</li><li>Payment</li></ol>
      <h1>Checkout</h1>
      <div className="two-col">
        <div className="stack">
          <p className="note-banner"><Icon name="info" /> <span>Checkout as guest or <a href="/signup">sign in</a>. An account is not required to order.</span></p>
          <section className="card">
            <h2>Delivery address</h2>
            <div className="address">
              <span className="promise-icon"><Icon name="pin" /></span>
              <p><b>Home</b><br />Flat 3B, Lakeview Residency, HSR Layout Sector 2, Bengaluru 560102</p>
            </div>
            <button className="btn btn-outline">Use saved address</button>
          </section>
          <section className="card">
            <h2>Delivery slot</h2>
            <p className="muted">Today, within about 2 hours of placing the order.</p>
          </section>
        </div>
        <PriceSummary title="Order summary" lines={breakup} total={total} totalLabel="Total payable">
          <a href="/payment" className="btn btn-primary btn-block">Continue to payment</a>
        </PriceSummary>
      </div>
    </main>
  );
}
