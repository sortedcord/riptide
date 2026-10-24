"use client";

/** Manifest validation errors land here in production builds; the message is also in the server log. */
export default function ErrorPage({ error }: { error: Error & { digest?: string } }) {
  return (
    <main data-riptide-step="error" style={{ fontFamily: "system-ui", padding: 24 }}>
      <h1>Riptide: this page failed to load</h1>
      <pre style={{ whiteSpace: "pre-wrap" }}>{error.message || `Server error ${error.digest ?? ""} — see the server log.`}</pre>
    </main>
  );
}
