/** Single place for brand-level constants: name, contact, socials, URLs. */
export const brand = {
  name: "EDEN HOUSE",
  wordmark: "EDEN HOUSE",
  tagline: {
    fr: "Vestiaire masculin, fait pour durer.",
    ar: "خزانة رجالية، صُنعت لتدوم.",
    en: "A men's wardrobe, made to last.",
  },
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://edenhouse.ma",
  /** International format, digits only — used to build wa.me links. */
  whatsapp: "212600000000",
  email: "contact@edenhouse.ma",
  phoneDisplay: "+212 6 00 00 00 00",
  social: {
    instagram: "https://instagram.com/",
    tiktok: "https://tiktok.com/",
    facebook: "https://facebook.com/",
    pinterest: "https://pinterest.com/",
  },
} as const;
