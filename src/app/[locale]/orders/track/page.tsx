import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { OrderTrackForm } from "@/components/shop/order-track-form";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tracking" });
  return { title: t("title"), robots: { index: false, follow: false } };
}

export default async function TrackOrderPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("tracking");

  return (
    <div className="container-narrow py-(--space-section)">
      <h1 className="text-h1">{t("title")}</h1>
      <p className="text-muted-foreground mt-3 max-w-prose">{t("intro")}</p>
      <div className="mt-(--space-8)">
        <OrderTrackForm />
      </div>
    </div>
  );
}
