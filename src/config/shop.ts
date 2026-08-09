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

export const brand = {
  name: "EDEN HOUSE",
  wordmark: "EDEN HOUSE",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://edenhouse.ma",
  city: "Ben Guerir",
  whatsapp: shop.WHATSAPP,
  phone: shopLinks.tel,
  phoneDisplay: shop.PHONE_DISPLAY,
  hours: shop.HOURS,
} as const;
