import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { Price } from "@/components/ui/price";
import { getCollections, getProducts, pick } from "@/lib/shop";

/**
 * Search results. Intentionally plain for now — the product card built in the
 * collection step will replace this listing, so it shares its data source
 * (`getProducts({ search })`) rather than its markup.
 */
export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { q = "" } = await searchParams;
  const t = await getTranslations("search");
  const query = q.trim();
  const { items } = query
    ? await getProducts({ search: query })
    : { items: [] };

  // When nothing matches, offer the main categories rather than a dead end.
  const allCollections = await getCollections();
  const suggestions = allCollections.filter((c) =>
    ["nouveautes", "sneakers", "t-shirts", "hoodies", "promos"].includes(
      c.handle,
    ),
  );

  return (
    <div className="container-editorial py-(--space-16)">
      <p className="eyebrow">{t("title")}</p>
      <h1 className="text-h2 mt-3">
        {query ? t("resultsFor", { query }) : t("title")}
      </h1>
      <p className="text-muted-foreground mt-3 text-sm">
        {t("count", { count: items.length })}
      </p>

      {query && items.length === 0 ? (
        <div className="mt-(--space-12)">
          <p className="text-md">{t("empty")}</p>
          <p className="text-muted-foreground mt-2 text-sm">{t("emptyHint")}</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {suggestions.map((collection) => (
              <li key={collection.handle}>
                <Link
                  href={`/collections/${collection.handle}`}
                  className="border-foreground hover:bg-foreground hover:text-background inline-flex h-10 items-center rounded-sm border px-4 text-sm transition-colors"
                >
                  {pick(collection.title, locale)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <ul className="mt-(--space-12) grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {items.map((product) => (
            <li key={product.id}>
              <Link href={`/products/${product.slug}`} className="group block">
                <div className="bg-surface-3 aspect-3/4 w-full overflow-hidden rounded-xs" />
                <h2 className="mt-3 font-sans text-base">
                  {pick(product.name, locale)}
                </h2>
                <p className="text-muted-foreground text-sm">
                  <Price
                    amount={product.price}
                    compareAt={product.compareAtPrice}
                    locale={locale}
                  />
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
