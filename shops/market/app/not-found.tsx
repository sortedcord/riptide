import Link from "next/link";

export default function NotFound() {
  return (
    <main data-riptide-step="not-found" style={{ maxWidth: 640, margin: "4rem auto", padding: "0 16px", fontFamily: "var(--rt-font-body)" }}>
      <h1>Page not found</h1>
      <p>We couldn&apos;t find that page.</p>
      <Link href="/honest" className="rt-btn" data-variant="secondary">Go to the store</Link>
    </main>
  );
}
