/**
 * cart.ts
 *
 * Cart domain types for the Comercial Torres POS system.
 *
 * A `CartItem` represents one unique (shoe × size) line-item.
 * Quantity is bounded by `maxStock` so we never oversell.
 *
 * Two price fields:
 *   catalogPrice — the reference price shown in the catalogue (read-only).
 *   unitPrice    — the price the cashier actually charges (may be discounted).
 *
 * Subtotal = unitPrice × quantity.
 */

export interface CartItem {
  /** Matches `Shoe.id` in mockShoes.ts */
  shoeId: string;
  name: string;
  brand: string;
  color: string;
  size: number;
  /** Original catalogue reference price (PEN). Never changes after item is added. */
  catalogPrice: number;
  /** Agreed unit price the cashier charges — may differ from catalogPrice. */
  unitPrice: number;
  quantity: number; // how many pairs the cashier is selling
  maxStock: number; // ceiling for the stepper (= SizeEntry.stock)
}

/** Unique key for a (shoe × size) combination inside the cart Map. */
export function cartKey(shoeId: string, size: number): string {
  return `${shoeId}::${size}`;
}
