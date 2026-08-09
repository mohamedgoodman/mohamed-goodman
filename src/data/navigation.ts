/**
 * Header + footer navigation.
 *
 * Labels are message keys, not literals, so the menus translate with the rest
 * of the UI: `key: "shirts"` resolves to `nav.links.shirts` in messages/*.json.
 * Every collection href here is backed by real products.
 */

export interface NavLink {
  /** Message key under `nav.links`. */
  key: string;
  href: string;
}

export interface NavGroup {
  /** Message key under `nav.groups`. */
  key: string;
  links: NavLink[];
}

export interface NavTile {
  /** Message key under `nav.tiles` — provides both title and caption. */
  key: string;
  href: string;
  image: string;
}

export interface NavItem {
  /** Message key under `nav.items`. */
  key: string;
  href: string;
  /** Terracotta treatment in the header. */
  highlight?: boolean;
  groups: NavGroup[];
  /** Two image tiles pinned to the end of the mega-menu panel. */
  tiles: NavTile[];
}

const TILE = (seed: string) => `https://picsum.photos/seed/${seed}/640/800`;

export const mainNav: NavItem[] = [
  {
    key: "new",
    href: "/collections/nouveautes",
    groups: [
      {
        key: "discover",
        links: [
          { key: "allNew", href: "/collections/nouveautes" },
          { key: "bestSellers", href: "/collections/meilleures-ventes" },
          { key: "tailoringRoom", href: "/collections/tailleur" },
        ],
      },
      {
        key: "byCategory",
        links: [
          { key: "shirts", href: "/collections/chemises" },
          { key: "knitwear", href: "/collections/mailles" },
          { key: "shoes", href: "/collections/chaussures" },
        ],
      },
    ],
    tiles: [
      {
        key: "newSeason",
        href: "/collections/nouveautes",
        image: TILE("eh-tile-new-1"),
      },
      {
        key: "linen",
        href: "/collections/chemises",
        image: TILE("eh-tile-new-2"),
      },
    ],
  },
  {
    key: "clothing",
    href: "/collections/vetements",
    groups: [
      {
        key: "tops",
        links: [
          { key: "shirts", href: "/collections/chemises" },
          { key: "knitwear", href: "/collections/mailles" },
          { key: "polos", href: "/collections/polos" },
        ],
      },
      {
        key: "bottoms",
        links: [
          { key: "trousers", href: "/collections/pantalons" },
          { key: "shorts", href: "/collections/shorts" },
        ],
      },
      {
        key: "layers",
        links: [
          { key: "outerwear", href: "/collections/vestes" },
          { key: "allClothing", href: "/collections/vetements" },
        ],
      },
    ],
    tiles: [
      {
        key: "everyday",
        href: "/collections/vetements",
        image: TILE("eh-tile-clothing-1"),
      },
      {
        key: "knit",
        href: "/collections/mailles",
        image: TILE("eh-tile-clothing-2"),
      },
    ],
  },
  {
    key: "tailoring",
    href: "/collections/tailleur",
    groups: [
      {
        key: "pieces",
        links: [
          { key: "suits", href: "/collections/costumes" },
          { key: "blazers", href: "/collections/blazers" },
          { key: "tailoredTrousers", href: "/collections/pantalons" },
        ],
      },
      {
        key: "finish",
        links: [
          { key: "ties", href: "/collections/cravates" },
          { key: "sizeGuide", href: "/pages/size-guide" },
        ],
      },
    ],
    tiles: [
      {
        key: "tailoringRoom",
        href: "/collections/tailleur",
        image: TILE("eh-tile-tailoring-1"),
      },
      {
        key: "ceremony",
        href: "/collections/costumes",
        image: TILE("eh-tile-tailoring-2"),
      },
    ],
  },
  {
    key: "shoes",
    href: "/collections/chaussures",
    groups: [
      {
        key: "styles",
        links: [
          { key: "loafers", href: "/collections/mocassins" },
          { key: "boots", href: "/collections/bottes" },
          { key: "allShoes", href: "/collections/chaussures" },
        ],
      },
    ],
    tiles: [
      {
        key: "leather",
        href: "/collections/chaussures",
        image: TILE("eh-tile-shoes-1"),
      },
      {
        key: "summer",
        href: "/collections/mocassins",
        image: TILE("eh-tile-shoes-2"),
      },
    ],
  },
  {
    key: "accessories",
    href: "/collections/accessoires",
    groups: [
      {
        key: "leather",
        links: [
          { key: "belts", href: "/collections/ceintures" },
          { key: "wallets", href: "/collections/maroquinerie" },
        ],
      },
      {
        key: "finishing",
        links: [
          { key: "ties", href: "/collections/cravates" },
          { key: "scarves", href: "/collections/echarpes" },
          { key: "eyewear", href: "/collections/lunettes" },
        ],
      },
    ],
    tiles: [
      {
        key: "details",
        href: "/collections/accessoires",
        image: TILE("eh-tile-acc-1"),
      },
      {
        key: "gifts",
        href: "/collections/maroquinerie",
        image: TILE("eh-tile-acc-2"),
      },
    ],
  },
  {
    key: "sale",
    href: "/collections/fins-de-series",
    highlight: true,
    groups: [
      {
        key: "sale",
        links: [
          { key: "allSale", href: "/collections/fins-de-series" },
          { key: "lastSizes", href: "/collections/fins-de-series" },
        ],
      },
    ],
    tiles: [
      {
        key: "endOfSeries",
        href: "/collections/fins-de-series",
        image: TILE("eh-tile-sale-1"),
      },
    ],
  },
];

/** Round category bubbles under the header on the homepage. */
export const categoryBubbles: Array<{
  key: string;
  href: string;
  image: string;
}> = [
  {
    key: "shirts",
    href: "/collections/chemises",
    image: TILE("eh-bubble-shirts"),
  },
  {
    key: "knitwear",
    href: "/collections/mailles",
    image: TILE("eh-bubble-knit"),
  },
  {
    key: "trousers",
    href: "/collections/pantalons",
    image: TILE("eh-bubble-trousers"),
  },
  {
    key: "suits",
    href: "/collections/costumes",
    image: TILE("eh-bubble-suits"),
  },
  {
    key: "blazers",
    href: "/collections/blazers",
    image: TILE("eh-bubble-blazers"),
  },
  {
    key: "shoes",
    href: "/collections/chaussures",
    image: TILE("eh-bubble-shoes"),
  },
  {
    key: "belts",
    href: "/collections/ceintures",
    image: TILE("eh-bubble-belts"),
  },
  {
    key: "eyewear",
    href: "/collections/lunettes",
    image: TILE("eh-bubble-eyewear"),
  },
];

export interface FooterColumn {
  /** Message key under `footer.columns`. */
  key: string;
  links: NavLink[];
}

export const footerNav: FooterColumn[] = [
  {
    key: "wardrobe",
    links: [
      { key: "allNew", href: "/collections/nouveautes" },
      { key: "allClothing", href: "/collections/vetements" },
      { key: "shirts", href: "/collections/chemises" },
      { key: "knitwear", href: "/collections/mailles" },
      { key: "tailoringRoom", href: "/collections/tailleur" },
    ],
  },
  {
    key: "shoesAccessories",
    links: [
      { key: "allShoes", href: "/collections/chaussures" },
      { key: "loafers", href: "/collections/mocassins" },
      { key: "boots", href: "/collections/bottes" },
      { key: "belts", href: "/collections/ceintures" },
      { key: "wallets", href: "/collections/maroquinerie" },
    ],
  },
  {
    key: "help",
    links: [
      { key: "shipping", href: "/pages/shipping" },
      { key: "returns", href: "/pages/returns" },
      { key: "sizeGuide", href: "/pages/size-guide" },
      { key: "orderTracking", href: "/orders/track" },
    ],
  },
  {
    key: "house",
    links: [
      { key: "about", href: "/pages/about" },
      { key: "stores", href: "/pages/about" },
      { key: "contact", href: "/pages/about" },
      { key: "allSale", href: "/collections/fins-de-series" },
    ],
  },
];
