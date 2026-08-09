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
    href: "/collections/new",
    groups: [
      {
        key: "discover",
        links: [
          { key: "allNew", href: "/collections/new" },
          { key: "bestSellers", href: "/collections/best-sellers" },
          { key: "tailoringRoom", href: "/collections/tailoring" },
        ],
      },
      {
        key: "byCategory",
        links: [
          { key: "shirts", href: "/collections/shirts" },
          { key: "knitwear", href: "/collections/knitwear" },
          { key: "shoes", href: "/collections/shoes" },
        ],
      },
    ],
    tiles: [
      {
        key: "newSeason",
        href: "/collections/new",
        image: TILE("eh-tile-new-1"),
      },
      {
        key: "linen",
        href: "/collections/shirts",
        image: TILE("eh-tile-new-2"),
      },
    ],
  },
  {
    key: "clothing",
    href: "/collections/clothing",
    groups: [
      {
        key: "tops",
        links: [
          { key: "shirts", href: "/collections/shirts" },
          { key: "knitwear", href: "/collections/knitwear" },
          { key: "polos", href: "/collections/polos" },
        ],
      },
      {
        key: "bottoms",
        links: [
          { key: "trousers", href: "/collections/trousers" },
          { key: "shorts", href: "/collections/shorts" },
        ],
      },
      {
        key: "layers",
        links: [
          { key: "outerwear", href: "/collections/outerwear" },
          { key: "allClothing", href: "/collections/clothing" },
        ],
      },
    ],
    tiles: [
      {
        key: "everyday",
        href: "/collections/clothing",
        image: TILE("eh-tile-clothing-1"),
      },
      {
        key: "knit",
        href: "/collections/knitwear",
        image: TILE("eh-tile-clothing-2"),
      },
    ],
  },
  {
    key: "tailoring",
    href: "/collections/tailoring",
    groups: [
      {
        key: "pieces",
        links: [
          { key: "suits", href: "/collections/suits" },
          { key: "blazers", href: "/collections/blazers" },
          { key: "tailoredTrousers", href: "/collections/trousers" },
        ],
      },
      {
        key: "finish",
        links: [
          { key: "ties", href: "/collections/ties" },
          { key: "sizeGuide", href: "/pages/size-guide" },
        ],
      },
    ],
    tiles: [
      {
        key: "tailoringRoom",
        href: "/collections/tailoring",
        image: TILE("eh-tile-tailoring-1"),
      },
      {
        key: "ceremony",
        href: "/collections/suits",
        image: TILE("eh-tile-tailoring-2"),
      },
    ],
  },
  {
    key: "shoes",
    href: "/collections/shoes",
    groups: [
      {
        key: "styles",
        links: [
          { key: "loafers", href: "/collections/loafers" },
          { key: "boots", href: "/collections/boots" },
          { key: "allShoes", href: "/collections/shoes" },
        ],
      },
    ],
    tiles: [
      {
        key: "leather",
        href: "/collections/shoes",
        image: TILE("eh-tile-shoes-1"),
      },
      {
        key: "summer",
        href: "/collections/loafers",
        image: TILE("eh-tile-shoes-2"),
      },
    ],
  },
  {
    key: "accessories",
    href: "/collections/accessories",
    groups: [
      {
        key: "leather",
        links: [
          { key: "belts", href: "/collections/belts" },
          { key: "wallets", href: "/collections/wallets" },
        ],
      },
      {
        key: "finishing",
        links: [
          { key: "ties", href: "/collections/ties" },
          { key: "scarves", href: "/collections/scarves" },
          { key: "eyewear", href: "/collections/eyewear" },
        ],
      },
    ],
    tiles: [
      {
        key: "details",
        href: "/collections/accessories",
        image: TILE("eh-tile-acc-1"),
      },
      {
        key: "gifts",
        href: "/collections/wallets",
        image: TILE("eh-tile-acc-2"),
      },
    ],
  },
  {
    key: "sale",
    href: "/collections/sale",
    highlight: true,
    groups: [
      {
        key: "sale",
        links: [
          { key: "allSale", href: "/collections/sale" },
          { key: "lastSizes", href: "/collections/sale" },
        ],
      },
    ],
    tiles: [
      {
        key: "endOfSeries",
        href: "/collections/sale",
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
    href: "/collections/shirts",
    image: TILE("eh-bubble-shirts"),
  },
  {
    key: "knitwear",
    href: "/collections/knitwear",
    image: TILE("eh-bubble-knit"),
  },
  {
    key: "trousers",
    href: "/collections/trousers",
    image: TILE("eh-bubble-trousers"),
  },
  { key: "suits", href: "/collections/suits", image: TILE("eh-bubble-suits") },
  {
    key: "blazers",
    href: "/collections/blazers",
    image: TILE("eh-bubble-blazers"),
  },
  { key: "shoes", href: "/collections/shoes", image: TILE("eh-bubble-shoes") },
  { key: "belts", href: "/collections/belts", image: TILE("eh-bubble-belts") },
  {
    key: "eyewear",
    href: "/collections/eyewear",
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
      { key: "allNew", href: "/collections/new" },
      { key: "allClothing", href: "/collections/clothing" },
      { key: "shirts", href: "/collections/shirts" },
      { key: "knitwear", href: "/collections/knitwear" },
      { key: "tailoringRoom", href: "/collections/tailoring" },
    ],
  },
  {
    key: "shoesAccessories",
    links: [
      { key: "allShoes", href: "/collections/shoes" },
      { key: "loafers", href: "/collections/loafers" },
      { key: "boots", href: "/collections/boots" },
      { key: "belts", href: "/collections/belts" },
      { key: "wallets", href: "/collections/wallets" },
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
      { key: "allSale", href: "/collections/sale" },
    ],
  },
];
