import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ProductCard } from "@/components/shop/product-card";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { collectionHandles } from "@/data/collection-handles";
import { getCollection, getProducts, pick } from "@/lib/shop";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    collectionHandles.map((handle) => ({ locale, handle })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; handle: string }>;
}): Promise<Metadata> {
  const { locale, handle } = await params;
  const collection = await getCollection(handle);
  if (!collection) return {};
  return {
    title: pick(collection.title, locale),
    description: pick(collection.description, locale),
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ locale: string; handle: string }>;
}) {
  const { locale, handle } = await params;
  setRequestLocale(locale);

  const collection = await getCollection(handle);
  if (!collection) notFound();

  const t = await getTranslations("collection");
  const { items } = await getProducts({ collection: handle });

  return (
    <div className="container-editorial py-(--space-section)">
      <h1 className="text-h1">{pick(collection.title, locale)}</h1>
      <p className="text-muted-foreground mt-3 max-w-prose">
        {pick(collection.description, locale)}
      </p>

      {items.length === 0 ? (
        /* An empty collection is a real state while the catalogue fills up —
           say so and offer a way onward rather than showing a blank grid. */
        <div className="border-border mt-(--space-12) border-t py-(--space-12)">
          <p className="text-md">{t("empty")}</p>
          <Link
            href="/collections/nouveautes"
            className="link-underline mt-4 inline-block text-sm"
          >
            {t("emptyCta")}
          </Link>
        </div>
      ) : (
        <>
          <p className="text-muted-foreground mt-6 text-sm">
            {t("count", { count: items.length })}
          </p>
          <ul className="mt-(--space-8) grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {items.map((product, i) => (
              <li key={product.id}>
                <ProductCard
                  product={product}
                  priority={i < 4}
                  sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 45vw"
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
