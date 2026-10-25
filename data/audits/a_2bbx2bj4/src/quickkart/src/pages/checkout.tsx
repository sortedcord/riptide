import { priceBreakup } from "../lib/pricing";
import type { CartLine } from "../lib/cart";
import { Icon } from "../components/Icon";

export default function Checkout({ lines, member, selected }: { lines: CartLine[]; member: boolean; selected: { protect: boolean; donation: boolean } }) {
  const { lines: breakup, total } = priceBreakup(lines, selected, member, "checkout");
  return (
    <main className="page split">
      <div className="col-main">
        <ol className="steps"><li className="done">Cart</li><li className="on">Address</li><li>Payment</li></ol>
        <h1>Checkout</h1>
        <section className="card">
          <h2><Icon name="user" size={18} /> Account</h2>
          <p>Checkout as guest or <a href="/signup">sign in</a>.</p>
        </section>
        <section className="card">
          <h2><Icon name="pin" size={18} /> Delivery address</h2>
          <button className="btn btn-outline">Use saved address</button>
        </section>
      </div>
      <aside className="col-side">
        <section className="card bill">
          <h2>Order summary</h2>
          <ul className="breakup">{breakup.map((l) => <li key={l.key}><span>{l.label}</span><span>₹{l.amount}</span></li>)}</ul>
          <p className="bill-total"><b>Total</b><b>₹{total}</b></p>
        </section>
        <div className="paybar">
          <div><b>₹{total}</b><span>Total</span></div>
          <a href="/payment" className="btn btn-primary">Continue to payment <Icon name="chevron" size={16} /></a>
        </div>
      </aside>
    </main>
  );
}
