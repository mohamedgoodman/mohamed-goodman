/**
 * Domain types for the storefront.
 *
 * These mirror the catalogue spreadsheet, which is the source of truth: one
 * row per product, sizes as a flat list, colours as name+hex. Nothing here is
 * invented by the app — if a field exists it came from a column.
 *
 * `products.generated.ts` is produced from the sheet by
 * `npm run import:catalogue` and must satisfy exactly these shapes.
 */

/** Money is an integer number of dirhams — no centimes anywhere in the store. */
export type Price = number;

/** Every customer-facing string exists in all three locales. */
export interface Localized {
  fr: string;
  ar: string;
  en: string;
}

/** Resolves a localized field, falling back to French. */
export function pick(value: Localized, locale: string): string {
  return value[locale as keyof Localized] || value.fr;
}

/** Badge keys map to a trilingual dictionary in messages (`badges.*`). */
export type BadgeKey =
  "new" | "essential" | "last-pieces" | "sale" | "bestseller";

export interface ProductColor {
  /** Slug of the colour name, stable enough to use as a React key. */
  id: string;
  name: string;
  /** CSS colour for the swatch. */
  hex: string;
}

export interface ProductImage {
  /** `/images/products/…`, or an absolute URL for placeholder photography. */
  src: string;
  /** True when the file was found on disk (or is a remote URL). */
  present: boolean;
}

export interface Product {
  /** The sheet's `ref`. */
  id: string;
  ref: string;
  slug: string;
  /** The sheet's `ordre`; null sorts last. */
  order: number | null;
  /** Collection handle from `categorie`. */
  collection: string;

  name: Localized;
  description: Localized;
  material: Localized;
  care: Localized;

  price: Price;
  /** Only set when strictly greater than `price`. */
  compareAtPrice?: Price;
  currency: "MAD";

  badge?: BadgeKey;
  colors: ProductColor[];
  sizes: string[];
  /** Sizes rendered disabled in the selector. */
  soldOutSizes: string[];
  images: ProductImage[];

  /** Absent when the sheet has no rating — stars are hidden entirely. */
  rating?: { value: number; count: number };
}

/* ── Query surface ───────────────────────────────────────────────────────── */

export type SortKey =
  "featured" | "newest" | "price-asc" | "price-desc" | "rating";

export interface ProductQuery {
  collection?: string;
  colors?: string[];
  sizes?: string[];
  minPrice?: Price;
  maxPrice?: Price;
  /** Only products with at least one size still available. */
  inStockOnly?: boolean;
  badges?: BadgeKey[];
  search?: string;
  sort?: SortKey;
  limit?: number;
  offset?: number;
}

export interface ProductList {
  items: Product[];
  total: number;
}

export interface Collection {
  handle: string;
  title: Localized;
  description: Localized;
  image: { src: string; alt: Localized };
}
