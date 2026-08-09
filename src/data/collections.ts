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
];
