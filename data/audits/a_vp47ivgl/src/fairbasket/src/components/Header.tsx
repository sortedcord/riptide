import { Icon, Logo } from "./Icons";

const CATEGORIES = ["Atta, rice & dals", "Oils & ghee", "Tea & coffee", "Snacks", "Household", "Personal care"];

export function Header() {
  return (
    <header className="site-header">
      <div className="topstrip">
        <div className="wrap">
          <span><Icon name="pin" size={14} /> Delivering to Bengaluru 560103</span>
          <span className="hide-sm">Prices include all taxes · Free delivery above ₹499</span>
        </div>
      </div>
      <div className="wrap masthead">
        <a href="/" className="brand"><Logo /> <span>Fair<b>Basket</b></span></a>
        <form className="searchbar" role="search" onSubmit={(e) => e.preventDefault()}>
          <Icon name="search" />
          <input type="search" placeholder="Search atta, dal, oil, tea…" aria-label="Search products" />
        </form>
        <nav className="masthead-links" aria-label="Account">
          <a href="/membership" className="hide-sm">FairPass</a>
          <a href="/account/membership" aria-label="Account"><Icon name="user" /> <span className="hide-sm">Account</span></a>
          <a href="/cart" aria-label="Cart" className="cart-link"><Icon name="cart" /> <span className="hide-sm">Cart</span></a>
        </nav>
      </div>
      <nav className="wrap catnav" aria-label="Categories">
        {CATEGORIES.map((c) => <a key={c} href="/search">{c}</a>)}
      </nav>
    </header>
  );
}
