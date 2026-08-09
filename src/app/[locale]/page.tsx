import { setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { brand } from "@/data/brand";
import { routing, type Locale } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * Placeholder home page — replaced by the real homepage sections in a later
 * step. It exists now so the locale shell, fonts and theme are navigable.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="container-narrow flex min-h-[70vh] flex-col justify-center py-(--space-24)">
      <p className="eyebrow">Étape 1 — fondations</p>
      <h1 className="text-display tracking-display mt-4">{brand.wordmark}</h1>
      <p className="text-subtle-foreground mt-6 max-w-prose text-lg">
        {brand.tagline[locale as Locale] ?? brand.tagline.fr}
      </p>
      <p className="mt-(--space-8)">
        <Link
          href="/design/tokens"
          className="bg-brand text-brand-foreground hover:bg-brand-hover inline-flex h-12 items-center rounded-sm px-8 text-sm font-medium transition-colors"
        >
          Design tokens →
        </Link>
      </p>
    </div>
  );
}
