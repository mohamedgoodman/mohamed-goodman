import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { HowItWorks } from "@/components/shop/how-it-works";
import { ProductCard } from "@/components/shop/product-card";
import { ProductCarousel } from "@/components/shop/product-carousel";
import { TrustStrip } from "@/components/shop/trust-strip";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getProducts } from "@/lib/shop";
import { buildWhatsAppContactLink } from "@/lib/whatsapp";
import { hasHeroImage, shop } from "@/config/shop";
import { cn } from "@/lib/utils";

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
  const tWhatsapp = await getTranslations("whatsapp");

  const [newArrivals, sneakers] = await Promise.all([
    getProducts({ collection: "nouveautes", limit: 12 }),
    getProducts({ collection: "sneakers", limit: 12 }),
  ]);

  const featured = newArrivals.items.slice(0, 3);

  return (
    <>
      {/*
        Typographic hero. There is no product photography yet, and a large
        empty grey box reads as a broken page — so the type carries it, and
        three real product cards sit immediately below the fold instead.

        Set HERO_IMAGE in config/shop.ts to switch this to an image-led hero;
        nothing else needs to change.
      */}
      <section className="border-border border-b">
        <div
          className={cn(
            "container-editorial py-(--space-section)",
            hasHeroImage &&
              "grid items-center gap-(--space-8) lg:grid-cols-2 lg:gap-(--space-16)",
          )}
        >
          <div>
            <h1 className="text-display max-w-[18ch]">{t("headline")}</h1>
            <p className="text-muted-foreground mt-5 max-w-[46ch] text-lg">
              {t("tagline")}
            </p>

            <div className="mt-(--space-8) flex flex-wrap gap-3">
              <Link
                href="/collections/nouveautes"
                className="bg-foreground text-background inline-flex h-12 items-center rounded-sm px-8 text-sm font-medium transition-opacity hover:opacity-90"
              >
                {t("cta")}
              </Link>
              <a
                href={buildWhatsAppContactLink(locale)}
                target="_blank"
                rel="noreferrer noopener"
                className="border-foreground text-foreground hover:bg-foreground hover:text-background inline-flex h-12 items-center rounded-sm border px-8 text-sm font-medium transition-colors"
              >
                {tWhatsapp("order")}
              </a>
            </div>
          </div>

          {hasHeroImage ? (
            <div className="bg-surface relative aspect-4/5 w-full">
              <Image
                src={shop.HERO_IMAGE}
                alt={t("imageAlt")}
                fill
                priority
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
          ) : null}
        </div>

        {/* Three cards above the fold: the fastest proof that this is a shop. */}
        {featured.length > 0 ? (
          <ul className="container-editorial grid grid-cols-2 gap-x-4 gap-y-8 pb-(--space-section) md:grid-cols-3">
            {featured.map((product, i) => (
              <li
                key={product.id}
                className={i === 2 ? "hidden md:block" : undefined}
              >
                <ProductCard
                  product={product}
                  priority={i === 0}
                  sizes="(min-width: 768px) 30vw, 45vw"
                />
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <TrustStrip />

      <ProductCarousel
        title={tSections("newArrivals")}
        href="/collections/nouveautes"
        linkLabel={tSections("newArrivalsLink")}
        products={newArrivals.items}
        viewAllHref="/collections/nouveautes"
        priorityFirst
      />

      <HowItWorks />

      <ProductCarousel
        title={tSections("sneakers")}
        href="/collections/sneakers"
        linkLabel={tSections("sneakersLink")}
        products={sneakers.items}
        viewAllHref="/collections/sneakers"
      />
    </>
  );
}
