import { COMPANY } from "../config/company";
import { Icon } from "./Icon";

export function Footer() {
  const g = COMPANY.grievanceOfficer;
  return (
    <footer className="qk-footer">
      <div className="foot-in">
        <div className="foot-brand">
          <span className="logo-word">quick<b>kart</b></span>
          <p>{COMPANY.legalName} · CIN {COMPANY.cin} · {COMPANY.address}</p>
        </div>
        <div className="foot-col">
          <h4>Help</h4>
          <p><Icon name="phone" size={13} /> Customer care: {COMPANY.customerCare.phone} · {COMPANY.customerCare.email} ({COMPANY.customerCare.hours})</p>
          <p><Icon name="shield" size={13} /> Grievance Officer: {g.name}, {g.designation} · {g.email} · {g.phone} · <a href="/policies/grievance">How we handle complaints</a></p>
        </div>
        <nav className="foot-col foot-links">
          <h4>Policies</h4>
          <a href="/policies/returns">Returns &amp; refunds</a> · <a href="/policies/terms">Terms</a> · <a href="/policies/privacy">Privacy notice</a> ·{" "}
          <a href="/policies/ranking">How search ranking works</a> · <a href={COMPANY.selfAudit.href}>Dark-pattern self-audit {COMPANY.selfAudit.year}</a>
        </nav>
      </div>
    </footer>
  );
}
