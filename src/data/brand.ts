/** Single place for brand-level constants: name, contact, store, socials. */
export const brand = {
  name: "EDEN HOUSE",
  wordmark: "EDEN HOUSE",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://edenhouse.ma",

  /** International format, digits only — used to build wa.me links. */
  whatsapp: "212600000000",
  /** Dialable form for `tel:` links. */
  phone: "+212600000000",
  /** How the number is written on screen, grouped the way it's read aloud. */
  phoneDisplay: "06 00 00 00 00",
  email: "contact@edenhouse.ma",

  /** Physical store — shown in the footer with a map link. */
  store: {
    line1: "12, rue Ibn Batouta",
    district: "Gauthier",
    city: "Casablanca",
    hours: "10:00 – 20:00",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=12+rue+Ibn+Batouta+Gauthier+Casablanca",
  },

  social: {
    instagram: "https://instagram.com/",
    tiktok: "https://tiktok.com/",
    facebook: "https://facebook.com/",
    pinterest: "https://pinterest.com/",
  },
} as const;
