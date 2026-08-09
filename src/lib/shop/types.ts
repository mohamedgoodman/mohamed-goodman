/**
 * Domain types for the storefront.
 *
 * These are deliberately source-agnostic: the mock file, a Shopify adapter or
 * a REST API all have to produce exactly these shapes. Nothing in the UI
 * imports from `data/products.ts` directly — it goes through `@/lib/shop`.
 */

/** Money is stored as an integer number of MAD centimes-free dirhams. */
export type Price = number;

export type Badge = "new" | "essential" | "last-pieces" | "sale";

export interface ProductImage {
  /** Absolute or app-relative URL. Placeholders come from picsum.photos. */
  url: string;
  /** Required — every image on the site must be described. */
  alt: string;
  width: number;
  height: number;
  /** Which colour this shot belongs to; undefined = shared/hero shot. */
  colorId?: string;
}

export interface ProductColor {
  id: string;
  /** Display name, already localised at the data layer for now. */
  name: string;
  /** CSS colour for the swatch. */
  swatch: string;
  /** Optional second swatch colour for two-tone / patterned fabrics. */
  swatchSecondary?: string;
}

export interface ProductSize {
  /** Canonical size code, e.g. "M", "42", "30". */
  id: string;
  label: string;
  /** EU equivalent shown in the size guide. */
  eu?: string;
  /** Key body measurement in cm, shown in the size guide. */
  cm?: string;
}

export interface ProductVariant {
  id: string;
  colorId: string;
  sizeId: string;
  price: Price;
  /** Strikethrough reference price when the variant is discounted. */
  compareAtPrice?: Price;
  available: boolean;
  /** Drives the "last pieces" badge. */
  stock: number;
  sku: string;
}

export interface Product {
  id: string;
  slug: string;
  /** Customer-facing reference, used in the WhatsApp pre-filled message. */
  reference: string;
  name: string;
  subtitle?: string;
  description: string;
  fabricAndCare: string;
  price: Price;
  compareAtPrice?: Price;
  currency: "MAD";
  collections: string[];
  category: ProductCategory;
  badges: Badge[];
  colors: ProductColor[];
  sizes: ProductSize[];
  variants: ProductVariant[];
  images: ProductImage[];
  rating: { value: number; count: number };
  /** Slugs of products shown in "Complete the look". */
  relatedSlugs: string[];
  createdAt: string;
}

export type ProductCategory =
  "clothing" | "tailoring" | "shoes" | "accessories";

export interface Collection {
  handle: string;
  title: string;
  description: string;
  image: ProductImage;
}

/* ── Query surface ───────────────────────────────────────────────────────── */

export type SortKey =
  "featured" | "newest" | "price-asc" | "price-desc" | "rating";

export interface ProductQuery {
  collection?: string;
  category?: ProductCategory;
  colors?: string[];
  sizes?: string[];
  minPrice?: Price;
  maxPrice?: Price;
  /** Only products with at least one available variant. */
  inStockOnly?: boolean;
  badges?: Badge[];
  search?: string;
  sort?: SortKey;
  limit?: number;
  offset?: number;
}

export interface ProductList {
  items: Product[];
  total: number;
}
