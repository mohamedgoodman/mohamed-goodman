import type { Collection } from "@/lib/shop/types";
import { collectionHandles } from "./collection-handles";

const IMG = (seed: string) => `https://picsum.photos/seed/${seed}/1600/900`;

/**
 * Collection metadata. The handles here must match `collection-handles.ts`,
 * which is what the catalogue importer validates the `categorie` column
 * against — so a typo in the sheet fails the import rather than producing a
 * collection page nobody can reach.
 */
const entries: Array<{
  handle: string;
  title: [fr: string, ar: string, en: string];
  description: [fr: string, ar: string, en: string];
}> = [
  {
    handle: "nouveautes",
    title: ["Nouveautés", "جديد", "New arrivals"],
    description: [
      "Les dernières pièces entrées en maison.",
      "آخر القطع اللي دخلات للدار.",
      "The latest pieces to arrive.",
    ],
  },
  {
    handle: "vetements",
    title: ["Vêtements", "ملابس", "Clothing"],
    description: [
      "Chemises, mailles, pantalons et vestes du quotidien.",
      "قمصان، تريكو، سراويل وجواكيت ديال كل نهار.",
      "Shirts, knitwear, trousers and jackets for every day.",
    ],
  },
  {
    handle: "chemises",
    title: ["Chemises", "قمصان", "Shirts"],
    description: [
      "Oxford, lin et popeline, coupées droites.",
      "أكسفورد، كتان وبوبلين، مقصوصة مستقيمة.",
      "Oxford, linen and poplin, cut straight.",
    ],
  },
  {
    handle: "mailles",
    title: ["Mailles", "تريكو", "Knitwear"],
    description: [
      "Mérinos, coton peigné et cachemire.",
      "ميرينو، قطن ممشط وكشمير.",
      "Merino, combed cotton and cashmere.",
    ],
  },
  {
    handle: "polos",
    title: ["Polos", "بولو", "Polos"],
    description: [
      "Maille piquée et col italien.",
      "تريكو مثقب وياقة إيطالية.",
      "Piqué knit and an Italian collar.",
    ],
  },
  {
    handle: "pantalons",
    title: ["Pantalons", "سراويل", "Trousers"],
    description: [
      "Chinos et pantalons de tailleur.",
      "شينو وسراويل البدلة.",
      "Chinos and tailored trousers.",
    ],
  },
  {
    handle: "shorts",
    title: ["Shorts", "شورت", "Shorts"],
    description: [
      "Lin et coton, pour les mois chauds.",
      "كتان وقطن، لشهور الحر.",
      "Linen and cotton, for the warm months.",
    ],
  },
  {
    handle: "vestes",
    title: ["Vestes", "جواكيت", "Outerwear"],
    description: [
      "Blousons et manteaux pour l'entre-saison.",
      "جواكيت ومعاطف لبين الفصول.",
      "Blousons and coats for the in-between months.",
    ],
  },
  {
    handle: "tailleur",
    title: ["Tailleur", "بدلات", "Tailoring"],
    description: [
      "Costumes, blazers et pantalons de ville.",
      "بدلات، بليزر وسراويل رسمية.",
      "Suits, blazers and city trousers.",
    ],
  },
  {
    handle: "costumes",
    title: ["Costumes", "بدلات", "Suits"],
    description: [
      "Deux et trois pièces, coupés pour être portés souvent.",
      "جوج ولا تلاتة ديال القطع، مقصوصة باش تتلبس بزاف.",
      "Two and three piece, cut to be worn often.",
    ],
  },
  {
    handle: "blazers",
    title: ["Blazers", "بليزر", "Blazers"],
    description: [
      "Déconstruits et doublés, du bureau au dîner.",
      "بلا بنية ولا مبطنة، من الخدمة حتى للعشا.",
      "Deconstructed and lined, desk to dinner.",
    ],
  },
  {
    handle: "chaussures",
    title: ["Chaussures", "أحذية", "Shoes"],
    description: [
      "Derbies, mocassins et bottes en cuir pleine fleur.",
      "دربي، موكاسان وبوط بالجلد الكامل.",
      "Derbies, loafers and boots in full-grain leather.",
    ],
  },
  {
    handle: "mocassins",
    title: ["Mocassins", "موكاسان", "Loafers"],
    description: [
      "Cuir souple, montés pour l'été.",
      "جلد لين، مركب للصيف.",
      "Soft leather, built for summer.",
    ],
  },
  {
    handle: "bottes",
    title: ["Bottes", "بوط", "Boots"],
    description: [
      "Chelsea et boots de ville.",
      "تشيلسي وبوط ديال المدينة.",
      "Chelsea and city boots.",
    ],
  },
  {
    handle: "accessoires",
    title: ["Accessoires", "إكسسوارات", "Accessories"],
    description: [
      "Cuir, soie et laine — les détails qui tiennent une tenue.",
      "جلد، حرير وصوف — التفاصيل اللي كتشد اللبسة.",
      "Leather, silk and wool — the details that hold an outfit.",
    ],
  },
  {
    handle: "ceintures",
    title: ["Ceintures", "أحزمة", "Belts"],
    description: [
      "Cuir tanné végétal, boucles laiton.",
      "جلد مدبوغ نباتياً، وبوكلات نحاس.",
      "Vegetable-tanned leather, brass buckles.",
    ],
  },
  {
    handle: "maroquinerie",
    title: ["Petite maroquinerie", "محافظ", "Small leather goods"],
    description: [
      "Portefeuilles et porte-cartes.",
      "محافظ وحاملات الكارطات.",
      "Wallets and card holders.",
    ],
  },
  {
    handle: "cravates",
    title: ["Cravates", "كرافات", "Ties"],
    description: [
      "Grenadine et soie tissée.",
      "غرونادين وحرير منسوج.",
      "Grenadine and woven silk.",
    ],
  },
  {
    handle: "echarpes",
    title: ["Écharpes", "شالات", "Scarves"],
    description: [
      "Laine et cachemire tissés main.",
      "صوف وكشمير منسوجين باليد.",
      "Hand-woven wool and cashmere.",
    ],
  },
  {
    handle: "lunettes",
    title: ["Lunettes", "نظارات", "Eyewear"],
    description: [
      "Acétate italien, verres minéraux.",
      "أسيتات إيطالي، وعدسات معدنية.",
      "Italian acetate, mineral lenses.",
    ],
  },
  {
    handle: "meilleures-ventes",
    title: ["Les plus portés", "الأكثر مبيعاً", "Most worn"],
    description: [
      "Les pièces que nos clients rachètent.",
      "القطع اللي كيعاودو شرايوها كليانتنا.",
      "The pieces our customers buy twice.",
    ],
  },
  {
    handle: "fins-de-series",
    title: ["Fins de séries", "تخفيضات", "Sale"],
    description: [
      "Dernières tailles disponibles, à prix réduit.",
      "آخر المقاسات اللي بقاو، بثمن ناقص.",
      "The last sizes left, at a reduced price.",
    ],
  },
];

export const collections: Collection[] = entries.map(
  ({ handle, title, description }) => ({
    handle,
    title: { fr: title[0], ar: title[1], en: title[2] },
    description: { fr: description[0], ar: description[1], en: description[2] },
    image: {
      src: IMG(`eh-col-${handle}`),
      alt: {
        fr: `${title[0]} EDEN HOUSE`,
        ar: `${title[1]} EDEN HOUSE`,
        en: `${title[2]} EDEN HOUSE`,
      },
    },
  }),
);

/** Guards against a collection existing in one list but not the other. */
const known = new Set(collections.map((c) => c.handle));
for (const handle of collectionHandles) {
  if (!known.has(handle)) {
    throw new Error(`Collection "${handle}" has no metadata in collections.ts`);
  }
}
