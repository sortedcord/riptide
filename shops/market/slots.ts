import { paymentSlots, type SlotDef } from "@riptide/core";

/** Every mutable element in Cartwheel. GET /api/slots serves this. */
export const registry: SlotDef[] = [
  { id: "home.promo.banner", step: "home", kind: "banner", description: "Promo banner area on home (empty in honest)", default: null },
  { id: "home.hero.title", step: "home", kind: "text", description: "Home hero heading", default: "Everything, delivered right." },
  { id: "product.price.current", step: "product", kind: "price", description: "Selling price", default: "{price}" },
  { id: "product.cta.add", step: "product", kind: "button", description: "Add to cart", default: "Add to cart" },
  { id: "cart.fees.delivery", step: "cart", kind: "fee", description: "Delivery fee line", default: "₹49" },
  { id: "cart.fees.platform", step: "cart", kind: "fee", description: "Platform fee line", default: "₹9" },
  { id: "cart.addons.giftwrap", step: "cart", kind: "checkbox", description: "Gift wrap add-on (unticked)", default: false, lineKey: "giftwrap" },
  { id: "cart.summary.total", step: "cart", kind: "total", description: "Cart total", default: "{total}" },
  { id: "cart.cta.checkout", step: "cart", kind: "button", description: "Proceed to payment", default: "Proceed to pay" },
  { id: "cart.summary.panel", step: "cart", kind: "card", description: "Price breakdown container", default: null },
  { id: "footer.links.list", step: "home", kind: "link", description: "Footer help links container", default: null },
  { id: "footer.links.help", step: "home", kind: "link", description: "Footer Help link", default: "Help" },
  { id: "footer.links.terms", step: "home", kind: "link", description: "Footer Terms link", default: "Terms" },
  ...paymentSlots,
];
