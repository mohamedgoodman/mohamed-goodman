/**
 * Header + footer navigation.
 *
 * Five top-level items, no more. Labels are message keys, not literals, so the
 * menus translate with the rest of the UI: `key: "sneakers"` resolves to
 * `nav.links.sneakers`. Every href points at a real collection handle.
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

export interface NavItem {
  /** Message key under `nav.items`. */
  key: string;
  href: string;
  /** Rendered in --sale. Reserved for Promos. */
  highlight?: boolean;
  /** Empty for items that are a straight link with no submenu. */
  groups: NavGroup[];
}

export const mainNav: NavItem[] = [
  {
    key: "new",
    href: "/collections/nouveautes",
    groups: [],
  },
  {
    key: "sneakers",
    href: "/collections/sneakers",
    groups: [
      {
        key: "shop",
        links: [
          { key: "allSneakers", href: "/collections/sneakers" },
          { key: "allNew", href: "/collections/nouveautes" },
          { key: "allPromos", href: "/collections/promos" },
        ],
      },
    ],
  },
  {
    key: "tops",
    href: "/collections/t-shirts",
    groups: [
      {
        key: "shop",
        links: [
          { key: "tshirts", href: "/collections/t-shirts" },
          { key: "hoodies", href: "/collections/hoodies" },
          { key: "sweats", href: "/collections/sweats" },
        ],
      },
    ],
  },
  {
    key: "jackets",
    href: "/collections/vestes",
    groups: [
      {
        key: "shop",
        links: [
          { key: "jackets", href: "/collections/vestes" },
          { key: "tracksuits", href: "/collections/survetements" },
          { key: "trousers", href: "/collections/pantalons" },
        ],
      },
    ],
  },
  {
    key: "promos",
    href: "/collections/promos",
    highlight: true,
    groups: [],
  },
];

export interface FooterColumn {
  /** Message key under `footer.columns`. */
  key: string;
  links: NavLink[];
}

export const footerNav: FooterColumn[] = [
  {
    key: "shop",
    links: [
      { key: "allNew", href: "/collections/nouveautes" },
      { key: "allSneakers", href: "/collections/sneakers" },
      { key: "tshirts", href: "/collections/t-shirts" },
      { key: "hoodies", href: "/collections/hoodies" },
      { key: "jackets", href: "/collections/vestes" },
      { key: "allPromos", href: "/collections/promos" },
    ],
  },
  {
    key: "more",
    links: [
      { key: "tracksuits", href: "/collections/survetements" },
      { key: "trousers", href: "/collections/pantalons" },
      { key: "caps", href: "/collections/casquettes" },
      { key: "bags", href: "/collections/sacs" },
    ],
  },
  {
    key: "help",
    links: [
      { key: "howItWorks", href: "/#comment-ca-marche" },
      { key: "sizeGuide", href: "/pages/size-guide" },
      { key: "orderTracking", href: "/orders/track" },
    ],
  },
];
