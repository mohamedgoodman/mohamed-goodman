import type {
  Badge,
  Product,
  ProductCategory,
  ProductColor,
  ProductSize,
} from "@/lib/shop/types";

/**
 * MOCK CATALOGUE — replace this file with real data.
 *
 * Nothing outside `@/lib/shop` should import from here. Swap the export for a
 * Shopify/API adapter and the rest of the storefront keeps working, as long as
 * the shapes in `@/lib/shop/types` are respected.
 *
 * Images are placeholders from picsum.photos, addressed by a stable seed so a
 * given product always gets the same photo.
 */

const PLACEHOLDER = (seed: string, w = 1200, h = 1600) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

/* ── Shared size runs ────────────────────────────────────────────────────── */

const APPAREL_SIZES: ProductSize[] = [
  { id: "xs", label: "XS", eu: "44", cm: "86-90" },
  { id: "s", label: "S", eu: "46", cm: "90-94" },
  { id: "m", label: "M", eu: "48", cm: "94-98" },
  { id: "l", label: "L", eu: "50", cm: "98-104" },
  { id: "xl", label: "XL", eu: "52", cm: "104-110" },
  { id: "xxl", label: "XXL", eu: "54", cm: "110-116" },
];

const TAILORING_SIZES: ProductSize[] = [
  { id: "46", label: "46", eu: "46", cm: "90" },
  { id: "48", label: "48", eu: "48", cm: "94" },
  { id: "50", label: "50", eu: "50", cm: "98" },
  { id: "52", label: "52", eu: "52", cm: "102" },
  { id: "54", label: "54", eu: "54", cm: "106" },
];

const SHOE_SIZES: ProductSize[] = [
  { id: "39", label: "39", eu: "39", cm: "25.0" },
  { id: "40", label: "40", eu: "40", cm: "25.7" },
  { id: "41", label: "41", eu: "41", cm: "26.3" },
  { id: "42", label: "42", eu: "42", cm: "27.0" },
  { id: "43", label: "43", eu: "43", cm: "27.6" },
  { id: "44", label: "44", eu: "44", cm: "28.3" },
];

const ONE_SIZE: ProductSize[] = [{ id: "os", label: "Taille unique" }];

/* ── Shared colours ──────────────────────────────────────────────────────── */

const C = {
  ecru: { id: "ecru", name: "Écru", swatch: "#E7E0D2" },
  sand: { id: "sand", name: "Sable", swatch: "#CDBFA4" },
  olive: { id: "olive", name: "Olive", swatch: "#4B5540" },
  navy: { id: "navy", name: "Marine", swatch: "#252F45" },
  charcoal: { id: "charcoal", name: "Anthracite", swatch: "#33342F" },
  black: { id: "black", name: "Noir", swatch: "#16160F" },
  terracotta: { id: "terracotta", name: "Terracotta", swatch: "#B4552F" },
  brown: { id: "brown", name: "Havane", swatch: "#6B4A32" },
  stone: { id: "stone", name: "Pierre", swatch: "#B9B3A6" },
  indigo: { id: "indigo", name: "Indigo", swatch: "#2E4260" },
} satisfies Record<string, ProductColor>;

/* ── Terse seed definitions, expanded below ──────────────────────────────── */

interface Seed {
  slug: string;
  name: string;
  subtitle: string;
  price: number;
  compareAtPrice?: number;
  category: ProductCategory;
  collections: string[];
  colors: ProductColor[];
  sizes: ProductSize[];
  badges?: Badge[];
  /** Size ids that are sold out across every colour. */
  soldOut?: string[];
  /** Sizes down to their last few pieces. */
  low?: string[];
  rating: [value: number, count: number];
  description: string;
  fabricAndCare: string;
  related: string[];
  createdAt: string;
}

const SEEDS: Seed[] = [
  {
    slug: "chemise-oxford-atlas",
    name: "Chemise Oxford Atlas",
    subtitle: "Coton oxford lavé",
    price: 450,
    category: "clothing",
    collections: ["new", "clothing", "shirts"],
    colors: [C.ecru, C.indigo, C.olive],
    sizes: APPAREL_SIZES,
    badges: ["new", "essential"],
    low: ["xxl"],
    rating: [4.6, 128],
    description:
      "Une oxford coupée près du corps sans serrer, dans un coton lavé qui tombe déjà comme une chemise portée cent fois. Col boutonné souple, patte de boutonnage étroite, pan arrière légèrement allongé.",
    fabricAndCare:
      "100% coton oxford 140 g/m². Lavage machine à 30°C, séchage à plat, repassage doux.",
    related: [
      "pantalon-chino-medina",
      "veste-suede-tanger",
      "ceinture-cuir-fes",
    ],
    createdAt: "2026-07-28",
  },
  {
    slug: "pantalon-chino-medina",
    name: "Chino Medina",
    subtitle: "Coupe droite, twill de coton",
    price: 590,
    compareAtPrice: 690,
    category: "clothing",
    collections: ["new", "clothing", "trousers", "sale"],
    colors: [C.sand, C.olive, C.navy],
    sizes: APPAREL_SIZES,
    badges: ["sale"],
    soldOut: ["xs"],
    rating: [4.4, 86],
    description:
      "Le chino de tous les jours : jambe droite, taille mi-haute, poches italiennes. Assez net pour le bureau, assez souple pour le reste.",
    fabricAndCare:
      "97% coton, 3% élasthanne. Lavage à 30°C sur l'envers. Ne pas sécher au tambour.",
    related: [
      "chemise-oxford-atlas",
      "polo-maille-sidi",
      "mocassin-cuir-essaouira",
    ],
    createdAt: "2026-07-20",
  },
  {
    slug: "veste-suede-tanger",
    name: "Veste Tanger",
    subtitle: "Croûte de velours, doublure coton",
    price: 2450,
    category: "clothing",
    collections: ["new", "clothing", "outerwear"],
    colors: [C.brown, C.olive],
    sizes: APPAREL_SIZES,
    badges: ["new"],
    low: ["l", "xl"],
    rating: [4.8, 41],
    description:
      "Blouson court en velours de cuir, épaules nettes et taille resserrée par une patte boutonnée. La pièce qui termine une tenue sans la durcir.",
    fabricAndCare:
      "Cuir velours de chèvre, doublure 100% coton. Nettoyage à sec spécialisé cuir uniquement.",
    related: [
      "chemise-oxford-atlas",
      "pull-merinos-rif",
      "botte-chelsea-atlas",
    ],
    createdAt: "2026-07-26",
  },
  {
    slug: "pull-merinos-rif",
    name: "Pull Rif",
    subtitle: "Mérinos extra-fin, col rond",
    price: 780,
    category: "clothing",
    collections: ["new", "clothing", "knitwear"],
    colors: [C.ecru, C.charcoal, C.terracotta],
    sizes: APPAREL_SIZES,
    badges: ["essential"],
    rating: [4.7, 203],
    description:
      "Une maille fine 12 jauge qui se porte seule ou sous une veste sans épaisseur. Bords côtes serrés, col rond net.",
    fabricAndCare:
      "100% laine mérinos extra-fine 19,5 microns. Lavage à la main à froid, séchage à plat.",
    related: [
      "chemise-oxford-atlas",
      "veste-suede-tanger",
      "echarpe-laine-chefchaouen",
    ],
    createdAt: "2026-07-15",
  },
  {
    slug: "polo-maille-sidi",
    name: "Polo Sidi",
    subtitle: "Maille piquée, col italien",
    price: 390,
    category: "clothing",
    collections: ["clothing", "knitwear"],
    colors: [C.ecru, C.navy, C.olive, C.terracotta],
    sizes: APPAREL_SIZES,
    rating: [4.3, 157],
    description:
      "Col italien qui tient ouvert, maille piquée aérée, manches finies par une bordure côtelée. Le polo qui ne fait pas polo de sport.",
    fabricAndCare: "100% coton peigné. Lavage à 30°C, séchage à plat.",
    related: [
      "pantalon-chino-medina",
      "short-lin-agadir",
      "lunettes-acetate-oualidia",
    ],
    createdAt: "2026-06-30",
  },
  {
    slug: "chemise-lin-oualidia",
    name: "Chemise Oualidia",
    subtitle: "Lin lavé, col cubain",
    price: 520,
    category: "clothing",
    collections: ["new", "clothing", "shirts"],
    colors: [C.ecru, C.stone, C.indigo],
    sizes: APPAREL_SIZES,
    badges: ["new"],
    soldOut: ["s"],
    rating: [4.5, 64],
    description:
      "Lin lavé en pièce, col cubain qui reste ouvert, coupe droite et ample. Pensée pour les mois où rien d'autre n'est portable.",
    fabricAndCare:
      "100% lin européen lavé. Lavage à 30°C, le froissé fait partie du tissu.",
    related: [
      "short-lin-agadir",
      "espadrille-toile-taghazout",
      "polo-maille-sidi",
    ],
    createdAt: "2026-07-30",
  },
  {
    slug: "short-lin-agadir",
    name: "Short Agadir",
    subtitle: "Lin-coton, taille élastiquée",
    price: 340,
    compareAtPrice: 420,
    category: "clothing",
    collections: ["clothing", "sale"],
    colors: [C.sand, C.olive],
    sizes: APPAREL_SIZES,
    badges: ["sale", "last-pieces"],
    low: ["m", "l"],
    soldOut: ["xxl"],
    rating: [4.2, 38],
    description:
      "Short de milieu de cuisse, taille élastiquée doublée d'un cordon plat, deux poches latérales profondes.",
    fabricAndCare: "55% lin, 45% coton. Lavage à 30°C.",
    related: [
      "chemise-lin-oualidia",
      "espadrille-toile-taghazout",
      "polo-maille-sidi",
    ],
    createdAt: "2026-06-10",
  },
  {
    slug: "costume-laine-casablanca",
    name: "Costume Casablanca",
    subtitle: "Laine fresco, deux boutons",
    price: 4900,
    category: "tailoring",
    collections: ["tailoring", "new"],
    colors: [C.navy, C.charcoal],
    sizes: TAILORING_SIZES,
    badges: ["new"],
    low: ["50"],
    rating: [4.9, 27],
    description:
      "Deux boutons, revers crantés moyens, épaule napolitaine peu construite. Une laine fresco à armure ouverte qui respire dans la chaleur.",
    fabricAndCare:
      "100% laine fresco 260 g/m². Nettoyage à sec. Brosser après chaque port.",
    related: [
      "chemise-oxford-atlas",
      "cravate-soie-rabat",
      "derby-cuir-meknes",
    ],
    createdAt: "2026-07-22",
  },
  {
    slug: "blazer-deconstruit-rabat",
    name: "Blazer Rabat",
    subtitle: "Déconstruit, laine-lin",
    price: 2890,
    category: "tailoring",
    collections: ["tailoring"],
    colors: [C.olive, C.sand, C.navy],
    sizes: TAILORING_SIZES,
    badges: ["essential"],
    rating: [4.7, 52],
    description:
      "Sans doublure ni entoilage, monté comme une chemise. Il se plie dans un sac et se remet sans marque.",
    fabricAndCare: "62% laine, 38% lin. Nettoyage à sec.",
    related: [
      "pantalon-tailleur-fes",
      "chemise-lin-oualidia",
      "mocassin-cuir-essaouira",
    ],
    createdAt: "2026-07-05",
  },
  {
    slug: "pantalon-tailleur-fes",
    name: "Pantalon Fès",
    subtitle: "Taille haute, pinces simples",
    price: 890,
    category: "tailoring",
    collections: ["tailoring", "trousers"],
    colors: [C.charcoal, C.navy, C.olive],
    sizes: TAILORING_SIZES,
    soldOut: ["54"],
    rating: [4.5, 73],
    description:
      "Taille haute tenue par des pattes de serrage latérales, une pince simple, jambe légèrement fuselée jusqu'à un revers net.",
    fabricAndCare: "100% laine vierge. Nettoyage à sec.",
    related: [
      "blazer-deconstruit-rabat",
      "ceinture-cuir-fes",
      "derby-cuir-meknes",
    ],
    createdAt: "2026-06-25",
  },
  {
    slug: "gilet-laine-meknes",
    name: "Gilet Meknès",
    subtitle: "Laine gratté, cinq boutons",
    price: 990,
    category: "tailoring",
    collections: ["tailoring", "new"],
    colors: [C.charcoal, C.brown],
    sizes: TAILORING_SIZES,
    badges: ["new", "last-pieces"],
    low: ["46", "48"],
    rating: [4.6, 19],
    description:
      "Cinq boutons, dos en cupro ajusté par une martingale. Se porte sur une chemise seule aussi bien que sous le costume.",
    fabricAndCare: "100% laine grattée, dos cupro. Nettoyage à sec.",
    related: [
      "costume-laine-casablanca",
      "chemise-oxford-atlas",
      "cravate-soie-rabat",
    ],
    createdAt: "2026-07-24",
  },
  {
    slug: "derby-cuir-meknes",
    name: "Derby Meknès",
    subtitle: "Cuir de veau, cousu Blake",
    price: 1890,
    category: "shoes",
    collections: ["shoes"],
    colors: [C.black, C.brown],
    sizes: SHOE_SIZES,
    badges: ["essential"],
    soldOut: ["39"],
    rating: [4.8, 91],
    description:
      "Derby à trois œillets sur forme arrondie, montage Blake souple dès le premier jour, semelle cuir avec patin de gomme.",
    fabricAndCare:
      "Cuir de veau pleine fleur, semelle cuir. Embauchoirs recommandés, cirage neutre.",
    related: [
      "costume-laine-casablanca",
      "pantalon-tailleur-fes",
      "ceinture-cuir-fes",
    ],
    createdAt: "2026-06-18",
  },
  {
    slug: "mocassin-cuir-essaouira",
    name: "Mocassin Essaouira",
    subtitle: "Cuir souple, sans doublure",
    price: 1490,
    category: "shoes",
    collections: ["shoes", "new"],
    colors: [C.brown, C.sand],
    sizes: SHOE_SIZES,
    badges: ["new"],
    low: ["42", "43"],
    rating: [4.4, 47],
    description:
      "Mocassin à plateau non doublé, pensé pour être porté pieds nus. Il se détend légèrement puis ne bouge plus.",
    fabricAndCare: "Cuir de veau non doublé, semelle cuir. Éviter l'eau.",
    related: [
      "chemise-lin-oualidia",
      "blazer-deconstruit-rabat",
      "short-lin-agadir",
    ],
    createdAt: "2026-07-12",
  },
  {
    slug: "botte-chelsea-atlas",
    name: "Chelsea Atlas",
    subtitle: "Cuir huilé, semelle crêpe",
    price: 2190,
    category: "shoes",
    collections: ["shoes"],
    colors: [C.brown, C.black],
    sizes: SHOE_SIZES,
    soldOut: ["44"],
    rating: [4.7, 63],
    description:
      "Tige haute en cuir huilé, élastiques latéraux discrets, semelle crêpe naturelle qui absorbe le pavé.",
    fabricAndCare:
      "Cuir de veau huilé, semelle crêpe. Brosser, nourrir deux fois par an.",
    related: [
      "veste-suede-tanger",
      "pantalon-chino-medina",
      "echarpe-laine-chefchaouen",
    ],
    createdAt: "2026-05-30",
  },
  {
    slug: "espadrille-toile-taghazout",
    name: "Espadrille Taghazout",
    subtitle: "Toile de coton, corde de jute",
    price: 420,
    compareAtPrice: 520,
    category: "shoes",
    collections: ["shoes", "sale"],
    colors: [C.ecru, C.navy],
    sizes: SHOE_SIZES,
    badges: ["sale"],
    rating: [4.1, 34],
    description:
      "Cousue main sur semelle de jute, doublée d'une fine mousse pour tenir une journée entière de marche.",
    fabricAndCare:
      "Toile 100% coton, semelle jute et gomme. Nettoyage à sec, brosse douce.",
    related: ["short-lin-agadir", "chemise-lin-oualidia", "polo-maille-sidi"],
    createdAt: "2026-05-20",
  },
  {
    slug: "ceinture-cuir-fes",
    name: "Ceinture Fès",
    subtitle: "Cuir tanné végétal, boucle laiton",
    price: 390,
    category: "accessories",
    collections: ["accessories"],
    colors: [C.brown, C.black],
    sizes: [
      { id: "85", label: "85", eu: "85", cm: "85" },
      { id: "90", label: "90", eu: "90", cm: "90" },
      { id: "95", label: "95", eu: "95", cm: "95" },
      { id: "100", label: "100", eu: "100", cm: "100" },
    ],
    badges: ["essential"],
    rating: [4.6, 112],
    description:
      "Une seule épaisseur de cuir tanné végétal de 3,5 mm, boucle laiton massif non plaquée. Elle patine, elle ne s'use pas.",
    fabricAndCare:
      "Cuir tanné végétal, boucle laiton massif. Nourrir au baume incolore.",
    related: [
      "pantalon-tailleur-fes",
      "derby-cuir-meknes",
      "portefeuille-cuir-safi",
    ],
    createdAt: "2026-06-05",
  },
  {
    slug: "echarpe-laine-chefchaouen",
    name: "Écharpe Chefchaouen",
    subtitle: "Laine d'agneau tissée main",
    price: 450,
    category: "accessories",
    collections: ["accessories", "new"],
    colors: [C.indigo, C.terracotta, C.stone],
    sizes: ONE_SIZE,
    badges: ["new"],
    rating: [4.5, 29],
    description:
      "Tissée sur métier traditionnel, franges nouées main, 200 cm de long pour un double tour qui tient.",
    fabricAndCare:
      "100% laine d'agneau. Nettoyage à sec, ranger pliée à l'abri.",
    related: ["pull-merinos-rif", "veste-suede-tanger", "botte-chelsea-atlas"],
    createdAt: "2026-07-18",
  },
  {
    slug: "portefeuille-cuir-safi",
    name: "Portefeuille Safi",
    subtitle: "Cuir de veau, six cartes",
    price: 490,
    category: "accessories",
    collections: ["accessories"],
    colors: [C.black, C.brown, C.olive],
    sizes: ONE_SIZE,
    rating: [4.4, 78],
    description:
      "Six emplacements cartes, une poche billets pleine largeur, monté sans doublure pour rester plat en poche.",
    fabricAndCare: "Cuir de veau pleine fleur. Éviter l'humidité prolongée.",
    related: [
      "ceinture-cuir-fes",
      "lunettes-acetate-oualidia",
      "derby-cuir-meknes",
    ],
    createdAt: "2026-06-12",
  },
  {
    slug: "cravate-soie-rabat",
    name: "Cravate Rabat",
    subtitle: "Grenadine de soie, montée main",
    price: 350,
    category: "accessories",
    collections: ["accessories", "tailoring"],
    colors: [C.navy, C.olive, C.terracotta],
    sizes: ONE_SIZE,
    badges: ["essential"],
    rating: [4.7, 44],
    description:
      "Grenadine tissée à Côme, montée main en trois plis, 7,5 cm de large. Le nœud tombe sans effort.",
    fabricAndCare:
      "100% soie. Défaire le nœud après chaque port, ranger roulée.",
    related: [
      "costume-laine-casablanca",
      "gilet-laine-meknes",
      "chemise-oxford-atlas",
    ],
    createdAt: "2026-07-02",
  },
  {
    slug: "lunettes-acetate-oualidia",
    name: "Lunettes Oualidia",
    subtitle: "Acétate italien, verres minéraux",
    price: 690,
    category: "accessories",
    collections: ["accessories", "new"],
    colors: [C.brown, C.black],
    sizes: ONE_SIZE,
    badges: ["new", "last-pieces"],
    low: ["os"],
    rating: [4.3, 21],
    description:
      "Monture pantos en acétate massif, charnières rivetées, verres minéraux catégorie 3 traités anti-reflet.",
    fabricAndCare: "Acétate italien, verres minéraux. Étui rigide fourni.",
    related: [
      "chemise-lin-oualidia",
      "portefeuille-cuir-safi",
      "polo-maille-sidi",
    ],
    createdAt: "2026-07-27",
  },
];

/* ── Expansion ───────────────────────────────────────────────────────────── */

function buildProduct(seed: Seed, index: number): Product {
  const ref = `EH-${String(index + 1).padStart(4, "0")}`;

  // Two shots per colour (the second is what the card swaps to on hover),
  // plus two shared detail shots for the gallery.
  const images = [
    ...seed.colors.flatMap((color, ci) => [
      {
        url: PLACEHOLDER(`${seed.slug}-${color.id}-1`),
        alt: `${seed.name} en ${color.name}, vue de face`,
        width: 1200,
        height: 1600,
        colorId: color.id,
      },
      {
        url: PLACEHOLDER(`${seed.slug}-${color.id}-2`),
        alt: `${seed.name} en ${color.name}, porté`,
        width: 1200,
        height: 1600,
        colorId: color.id,
      },
      ...(ci === 0
        ? [
            {
              url: PLACEHOLDER(`${seed.slug}-detail`),
              alt: `${seed.name}, détail de la matière`,
              width: 1200,
              height: 1600,
              colorId: color.id,
            },
          ]
        : []),
    ]),
  ];

  const soldOut = new Set(seed.soldOut ?? []);
  const low = new Set(seed.low ?? []);

  const variants = seed.colors.flatMap((color) =>
    seed.sizes.map((size) => {
      const isSoldOut = soldOut.has(size.id);
      const isLow = low.has(size.id);
      return {
        id: `${seed.slug}-${color.id}-${size.id}`,
        colorId: color.id,
        sizeId: size.id,
        price: seed.price,
        compareAtPrice: seed.compareAtPrice,
        available: !isSoldOut,
        stock: isSoldOut ? 0 : isLow ? 2 : 18,
        sku: `${ref}-${color.id.toUpperCase().slice(0, 3)}-${size.id.toUpperCase()}`,
      };
    }),
  );

  return {
    id: ref,
    slug: seed.slug,
    reference: ref,
    name: seed.name,
    subtitle: seed.subtitle,
    description: seed.description,
    fabricAndCare: seed.fabricAndCare,
    price: seed.price,
    compareAtPrice: seed.compareAtPrice,
    currency: "MAD",
    collections: seed.collections,
    category: seed.category,
    badges: seed.badges ?? [],
    colors: seed.colors,
    sizes: seed.sizes,
    variants,
    images,
    rating: { value: seed.rating[0], count: seed.rating[1] },
    relatedSlugs: seed.related,
    createdAt: seed.createdAt,
  };
}

export const products: Product[] = SEEDS.map(buildProduct);
