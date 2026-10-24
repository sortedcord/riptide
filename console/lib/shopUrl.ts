/** Origin (no trailing slash) the browser should use for a shop. Shared by server pages and client components. */
export function shopOrigin(base: string, port: number, fallbackHost: string): string {
  if (!base) return fallbackHost ? `${fallbackHost.replace(/:\d+$/, "")}:${port}` : "";
  if (base.includes("{port}")) return base.replaceAll("{port}", String(port));
  try {
    const u = new URL(base);
    u.port = String(port);
    return u.toString().replace(/\/+$/, "");
  } catch {
    return "";
  }
}
