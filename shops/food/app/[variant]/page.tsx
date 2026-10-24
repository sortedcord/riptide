import { HomeView } from "@/components/HomeView";

type SP = { q?: string; offers?: string; cuisine?: string };

export default async function Page({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  return <HomeView key={`${sp.q}|${sp.offers}|${sp.cuisine}`} q={sp.q ?? ""} offers={sp.offers === "1"} cuisine={sp.cuisine ?? null} />;
}
