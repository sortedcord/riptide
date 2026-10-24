"use client";
import { useRouter } from "next/navigation";
import { SlotButton, useFlow } from "@riptide/core";
import { SignupProgress, useOtt } from "@/components/ui";
import { DEMO } from "@/lib/plans";

/** Mock password step: nothing is typed or stored; the demo account continues in one click. */
export default function SignupPassword() {
  const [s] = useOtt();
  const flow = useFlow("purchase");
  const router = useRouter();
  return (
    <main data-riptide-step="signup-password" className="rb-wrap rb-page rb-narrow">
      <SignupProgress current="signup-password" />
      <form className="rb-panel" onSubmit={(e) => { e.preventDefault(); router.push(flow.next("signup-password")); }}>
        <h1 className="rb-h1">Set up your password</h1>
        <p className="rb-muted">This is a sandbox, so a demo password is already set for <b>{s.email || DEMO.email}</b>. No verification email or code is needed.</p>
        <div className="rt-field">
          <label htmlFor="su-pass">Password (demo, pre-filled)</label>
          <input id="su-pass" type="password" className="rt-input" value="demo-password" readOnly aria-describedby="su-pass-help" />
          <span id="su-pass-help" className="rb-fine">Read-only demo value. It is never sent anywhere.</span>
        </div>
        <SlotButton id="signup-password.form.demo" type="submit" variant="primary" className="rb-wide">Continue as demo user</SlotButton>
      </form>
    </main>
  );
}
