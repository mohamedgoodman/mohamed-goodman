import type { Collection } from "@/lib/shop/types";

const IMG = (seed: string) => ({
  url: `https://picsum.photos/seed/${seed}/1600/900`,
  width: 1600,
  height: 900,
});

/** MOCK — replace alongside `products.ts`. Handles drive /collections/[handle]. */
export const collections: Collection[] = [
  {
    handle: "new",
    title: "Nouveautés",
    description:
      "Les dernières pièces entrées en maison, mises à jour chaque semaine.",
    image: { ...IMG("eh-col-new"), alt: "Nouvelle collection EDEN HOUSE" },
  },
  {
    handle: "clothing",
    title: "Vêtements",
    description: "Chemises, mailles, pantalons et vestes du quotidien.",
    image: { ...IMG("eh-col-clothing"), alt: "Vêtements EDEN HOUSE" },
  },
  {
    handle: "tailoring",
    title: "Tailleur",
    description:
      "Costumes, blazers et pantalons de ville, coupés pour être portés souvent.",
    image: { ...IMG("eh-col-tailoring"), alt: "Tailleur EDEN HOUSE" },
  },
  {
    handle: "shoes",
    title: "Chaussures",
    description: "Derbies, mocassins et bottes montés en cuir pleine fleur.",
    image: { ...IMG("eh-col-shoes"), alt: "Chaussures EDEN HOUSE" },
  },
  {
    handle: "accessories",
    title: "Accessoires",
    description: "Cuir, soie et laine — les détails qui tiennent une tenue.",
    image: { ...IMG("eh-col-accessories"), alt: "Accessoires EDEN HOUSE" },
  },
  {
    handle: "sale",
    title: "Fins de séries",
    description: "Dernières tailles disponibles, à prix réduit.",
    image: { ...IMG("eh-col-sale"), alt: "Fins de séries EDEN HOUSE" },
  },
  {
    handle: "shirts",
    title: "Chemises",
    description: "Oxford, lin et popeline, coupées droites.",
    image: { ...IMG("eh-col-shirts"), alt: "Chemises EDEN HOUSE" },
  },
  {
    handle: "trousers",
    title: "Pantalons",
    description: "Chinos et pantalons de tailleur.",
    image: { ...IMG("eh-col-trousers"), alt: "Pantalons EDEN HOUSE" },
  },
  {
    handle: "knitwear",
    title: "Mailles",
    description: "Mérinos, coton peigné et cachemire.",
    image: { ...IMG("eh-col-knitwear"), alt: "Mailles EDEN HOUSE" },
  },
  {
    handle: "outerwear",
    title: "Vestes",
    description: "Blousons et manteaux pour l'entre-saison.",
    image: { ...IMG("eh-col-outerwear"), alt: "Vestes EDEN HOUSE" },
  },
  {
    handle: "best-sellers",
    title: "Les plus portés",
    description: "Les pièces que nos clients rachètent.",
    image: { ...IMG("eh-col-best"), alt: "Les plus portés EDEN HOUSE" },
  },
  {
    handle: "polos",
    title: "Polos",
    description: "Maille piquée et col italien.",
    image: { ...IMG("eh-col-polos"), alt: "Polos EDEN HOUSE" },
  },
  {
    handle: "shorts",
    title: "Shorts",
    description: "Lin et coton, pour les mois chauds.",
    image: { ...IMG("eh-col-shorts"), alt: "Shorts EDEN HOUSE" },
  },
  {
    handle: "suits",
    title: "Costumes",
    description: "Deux et trois pièces, coupés pour être portés souvent.",
    image: { ...IMG("eh-col-suits"), alt: "Costumes EDEN HOUSE" },
  },
  {
    handle: "blazers",
    title: "Blazers",
    description: "Déconstruits et doublés, du bureau au dîner.",
    image: { ...IMG("eh-col-blazers"), alt: "Blazers EDEN HOUSE" },
  },
  {
    handle: "loafers",
    title: "Mocassins",
    description: "Cuir souple, montés pour l'été.",
    image: { ...IMG("eh-col-loafers"), alt: "Mocassins EDEN HOUSE" },
  },
  {
    handle: "boots",
    title: "Bottes",
    description: "Chelsea et boots de ville.",
    image: { ...IMG("eh-col-boots"), alt: "Bottes EDEN HOUSE" },
  },
  {
    handle: "belts",
    title: "Ceintures",
    description: "Cuir tanné végétal, boucles laiton.",
    image: { ...IMG("eh-col-belts"), alt: "Ceintures EDEN HOUSE" },
  },
  {
    handle: "wallets",
    title: "Petite maroquinerie",
    description: "Portefeuilles et porte-cartes.",
    image: { ...IMG("eh-col-wallets"), alt: "Maroquinerie EDEN HOUSE" },
  },
  {
    handle: "ties",
    title: "Cravates",
    description: "Grenadine et soie tissée.",
    image: { ...IMG("eh-col-ties"), alt: "Cravates EDEN HOUSE" },
  },
  {
    handle: "scarves",
    title: "Écharpes",
    description: "Laine et cachemire tissés main.",
    image: { ...IMG("eh-col-scarves"), alt: "Écharpes EDEN HOUSE" },
  },
  {
    handle: "eyewear",
    title: "Lunettes",
    description: "Acétate italien, verres minéraux.",
    image: { ...IMG("eh-col-eyewear"), alt: "Lunettes EDEN HOUSE" },
  },
];
