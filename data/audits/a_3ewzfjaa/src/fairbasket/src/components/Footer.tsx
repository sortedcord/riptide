import { COMPANY } from "../config/company";
import { Logo } from "./Icons";

export function Footer() {
  const g = COMPANY.grievanceOfficer;
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div>
          <p className="footer-brand"><Logo /> FairBasket</p>
          <p>{COMPANY.legalName} · CIN {COMPANY.cin} · {COMPANY.address}</p>
        </div>
        <div>
          <h4>Customer care</h4>
          <p>Customer care: {COMPANY.customerCare.phone} · {COMPANY.customerCare.email} ({COMPANY.customerCare.hours})</p>
        </div>
        <div>
          <h4>Grievance Officer</h4>
          <p>Grievance Officer: {g.name}, {g.designation} · {g.email} · {g.phone} · <a href="/policies/grievance">How we handle complaints</a></p>
        </div>
      </div>
      <nav className="wrap footer-links">
        <a href="/policies/returns">Returns &amp; refunds</a> · <a href="/policies/terms">Terms</a> · <a href="/policies/privacy">Privacy notice</a> ·{" "}
        <a href="/policies/ranking">How search ranking works</a> · <a href={COMPANY.selfAudit.href}>Dark-pattern self-audit {COMPANY.selfAudit.year}</a>
      </nav>
    </footer>
  );
}
