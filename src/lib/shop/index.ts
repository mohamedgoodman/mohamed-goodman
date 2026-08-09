import { generatedProducts } from "@/data/products.generated";
import { collections as allCollections } from "@/data/collections";
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
 * Every read the storefront performs goes through this module. The catalogue
 * itself comes from `products.generated.ts`, which is produced from the
 * spreadsheet by `npm run import:catalogue` — there is no hand-written product
 * data anywhere in the app.
 *
 * All functions are async on purpose: swapping the generated array for
 * Shopify's Storefront API or a REST backend is then a change to this file
 * alone, with no call-site churn.
 */

async function source(): Promise<Product[]> {
  return generatedProducts;
}

async function collectionSource(): Promise<Collection[]> {
  return allCollections;
}

/* ── Queries ─────────────────────────────────────────────────────────────── */

/** The sheet's `ordre` is the merchandiser's intent; empty sorts last. */
function byOrder(a: Product, b: Product): number {
  if (a.order == null && b.order == null) return a.ref.localeCompare(b.ref);
  if (a.order == null) return 1;
  if (b.order == null) return -1;
  return a.order - b.order || a.ref.localeCompare(b.ref);
}

const sorters: Record<SortKey, (a: Product, b: Product) => number> = {
  featured: byOrder,
  newest: byOrder,
  "price-asc": (a, b) => a.price - b.price || byOrder(a, b),
  "price-desc": (a, b) => b.price - a.price || byOrder(a, b),
  rating: (a, b) =>
    (b.rating?.value ?? 0) - (a.rating?.value ?? 0) || byOrder(a, b),
};

function availableSizes(product: Product): string[] {
  return product.sizes.filter((size) => !product.soldOutSizes.includes(size));
}

function matches(product: Product, query: ProductQuery): boolean {
  const {
    collection,
    colors,
    sizes,
    minPrice,
    maxPrice,
    inStockOnly,
    badges,
    search,
  } = query;

  if (collection && product.collection !== collection) return false;
  if (colors?.length && !product.colors.some((c) => colors.includes(c.id)))
    return false;
  if (sizes?.length) {
    const available = availableSizes(product);
    if (!sizes.some((size) => available.includes(size))) return false;
  }
  if (minPrice != null && product.price < minPrice) return false;
  if (maxPrice != null && product.price > maxPrice) return false;
  if (inStockOnly && availableSizes(product).length === 0) return false;
  if (badges?.length && (!product.badge || !badges.includes(product.badge)))
    return false;

  if (search) {
    const haystack = [
      product.name.fr,
      product.name.ar,
      product.name.en,
      product.description.fr,
      product.description.en,
      product.ref,
    ]
      .join(" ")
      .toLowerCase();
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

/** "Complete the look" — same collection, then anything else. */
export async function getRelatedProducts(
  slug: string,
  limit = 4,
): Promise<Product[]> {
  const all = await source();
  const product = all.find((p) => p.slug === slug);
  if (!product) return [];

  const sameCollection = all.filter(
    (p) => p.collection === product.collection && p.slug !== slug,
  );
  const rest = all.filter(
    (p) => p.collection !== product.collection && p.slug !== slug,
  );

  return [...sameCollection.sort(byOrder), ...rest.sort(byOrder)].slice(
    0,
    limit,
  );
}

/**
 * Handles that actually contain products right now.
 *
 * The navigation filters against this so a customer is never sent to an empty
 * category page. It's derived from the catalogue rather than configured, so
 * categories disappear and come back on their own as the spreadsheet changes —
 * nothing to remember to switch on when stock arrives.
 */
export async function getPopulatedCollections(): Promise<string[]> {
  const all = await source();
  return [...new Set(all.map((product) => product.collection))];
}

export async function getCollections(): Promise<Collection[]> {
  return collectionSource();
}

export async function getCollection(
  handle: string,
): Promise<Collection | null> {
  return (await collectionSource()).find((c) => c.handle === handle) ?? null;
}

/** Facet counts for the collection page filter rail. */
export async function getFacets(query: ProductQuery = {}) {
  const { items } = await getProducts({
    ...query,
    limit: undefined,
    offset: 0,
  });

  const colors = new Map<
    string,
    { id: string; name: string; hex: string; count: number }
  >();
  const sizes = new Map<string, { id: string; count: number }>();
  let min = Infinity;
  let max = 0;

  for (const product of items) {
    for (const color of product.colors) {
      const entry = colors.get(color.id);
      colors.set(color.id, { ...color, count: (entry?.count ?? 0) + 1 });
    }
    for (const size of availableSizes(product)) {
      const entry = sizes.get(size);
      sizes.set(size, { id: size, count: (entry?.count ?? 0) + 1 });
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
