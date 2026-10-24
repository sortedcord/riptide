/** Server component: renders setHead jsonLd objects. */
export function JsonLd({ items }: { items: object[] }) {
  return items.map((j, i) => (
    <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(j).replace(/</g, "\\u003c") }} />
  ));
}
