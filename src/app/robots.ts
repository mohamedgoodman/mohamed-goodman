import type { MetadataRoute } from "next";

import { brand } from "@/data/brand";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/design/", "/cart", "/checkout"],
    },
    sitemap: `${brand.url}/sitemap.xml`,
  };
}
