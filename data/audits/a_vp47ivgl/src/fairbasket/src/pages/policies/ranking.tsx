import { PolicyNav } from "../../components/SideNav";

export default function Ranking() {
  return (
    <main className="with-side">
      <PolicyNav current="/policies/ranking" />
      <article className="card prose">
        <h1>How search ranking works</h1>
        <p>Results are ordered by how well the product matches your search, then customer rating, then delivery speed. Payments from sellers do not change organic results. Sponsored products appear only in slots labelled "Sponsored".</p>
      </article>
    </main>
  );
}
