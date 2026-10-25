import { priceBreakup } from "../lib/pricing";
import type { CartLine } from "../lib/cart";
import { Icon } from "../components/Icon";

const METHODS = [["upi", "UPI"], ["card", "Credit / debit card"], ["bank", "Netbanking"], ["cash", "Cash on delivery"]];

export default function Payment({ lines, member, selected }: { lines: CartLine[]; member: boolean; selected: { protect: boolean; donation: boolean } }) {
  const { lines: breakup, total } = priceBreakup(lines, selected, member, "payment");
  return (
    <main className="page split">
      <div className="col-main">
        <ol className="steps"><li className="done">Cart</li><li className="done">Address</li><li className="on">Payment</li></ol>
        <h1>Payment</h1>
        <section className="card">
          <h2>Choose a payment method</h2>
          <div className="methods">
            {METHODS.map(([icon, label], i) => (
              <label key={icon} className="method"><input type="radio" name="method" defaultChecked={i === 0} /><Icon name={icon} size={20} /> {label}</label>
            ))}
          </div>
          <p className="muted">Methods: UPI, card, netbanking, cash on delivery. No payment method carries an extra fee.</p>
        </section>
        <section className="card note-card">
          <p><Icon name="phone" size={16} /> KartPlus autopay: to stop recurring payments, call our membership desk on 1800 266 9090.</p>
        </section>
      </div>
      <aside className="col-side">
        <section className="card bill">
          <h2>Bill details</h2>
          <ul className="breakup">{breakup.map((l) => <li key={l.key}><span>{l.label}</span><span>₹{l.amount}</span></li>)}</ul>
          <p className="bill-total"><b>Pay ₹{total}</b></p>
        </section>
        <div className="paybar">
          <div><b>₹{total}</b><span><Icon name="lock" size={11} /> Secure payment</span></div>
          <button className="btn btn-primary">Pay ₹{total}</button>
        </div>
      </aside>
    </main>
  );
}
