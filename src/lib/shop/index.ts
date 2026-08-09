import { products as mockProducts } from "@/data/products";
import { collections as mockCollections } from "@/data/collections";
import type {
  Collection,
  Product,
  ProductList,
  ProductQuery,
  SortKey,
} from "./types";

export * from "./types";

/**
 * THE DATA LAYER.
 *
 * Every read the storefront performs goes through this module. All functions
 * are async on purpose: swapping the mock arrays for Shopify's Storefront API
 * or a REST backend is then a change to this file alone, with no call-site
 * churn anywhere in the UI.
 */

async function source(): Promise<Product[]> {
  return mockProducts;
}

async function collectionSource(): Promise<Collection[]> {
  return mockCollections;
}

/* ── Queries ─────────────────────────────────────────────────────────────── */

const sorters: Record<SortKey, (a: Product, b: Product) => number> = {
  featured: (a, b) =>
    b.rating.value * b.rating.count - a.rating.value * a.rating.count,
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  rating: (a, b) => b.rating.value - a.rating.value,
};

function matches(product: Product, query: ProductQuery): boolean {
  const {
    collection,
    category,
    colors,
    sizes,
    minPrice,
    maxPrice,
    inStockOnly,
    badges,
    search,
  } = query;

  if (collection && !product.collections.includes(collection)) return false;
  if (category && product.category !== category) return false;
  if (colors?.length && !product.colors.some((c) => colors.includes(c.id)))
    return false;
  if (
    sizes?.length &&
    !product.variants.some((v) => sizes.includes(v.sizeId) && v.available)
  )
    return false;
  if (minPrice != null && product.price < minPrice) return false;
  if (maxPrice != null && product.price > maxPrice) return false;
  if (inStockOnly && !product.variants.some((v) => v.available)) return false;
  if (badges?.length && !product.badges.some((b) => badges.includes(b)))
    return false;

  if (search) {
    const haystack =
      `${product.name} ${product.subtitle ?? ""} ${product.description} ${product.reference}`.toLowerCase();
    if (!haystack.includes(search.toLowerCase().trim())) return false;
  }

  return true;
}

/** Primary listing query — used by collection pages, carousels and search. */
export async function getProducts(
  query: ProductQuery = {},
): Promise<ProductList> {
  const all = await source();
  const filtered = all.filter((p) => matches(p, query));
  const sorted = [...filtered].sort(sorters[query.sort ?? "featured"]);

  const offset = query.offset ?? 0;
  const items =
    query.limit == null
      ? sorted.slice(offset)
      : sorted.slice(offset, offset + query.limit);

  return { items, total: filtered.length };
}

/** Single product by slug. Returns null so callers can call notFound(). */
export async function getProduct(slug: string): Promise<Product | null> {
  const all = await source();
  return all.find((p) => p.slug === slug) ?? null;
}

/** Every slug, for generateStaticParams(). */
export async function getProductSlugs(): Promise<string[]> {
  return (await source()).map((p) => p.slug);
}

/** "Complete the look" — falls back to same-category products. */
export async function getRelatedProducts(
  slug: string,
  limit = 4,
): Promise<Product[]> {
  const all = await source();
  const product = all.find((p) => p.slug === slug);
  if (!product) return [];

  const explicit = product.relatedSlugs
    .map((s) => all.find((p) => p.slug === s))
    .filter((p): p is Product => Boolean(p));

  const fallback = all.filter(
    (p) => p.category === product.category && p.slug !== slug,
  );

  const seen = new Set<string>([slug]);
  const out: Product[] = [];
  for (const candidate of [...explicit, ...fallback]) {
    if (seen.has(candidate.slug)) continue;
    seen.add(candidate.slug);
    out.push(candidate);
    if (out.length === limit) break;
  }
  return out;
}

export async function getCollections(): Promise<Collection[]> {
  return collectionSource();
}

export async function getCollection(
  handle: string,
): Promise<Collection | null> {
  return (await collectionSource()).find((c) => c.handle === handle) ?? null;
}

/**
 * Facet counts for the collection page filter rail: only offer filters that
 * would actually return something.
 */
export async function getFacets(query: ProductQuery = {}) {
  const { items } = await getProducts({
    ...query,
    limit: undefined,
    offset: 0,
  });

  const colors = new Map<
    string,
    { id: string; name: string; swatch: string; count: number }
  >();
  const sizes = new Map<string, { id: string; label: string; count: number }>();
  let min = Infinity;
  let max = 0;

  for (const product of items) {
    for (const color of product.colors) {
      const entry = colors.get(color.id);
      colors.set(color.id, {
        id: color.id,
        name: color.name,
        swatch: color.swatch,
        count: (entry?.count ?? 0) + 1,
      });
    }
    for (const size of product.sizes) {
      const available = product.variants.some(
        (v) => v.sizeId === size.id && v.available,
      );
      if (!available) continue;
      const entry = sizes.get(size.id);
      sizes.set(size.id, {
        id: size.id,
        label: size.label,
        count: (entry?.count ?? 0) + 1,
      });
    }
    min = Math.min(min, product.price);
    max = Math.max(max, product.price);
  }

  return {
    colors: [...colors.values()],
    sizes: [...sizes.values()],
    priceRange: { min: items.length ? min : 0, max },
    total: items.length,
  };
}
