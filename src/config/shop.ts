/**
 * SHOP CONFIGURATION — the single source for contact details and toggles.
 *
 * Empty string means "not set yet". Components must *hide* the element rather
 * than render an empty link: an Instagram icon that goes nowhere is worse than
 * no icon at all. Use the `has*` helpers below rather than testing the raw
 * strings at each call site.
 */
export const shop = {
  /** wa.me format: country code, no "+", no leading 0. */
  WHATSAPP: "212635691743",
  /** What users read. The tel: link is derived from WHATSAPP. */
  PHONE_DISPLAY: "06 35 69 17 43",

  /** TODO: Instagram profile URL or handle. */
  INSTAGRAM: "",
  /** TODO: TikTok profile URL or handle. */
  TIKTOK: "",
  /** TODO: full street address in Ben Guerir. */
  ADDRESS: "",
  /** TODO: Google Maps share link. */
  MAPS_URL: "",

  HOURS: "10:00 – 21:00",

  /**
   * TODO: set to a path under /public (e.g. "/images/hero.jpg") to make the
   * hero image-led. While it's empty the hero stays typographic — no grey
   * placeholder box, no stock photography.
   */
  HERO_IMAGE: "",
} as const;

/* ── Derived ─────────────────────────────────────────────────────────────── */

export const shopLinks = {
  /** tel: needs the international form. */
  tel: `+${shop.WHATSAPP}`,
  whatsapp: `https://wa.me/${shop.WHATSAPP}`,
  instagram: normaliseSocial(shop.INSTAGRAM, "https://instagram.com/"),
  tiktok: normaliseSocial(shop.TIKTOK, "https://tiktok.com/@"),
} as const;

/** Accepts either a full URL or a bare handle. */
function normaliseSocial(value: string, base: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return base + trimmed.replace(/^@/, "");
}

export const hasInstagram = shopLinks.instagram !== "";
export const hasTiktok = shopLinks.tiktok !== "";
export const hasAddress = shop.ADDRESS.trim() !== "";
export const hasMapsUrl = shop.MAPS_URL.trim() !== "";
export const hasHeroImage = shop.HERO_IMAGE.trim() !== "";

/**
 * The public origin, used for canonicals, the sitemap and robots.txt.
 *
 * Order matters: an explicit SITE_URL wins (set it once a real domain is
 * bought), then the domain Vercel assigns the production deployment, and only
 * then the fallback. It is read on the server alone — never inline it into a
 * client bundle, or the build would freeze one deployment's host into every
 * page.
 */
function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel}`;

  return "https://edenhouse.vercel.app";
}

export const brand = {
  name: "EDEN HOUSE",
  wordmark: "EDEN HOUSE",
  url: siteUrl(),
  city: "Ben Guerir",
  whatsapp: shop.WHATSAPP,
  phone: shopLinks.tel,
  phoneDisplay: shop.PHONE_DISPLAY,
  hours: shop.HOURS,
} as const;
