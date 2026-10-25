/**
 * Preview scaffolding for Riptide's live preview: renders every page with sample data.
 * Not part of the platform; the auditor is told to ignore riptide-preview.* files.
 */
import { Component, useEffect, useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import "./riptide-preview.css";
import FairBasketApp from "./src/pages/_app";
import Home from "./src/pages/index";
import Search from "./src/pages/search";
import ProductPage from "./src/pages/product/[id]";
import Cart from "./src/pages/cart";
import Checkout from "./src/pages/checkout";
import Payment from "./src/pages/payment";
import Membership from "./src/pages/membership";
import MembershipAccount from "./src/pages/account/membership";
import Privacy from "./src/pages/account/privacy";
import Signup from "./src/pages/signup";
import Returns from "./src/pages/policies/returns";
import Grievance from "./src/pages/policies/grievance";
import Ranking from "./src/pages/policies/ranking";
import PrivacyNotice from "./src/pages/policies/privacy";
import Terms from "./src/pages/policies/terms";
import { Footer } from "./src/components/Footer";
import { PRODUCTS } from "./src/data/products";

// Sandboxed previews have no storage; give the app an in-memory one.
try { window.localStorage.getItem("x"); } catch {
  const mem = new Map<string, string>();
  Object.defineProperty(window, "localStorage", { value: { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, String(v)), removeItem: (k: string) => void mem.delete(k), clear: () => mem.clear() } });
}

const lines = [PRODUCTS[0], PRODUCTS[1]].map((p) => ({ productId: p.id, name: p.name, price: p.price, qty: 1 }));
const selected = { carryBag: false, donation: false };

const PAGES: [string, string, (path: string) => ReactNode][] = [
  ["/", "Home", () => <Home />],
  ["/search", "Search", () => <Search q="tea" />],
  ["/product/olive-1", "Product", (path) => <ProductPage id={PRODUCTS.some((p) => path === `/product/${p.id}`) ? path.slice(9) : "olive-1"} />],
  ["/cart", "Cart", () => <Cart lines={lines} member={false} />],
  ["/checkout", "Checkout", () => <Checkout lines={lines} member={false} selected={selected} />],
  ["/payment", "Payment", () => <Payment lines={lines} member={false} selected={selected} />],
  ["/membership", "FairPass", () => <Membership />],
  ["/account/membership", "Account · membership", () => <MembershipAccount renewsOn="14 Nov 2026" />],
  ["/account/privacy", "Account · privacy", () => <Privacy initial={{}} />],
  ["/signup", "Sign up", () => <Signup />],
  ["/policies/returns", "Returns", () => <Returns />],
  ["/policies/grievance", "Grievance", () => <Grievance />],
  ["/policies/ranking", "Ranking", () => <Ranking />],
  ["/policies/privacy", "Privacy notice", () => <PrivacyNotice />],
  ["/policies/terms", "Terms", () => <Terms />],
];

class Boundary extends Component<{ children: ReactNode }, { error?: string }> {
  state: { error?: string } = {};
  static getDerivedStateFromError(e: Error) { return { error: e.message }; }
  render() { return this.state.error ? <p className="pv-err">This page needs data the preview does not have ({this.state.error}).</p> : this.props.children; }
}

function App() {
  const [path, setPath] = useState("/");
  useEffect(() => {
    // In-app links switch pages inside the preview instead of navigating the frame away.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a");
      const href = a?.getAttribute("href");
      if (!href || !href.startsWith("/")) return;
      e.preventDefault();
      const match = PAGES.find(([p]) => p === href) ?? PAGES.find(([p]) => p !== "/" && href.startsWith(p.split("/").slice(0, 2).join("/")));
      if (match) { setPath(match[0] === "/product/olive-1" ? href : match[0]); window.scrollTo(0, 0); }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  const page = PAGES.find(([p]) => p === path) ?? (path.startsWith("/product/") ? PAGES[2] : PAGES[0]);
  return (
    <>
      <header className="pv-bar">
        <b>Preview</b>
        <nav>{PAGES.map(([p, label]) => <button key={p} className={p === path ? "on" : ""} onClick={() => { setPath(p); window.scrollTo(0, 0); }}>{label}</button>)}</nav>
      </header>
      <Boundary key={path}><FairBasketApp Component={() => page[2](path)} pageProps={{}} /></Boundary>
      {path !== "/" && <Footer />}
    </>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
