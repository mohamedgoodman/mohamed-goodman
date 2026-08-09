/**
 * Cart persistence key + read helpers.
 *
 * The cart itself is built in a later step; the header already needs a count,
 * so both sides agree on this one storage key now. Writers must dispatch
 * `CART_CHANGE_EVENT` so open tabs and the header badge update immediately
 * (the native `storage` event only fires in *other* tabs).
 */
export const CART_STORAGE_KEY = "eh:cart";
export const CART_CHANGE_EVENT = "eh:cart-change";

export interface StoredCartLine {
  variantId: string;
  slug: string;
  quantity: number;
}

export function readCartLines(): StoredCartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (line): line is StoredCartLine =>
        typeof line === "object" &&
        line !== null &&
        typeof (line as StoredCartLine).variantId === "string" &&
        typeof (line as StoredCartLine).quantity === "number",
    );
  } catch {
    // Corrupt or unavailable storage must never break the header.
    return [];
  }
}

export function readCartCount(): number {
  return readCartLines().reduce((total, line) => total + line.quantity, 0);
}
