import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ProductCarousel } from "@/components/shop/product-carousel";
import { ProductDetail } from "@/components/shop/product-detail";
import { routing } from "@/i18n/routing";
import {
  getProduct,
  getProductSlugs,
  getRelatedProducts,
  pick,
} from "@/lib/shop";

export async function generateStaticParams() {
  const slugs = await getProductSlugs();
  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  return {
    title: pick(product.name, locale),
    description: pick(product.description, locale),
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const product = await getProduct(slug);
  if (!product) notFound();

  const t = await getTranslations("pdp");
  const tSections = await getTranslations("sections");
  const related = await getRelatedProducts(slug, 8);

  return (
    <>
      <ProductDetail product={product} />
      {related.length > 0 ? (
        <ProductCarousel
          title={t("related")}
          href="/collections/nouveautes"
          linkLabel={tSections("newArrivalsLink")}
          products={related}
        />
      ) : null}
    </>
  );
}
