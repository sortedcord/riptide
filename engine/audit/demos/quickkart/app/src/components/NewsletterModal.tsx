import { useEffect, useState } from "react";
import { Icon } from "./Icon";

/** Newsletter sign-up prompt, shown once; dismissing it is remembered. */
export function NewsletterModal() {
  const [open, setOpen] = useState(false);
  useEffect(() => { if (!localStorage.getItem("nl-dismissed")) setOpen(true); }, []);
  if (!open) return null;
  const close = () => { localStorage.setItem("nl-dismissed", "1"); setOpen(false); };
  return (
    <dialog open className="nl">
      <button className="nl-x" aria-label="Close" onClick={close}><Icon name="close" size={16} /></button>
      <span className="nl-icon"><Icon name="mail" size={22} /></span>
      <h2>Get weekly deals in your inbox</h2>
      <div className="nl-row">
        <input type="email" placeholder="you@example.com" />
        <button className="btn btn-primary">Subscribe</button>
      </div>
    </dialog>
  );
}
