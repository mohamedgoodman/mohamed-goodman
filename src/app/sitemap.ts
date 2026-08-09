import type { MetadataRoute } from "next";

import { brand } from "@/data/brand";
import { defaultLocale, locales } from "@/i18n/routing";
import { getCollections, getProductSlugs } from "@/lib/shop";

/** Locale-aware URL: French (the default) has no prefix. */
function url(locale: string, path = "") {
  const prefix = locale === defaultLocale ? "" : `/${locale}`;
  return `${brand.url}${prefix}${path}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slugs, collections] = await Promise.all([
    getProductSlugs(),
    getCollections(),
  ]);

  const paths = [
    "",
    ...collections.map((c) => `/collections/${c.handle}`),
    ...slugs.map((slug) => `/products/${slug}`),
    "/pages/about",
    "/pages/size-guide",
    "/pages/shipping",
    "/pages/returns",
  ];

  return paths.flatMap((path) =>
    locales.map((locale) => ({
      url: url(locale, path),
      lastModified: new Date(),
      changeFrequency: path === "" ? ("daily" as const) : ("weekly" as const),
      priority: path === "" ? 1 : 0.7,
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, url(l, path)])),
      },
    })),
  );
}
