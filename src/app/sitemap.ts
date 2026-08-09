import type { MetadataRoute } from "next";

import { brand } from "@/config/shop";
import { defaultLocale, locales } from "@/i18n/routing";
import { getPopulatedCollections, getProductSlugs } from "@/lib/shop";

/** Locale-aware URL: French (the default) has no prefix. */
function url(locale: string, path = "") {
  const prefix = locale === defaultLocale ? "" : `/${locale}`;
  return `${brand.url}${prefix}${path}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slugs, collections] = await Promise.all([
    getProductSlugs(),
    // Only categories that hold stock. Submitting an empty category to a
    // search engine earns a thin-content page in the index, and it is the
    // first thing a shopper arriving from Google would bounce off.
    getPopulatedCollections(),
  ]);

  // Every entry below must correspond to a route that exists. /pages/about,
  // /pages/shipping and /pages/returns were listed here before they were
  // built, so the sitemap was advertising three 404s.
  const paths = [
    "",
    ...collections.map((handle) => `/collections/${handle}`),
    ...slugs.map((slug) => `/products/${slug}`),
    "/pages/size-guide",
    "/orders/track",
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
