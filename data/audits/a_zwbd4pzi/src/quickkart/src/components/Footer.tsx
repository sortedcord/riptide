import { COMPANY } from "../config/company";

export function Footer() {
  const g = COMPANY.grievanceOfficer;
  return (
    <footer>
      <p>{COMPANY.legalName} · CIN {COMPANY.cin} · {COMPANY.address}</p>
      <p>Customer care: {COMPANY.customerCare.phone} · {COMPANY.customerCare.email} ({COMPANY.customerCare.hours})</p>
      <p>Grievance Officer: {g.name}, {g.designation} · {g.email} · {g.phone} · <a href="/policies/grievance">How we handle complaints</a></p>
      <nav>
        <a href="/policies/returns">Returns &amp; refunds</a> · <a href="/policies/terms">Terms</a> · <a href="/policies/privacy">Privacy notice</a> ·{" "}
        <a href="/policies/ranking">How search ranking works</a> · <a href={COMPANY.selfAudit.href}>Dark-pattern self-audit {COMPANY.selfAudit.year}</a>
      </nav>
    </footer>
  );
}
