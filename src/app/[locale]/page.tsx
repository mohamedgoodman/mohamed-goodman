import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { HeaderHeroSentinel } from "@/components/layout/header";
import { ProductCarousel } from "@/components/shop/product-carousel";
import { TrustStrip } from "@/components/shop/trust-strip";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getProducts } from "@/lib/shop";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home.hero");
  const tSections = await getTranslations("sections");

  // Both rails come from the same query surface — the carousel takes a list,
  // it doesn't know which collection it's showing.
  const [newArrivals, tailoring] = await Promise.all([
    getProducts({ collection: "nouveautes", limit: 12 }),
    getProducts({ collection: "tailleur", limit: 12 }),
  ]);

  return (
    <>
      {/* The hero starts behind the header, so pull it up by the header height. */}
      <section className="relative -mt-(--header-h) lg:-mt-(--header-h-lg)">
        <HeaderHeroSentinel />

        <div className="relative flex min-h-[70svh] items-end md:min-h-[82svh]">
          <Image
            src="https://picsum.photos/seed/eh-hero-home/1920/1400"
            alt={t("imageAlt")}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/10 to-black/55"
          />

          <div className="container-editorial text-on-image relative pb-(--space-12)">
            <h1 className="text-display max-w-[16ch]">{t("headline")}</h1>
            <p className="text-on-image/85 mt-4 max-w-[42ch] text-lg">
              {t("tagline")}
            </p>
            <p className="mt-(--space-6)">
              <Link
                href="/collections/nouveautes"
                className="bg-background text-foreground inline-flex h-12 items-center rounded-sm px-8 text-sm font-medium transition-opacity hover:opacity-90"
              >
                {t("cta")}
              </Link>
            </p>
          </div>
        </div>
      </section>

      <TrustStrip />

      <ProductCarousel
        title={tSections("newArrivals")}
        href="/collections/nouveautes"
        linkLabel={tSections("newArrivalsLink")}
        products={newArrivals.items}
        viewAllHref="/collections/nouveautes"
      />

      <ProductCarousel
        title={tSections("tailoring")}
        href="/collections/tailleur"
        linkLabel={tSections("tailoringLink")}
        products={tailoring.items}
        viewAllHref="/collections/tailleur"
      />
    </>
  );
}
