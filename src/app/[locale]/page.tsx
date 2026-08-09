import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { HeaderHeroSentinel } from "@/components/layout/header";
import { TrustStrip } from "@/components/shop/trust-strip";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * Home. The remaining homepage sections land in the next step; the hero and
 * trust strip are here because the Arabic pass and the mobile rhythm work
 * needed something real to be measured against.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home.hero");

  return (
    <>
      {/* The hero starts behind the header, so pull it up by the header height. */}
      <section className="relative -mt-(--header-h) lg:-mt-(--header-h-lg)">
        <HeaderHeroSentinel />

        {/* 70vh on phones: a full-height hero costs a whole scroll before any
            product is visible, which is the wrong trade on the device most of
            this traffic arrives on. */}
        <div className="relative flex min-h-[70svh] items-end md:min-h-[82svh]">
          <Image
            src="https://picsum.photos/seed/eh-hero-home/1920/1400"
            alt={t("imageAlt")}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {/* Scrim: keeps the headline legible over any photo. */}
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
                href="/collections/new"
                className="bg-background text-foreground inline-flex h-12 items-center rounded-sm px-8 text-sm font-medium transition-opacity hover:opacity-90"
              >
                {t("cta")}
              </Link>
            </p>
          </div>
        </div>
      </section>

      <TrustStrip />
    </>
  );
}
