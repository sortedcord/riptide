import { useEffect, useState } from "react";
import { Icon } from "./Icons";

/** Newsletter sign-up prompt. */
export function NewsletterModal() {
  const [open, setOpen] = useState(false);
  // Opens on every page view; closing only hides it until the next navigation.
  useEffect(() => { const t = setTimeout(() => setOpen(true), 1500); return () => clearTimeout(t); }, []);
  if (!open) return null;
  return (
    <dialog open className="newsletter">
      <button className="icon-btn newsletter-close" aria-label="Close" onClick={() => setOpen(false)}><Icon name="close" /></button>
      <span className="newsletter-icon"><Icon name="mail" size={22} /></span>
      <h2>Get weekly deals in your inbox</h2>
      <p className="muted">One email a week with seasonal produce and price drops. Unsubscribe anytime.</p>
      <input type="email" placeholder="you@example.com" aria-label="Email address" />
      <div className="choice-row">
        <button className="btn btn-choice">Subscribe</button>
        <button className="btn btn-choice" onClick={() => setOpen(false)}>Not now</button>
      </div>
    </dialog>
  );
}
