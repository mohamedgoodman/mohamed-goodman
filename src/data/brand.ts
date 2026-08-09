/**
 * Shop configuration.
 *
 * ─────────────────────────────────────────────────────────────────────────
 *  TODO — SET THESE THREE BEFORE LAUNCH.
 *  They are the only placeholders left in the project. Every phone number,
 *  address and Instagram link on the site reads from here, so setting them
 *  once updates the header, the trust strip, the footer, the WhatsApp links
 *  and the store map link together.
 * ─────────────────────────────────────────────────────────────────────────
 */

/** TODO: the shop's real number. International format, digits only. */
const PHONE_E164 = "212600000000";

/** TODO: the real street address in Ben Guerir. */
const ADDRESS = {
  line1: "Adresse à compléter",
  district: "Ben Guerir",
  city: "Ben Guerir",
};

/** TODO: the real Instagram handle, without the @. */
const INSTAGRAM_HANDLE = "edenhouse";

/* ── Derived — nothing below needs editing ───────────────────────────────── */

/** "212600000000" → "06 00 00 00 00" */
function toLocalDisplay(e164: string): string {
  const national = e164.replace(/^212/, "0");
  return national.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
}

export const brand = {
  name: "EDEN HOUSE",
  wordmark: "EDEN HOUSE",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://edenhouse.ma",

  /** wa.me and tel: both build from the same number. */
  whatsapp: PHONE_E164,
  phone: `+${PHONE_E164}`,
  phoneDisplay: toLocalDisplay(PHONE_E164),
  email: "contact@edenhouse.ma",

  store: {
    ...ADDRESS,
    hours: "10:00 – 21:00",
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${ADDRESS.line1}, ${ADDRESS.city}`,
    )}`,
  },

  social: {
    instagram: `https://instagram.com/${INSTAGRAM_HANDLE}`,
    instagramHandle: `@${INSTAGRAM_HANDLE}`,
    tiktok: `https://tiktok.com/@${INSTAGRAM_HANDLE}`,
  },
} as const;
