/**
 * Preview scaffolding for Riptide's live preview: renders every page with sample data.
 * Not part of the platform; the auditor is told to ignore riptide-preview.* files.
 */
import { Component, useEffect, useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
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
const selected = { protect: true, donation: true };

const PAGES: [string, string, () => ReactNode][] = [
  ["/", "Home", () => <Home />],
  ["/search", "Search", () => <Search q="tea" />],
  ["/product/olive-1", "Product", () => <ProductPage id="olive-1" />],
  ["/cart", "Cart", () => <Cart lines={lines} member={false} />],
  ["/checkout", "Checkout", () => <Checkout lines={lines} member={false} selected={selected} />],
  ["/payment", "Payment", () => <Payment lines={lines} member={false} selected={selected} />],
  ["/membership", "KartPlus", () => <Membership />],
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
      if (match) { setPath(match[0]); window.scrollTo(0, 0); }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  const page = PAGES.find(([p]) => p === path) ?? PAGES[0];
  return (
    <>
      <header className="pv-bar">
        <b>QuickKart</b>
        <nav>{PAGES.map(([p, label]) => <button key={p} className={p === path ? "on" : ""} onClick={() => { setPath(p); window.scrollTo(0, 0); }}>{label}</button>)}</nav>
      </header>
      <div className="pv-page"><Boundary key={path}>{page[2]()}</Boundary></div>
      {path !== "/" && <Footer />}
    </>
  );
}

const css = `
.pv-bar{position:sticky;top:0;z-index:5;display:flex;gap:14px;align-items:center;padding:10px 16px;background:#1b1814;color:#fbf7ef;flex-wrap:wrap}
.pv-bar nav{display:flex;gap:4px;flex-wrap:wrap}.pv-bar button{background:transparent;border:1px solid #4a443a;color:#e9e1d2;border-radius:99px;padding:3px 10px;font-size:12px;cursor:pointer}
.pv-bar button.on{background:#e25c1b;border-color:#e25c1b;color:#fff}
.pv-page{max-width:880px;margin:0 auto;padding:20px 16px}main{display:flex;flex-direction:column;gap:12px}
h1{font-size:26px;margin:4px 0}h2{font-size:18px;margin:14px 0 6px}a{color:#1f5fbf}
.card{display:block;border:1px solid #e3dccd;background:#fff;border-radius:12px;padding:12px 14px;margin:8px 0;text-decoration:none;color:inherit}
.card h3{margin:2px 0 4px;font-size:15px}.muted{color:#7b7466;font-size:12px}.warn,.urgent{color:#b3261e;font-weight:600}
.badge{display:inline-block;font-size:11px;font-weight:700;background:#efe7d8;border-radius:99px;padding:1px 8px;margin-right:6px}
button{font:inherit;padding:7px 14px;border-radius:8px;border:1px solid #8a8274;background:#fff;cursor:pointer;margin-right:6px}
label{display:flex;gap:8px;align-items:center}table{border-collapse:collapse}th,td{text-align:left;padding:4px 10px 4px 0;border-bottom:1px solid #eee5d6;font-size:13px}
blockquote{margin:6px 0;padding:8px 12px;border-left:3px solid #e3dccd;background:#fff}footer{max-width:880px;margin:24px auto;padding:16px;border-top:1px solid #e3dccd;font-size:12px;color:#5b5346}
dialog{position:fixed;inset:auto 16px 16px auto;border:1px solid #e3dccd;border-radius:12px;padding:16px;box-shadow:0 10px 30px rgba(0,0,0,.18)}
.small{font-size:11px;color:#8a8274}.pv-err{color:#7b7466}`;
const style = document.createElement("style");
style.textContent = css;
document.head.appendChild(style);
createRoot(document.getElementById("root")!).render(<App />);
