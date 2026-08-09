import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ShirtMeasureTool } from "@/components/shop/shirt-measure-tool";
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
  const t = await getTranslations({ locale, namespace: "sizeGuide" });
  return { title: t("title"), description: t("intro") };
}

export default async function SizeGuidePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("sizeGuide");

  return (
    <div className="container-narrow py-(--space-section)">
      <p className="eyebrow">{t("tabMeasure")}</p>
      <h1 className="text-h1 mt-3">{t("title")}</h1>
      <p className="text-subtle-foreground text-md mt-4 max-w-prose">
        {t("intro")}
      </p>

      <div className="mt-(--space-12)">
        <ShirtMeasureTool />
      </div>
    </div>
  );
}
