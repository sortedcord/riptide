import { PolicyNav } from "../../components/SideNav";
import { COMPANY } from "../../config/company";

export default function Grievance() {
  const g = COMPANY.grievanceOfficer;
  return (
    <main className="with-side">
      <PolicyNav current="/policies/grievance" />
      <article className="card prose">
        <h1>Grievance redressal</h1>
        <p>Grievance Officer: {g.name} · {g.email} · {g.phone}</p>
        <p>We acknowledge complaints within 48 hours and resolve them within one month. Each complaint gets a ticket number, and you receive a copy of the complaint as recorded. You can also contact the National Consumer Helpline (1915).</p>
      </article>
    </main>
  );
}
