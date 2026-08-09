import type { Collection } from "@/lib/shop/types";
import { collectionHandles } from "./collection-handles";

/**
 * Collection metadata. Handles must match `collection-handles.ts`, which is
 * what the importer validates the sheet's `categorie` column against.
 *
 * Images are deliberately absent — the shop's own product photography is the
 * only imagery on the site, and a stock photo of someone else's product is
 * worse than no photo. Collection headers fall back to a plain surface panel
 * until real shots exist.
 */
const entries: Array<{
  handle: string;
  title: [fr: string, ar: string, en: string];
  description: [fr: string, ar: string, en: string];
}> = [
  {
    handle: "nouveautes",
    title: ["Nouveautés", "جديد", "New in"],
    description: [
      "Ce qui vient d'arriver en boutique.",
      "اللي توصل جديد للمحل.",
      "Just landed in store.",
    ],
  },
  {
    handle: "sneakers",
    title: ["Sneakers", "سنيكرز", "Sneakers"],
    description: [
      "Toutes les pointures disponibles, du 39 au 45.",
      "كل القياسات موجودة، من 39 حتى 45.",
      "Every size in stock, 39 to 45.",
    ],
  },
  {
    handle: "t-shirts",
    title: ["T-shirts", "تيشيرتات", "T-shirts"],
    description: [
      "Coton épais, coupe droite.",
      "قطن غليظ، قصة مستقيمة.",
      "Heavy cotton, straight cut.",
    ],
  },
  {
    handle: "hoodies",
    title: ["Hoodies", "هوديز", "Hoodies"],
    description: [
      "Molleton doublé, capuche large.",
      "مبطن من الداخل، وكابوش واسع.",
      "Brushed fleece, roomy hood.",
    ],
  },
  {
    handle: "sweats",
    title: ["Sweats", "سويت شيرت", "Sweatshirts"],
    description: [
      "Col rond, sans capuche.",
      "ياقة دائرية، بلا كابوش.",
      "Crewneck, no hood.",
    ],
  },
  {
    handle: "vestes",
    title: ["Vestes", "جواكيت", "Jackets"],
    description: [
      "Bombers, coupe-vent et vestes d'hiver.",
      "بومبر، كوب فون وجواكيت الشتا.",
      "Bombers, windbreakers and winter jackets.",
    ],
  },
  {
    handle: "survetements",
    title: ["Survêtements", "تراكات", "Tracksuits"],
    description: [
      "Ensembles haut et bas.",
      "أطقم كاملة، فوقاني وتحتاني.",
      "Full top-and-bottom sets.",
    ],
  },
  {
    handle: "pantalons",
    title: ["Pantalons", "سراويل", "Trousers"],
    description: [
      "Joggers, cargos et jeans.",
      "جوغر، كارغو وجينز.",
      "Joggers, cargos and jeans.",
    ],
  },
  {
    handle: "casquettes",
    title: ["Casquettes", "كاسكيطات", "Caps"],
    description: [
      "Snapbacks et casquettes courbées.",
      "سناباك وكاسكيطات معقوفة.",
      "Snapbacks and curved caps.",
    ],
  },
  {
    handle: "sacs",
    title: ["Sacs", "صاكات", "Bags"],
    description: [
      "Sacs à dos et bananes.",
      "صاكات الظهر وبانانات.",
      "Backpacks and cross-body bags.",
    ],
  },
  {
    handle: "promos",
    title: ["Promos", "تخفيضات", "Sale"],
    description: [
      "Prix réduits, dernières pointures.",
      "أثمنة ناقصة، وآخر القياسات.",
      "Reduced, last sizes left.",
    ],
  },
];

export const collections: Collection[] = entries.map(
  ({ handle, title, description }) => ({
    handle,
    title: { fr: title[0], ar: title[1], en: title[2] },
    description: { fr: description[0], ar: description[1], en: description[2] },
  }),
);

/** Guards against a handle existing in one list but not the other. */
const known = new Set(collections.map((c) => c.handle));
for (const handle of collectionHandles) {
  if (!known.has(handle)) {
    throw new Error(`Collection "${handle}" has no metadata in collections.ts`);
  }
}
