"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SlotButton, useFlow } from "@riptide/core";
import { SignupProgress, useOtt } from "@/components/ui";
import { DEMO } from "@/lib/plans";

export default function SignupEmail() {
  const [s, set] = useOtt();
  const flow = useFlow("purchase");
  const router = useRouter();
  const [error, setError] = useState("");
  const email = s.email ?? "";

  function next(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError(email ? "That doesn't look like an email address. Check for a missing @ or dot." : "Enter your email, or use the demo email.");
    router.push(flow.next("signup-email"));
  }

  return (
    <main data-riptide-step="signup-email" className="rb-wrap rb-page rb-narrow">
      <SignupProgress current="signup-email" />
      <form className="rb-panel" onSubmit={next} noValidate>
        <h1 className="rb-h1">What&apos;s your email?</h1>
        <p className="rb-muted">We&apos;ll use it to sign you in and send receipts. There&apos;s no verification code in this sandbox.</p>
        <div className="rt-field">
          <label htmlFor="su-email">Email address</label>
          <input id="su-email" type="email" className="rt-input" autoComplete="off" placeholder="you@example.com" value={email}
            onChange={(e) => { set({ email: e.target.value }); setError(""); }} aria-invalid={!!error} aria-describedby={error ? "su-email-err" : undefined} />
          {error && <span id="su-email-err" className="rb-error" role="alert">{error}</span>}
        </div>
        <div className="rb-actions">
          <SlotButton id="signup-email.form.demo" variant="secondary" onClick={() => { set({ email: DEMO.email }); setError(""); }}>Use demo email</SlotButton>
          <SlotButton id="signup-email.form.continue" type="submit" variant="primary">Continue</SlotButton>
        </div>
      </form>
    </main>
  );
}
