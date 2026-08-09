import { getTranslations, setRequestLocale } from "next-intl/server";

import { HowItWorks } from "@/components/shop/how-it-works";
import { ProductCarousel } from "@/components/shop/product-carousel";
import { TrustStrip } from "@/components/shop/trust-strip";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getProducts } from "@/lib/shop";
import { buildWhatsAppContactLink } from "@/lib/whatsapp";

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

  return (
    <>
      {/*
        Product-led hero: copy on the left, one large image slot on the right.
        The slot is deliberately an empty placeholder — a stock photo of some
        other brand's product is worse than no photo, and this shop's own
        photography is the only imagery that belongs here.
      */}
      <section className="border-border border-b">
        <div className="container-editorial grid items-center gap-(--space-8) py-(--space-section) lg:grid-cols-2 lg:gap-(--space-16)">
          <div>
            <h1 className="text-display max-w-[14ch]">{t("headline")}</h1>
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

          {/* TODO: swap for the shop's own photo. */}
          <div className="bg-surface border-border relative aspect-4/5 w-full border sm:aspect-3/2 lg:aspect-4/5">
            <div className="text-muted-foreground absolute inset-0 grid place-content-center gap-1 text-center">
              <p className="text-sm font-medium">{t("imagePlaceholder")}</p>
              <p className="text-xs">{t("imagePlaceholderHint")}</p>
            </div>
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
