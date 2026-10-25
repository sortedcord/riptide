import { useEffect, useState } from "react";
import { Icon } from "./Icon";

/** "Deal ends in" timer: 9–14 minutes from page load, so it is always about to end. */
export function OfferEnds() {
  const [left, setLeft] = useState(() => (9 + Math.floor(Math.random() * 5)) * 60);
  useEffect(() => { const t = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000); return () => clearInterval(t); }, []);
  return <p className="urgent"><Icon name="clock" size={15} /> Hurry! Deal ends in {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}</p>;
}
