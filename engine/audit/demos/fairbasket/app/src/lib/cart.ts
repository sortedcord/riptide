export type CartLine = { productId: string; name: string; price: number; qty: number };

/** Price comes from the catalogue at the moment of adding and never changes inside the cart. */
export function addToCart(cart: CartLine[], p: { id: string; name: string; price: number }, qty = 1): CartLine[] {
  const hit = cart.find((l) => l.productId === p.id);
  return hit ? cart.map((l) => (l === hit ? { ...l, qty: l.qty + qty } : l)) : [...cart, { productId: p.id, name: p.name, price: p.price, qty }];
}
