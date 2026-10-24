"use client";
import Link from "next/link";
import { useRiptide } from "@riptide/core";
import profile from "@/data/profile.json";

export default function Account() {
  const { base } = useRiptide();
  return (
    <main data-riptide-step="account" className="sk-page sk-narrow">
      <h1 className="sk-h1">My account</h1>
      <section className="sk-card sk-stack">
        <h2 className="sk-h3">{profile.name}</h2>
        <p className="sk-muted">Demo profile · {profile.email} · +91 {profile.phone} · {profile.city}</p>
        <p className="sk-fine">You are signed in as the demo user. No password or verification is needed in this sandbox.</p>
      </section>
      <section className="sk-card sk-stack">
        <h2 className="sk-h3">Saved travellers</h2>
        <ul className="sk-list">
          {profile.travellers.map((t) => (
            <li key={t.id}>{t.title} {t.first} {t.last} · {t.type === "adult" ? "Adult" : `Child, born ${t.dob}`}</li>
          ))}
        </ul>
      </section>
      <section className="sk-card sk-stack">
        <h2 className="sk-h3">My trips</h2>
        <p className="sk-muted">No upcoming trips. Bookings made in this sandbox are not stored.</p>
        <Link href={base} className="rt-btn" data-variant="secondary">Book a flight</Link>
      </section>
    </main>
  );
}
