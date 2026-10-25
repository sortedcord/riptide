import { Icon } from "./Icon";

/** Site header: logo, delivery estimate and address, search, account and cart. */
export function Header() {
  return (
    <header className="qk-header">
      <div className="qk-header-in">
        <a href="/" className="logo" aria-label="QuickKart home">
          <span className="logo-mark"><Icon name="bolt" size={18} /></span>
          <span className="logo-word">quick<b>kart</b></span>
        </a>
        <div className="deliver">
          <span className="eta"><Icon name="clock" size={14} /> Delivery in 2–4 hours</span>
          <span className="addr"><Icon name="pin" size={13} /> Home · HSR Layout, Bengaluru</span>
        </div>
        <a href="/search" className="searchbox"><Icon name="search" size={18} /> Search for atta, dal, tea and more</a>
        <nav className="hnav">
          <a href="/membership" className="plus-link">Kart<b>Plus</b></a>
          <a href="/account/membership" className="hbtn" aria-label="Account"><Icon name="user" size={20} /><span>Account</span></a>
          <a href="/cart" className="cartbtn"><Icon name="cart" size={18} /><span>My cart</span></a>
        </nav>
      </div>
    </header>
  );
}
