import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { HeaderHeroSentinel } from "@/components/layout/header";
import { Link } from "@/i18n/navigation";
import { brand } from "@/data/brand";
import { routing, type Locale } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * Placeholder home page — the real homepage sections land in the next step.
 * It carries a full-bleed hero so the header's transparent-over-photography
 * behaviour and the footer can be reviewed in place.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("nav");

  return (
    <>
      {/* The hero starts behind the header, so pull it up by the header height. */}
      <section className="relative -mt-(--header-h) lg:-mt-(--header-h-lg)">
        <HeaderHeroSentinel />

        <div className="relative flex min-h-[86svh] items-end">
          <Image
            src="https://picsum.photos/seed/eh-hero-home/1920/1400"
            alt="Un homme en chemise de lin et pantalon de tailleur, adossé à un mur chaulé."
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {/* Scrim: keeps the wordmark and headline legible over any photo. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/10 to-black/45"
          />

          <div className="container-editorial text-on-image relative pb-(--space-16)">
            <p className="eyebrow text-on-image/80">
              {brand.tagline[locale as Locale] ?? brand.tagline.fr}
            </p>
            <h1 className="text-display mt-4 max-w-[14ch]">{brand.wordmark}</h1>
            <p className="mt-(--space-8)">
              <Link
                href="/collections/new"
                className="bg-background text-foreground inline-flex h-12 items-center rounded-sm px-8 text-sm font-medium transition-opacity hover:opacity-90"
              >
                {t("links.allNew")}
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
