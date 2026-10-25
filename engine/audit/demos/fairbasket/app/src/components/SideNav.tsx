/** Left-hand navigation for the account area and the policy pages. */
function SideNav({ title, items, current }: { title: string; items: [string, string][]; current: string }) {
  return (
    <nav className="sidenav" aria-label={title}>
      <p className="sidenav-title">{title}</p>
      {items.map(([href, label]) => <a key={href} href={href} className={href === current ? "on" : ""}>{label}</a>)}
    </nav>
  );
}

export const AccountNav = ({ current }: { current: string }) => (
  <SideNav title="Your account" current={current} items={[["/account/membership", "FairPass & autopay"], ["/account/privacy", "Privacy & consents"]]} />
);

export const PolicyNav = ({ current }: { current: string }) => (
  <SideNav title="Policies" current={current} items={[
    ["/policies/returns", "Returns & refunds"], ["/policies/grievance", "Grievance redressal"], ["/policies/ranking", "Search ranking"],
    ["/policies/privacy", "Privacy notice"], ["/policies/terms", "Terms of use"],
  ]} />
);
