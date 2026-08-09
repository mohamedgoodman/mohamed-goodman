import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    // Placeholder photography. Swap this host when the real assets land.
    remotePatterns: [{ protocol: "https", hostname: "picsum.photos" }],
    formats: ["image/avif", "image/webp"],
    // Matches the card / gallery widths actually used in the layouts.
    imageSizes: [64, 96, 128, 256, 384],
    deviceSizes: [360, 420, 640, 828, 1080, 1280, 1600, 1920],
  },
};

export default withNextIntl(nextConfig);
