/**
 * Inventory of the tokens exposed by `src/styles/theme.css`, used to render
 * the /design/tokens preview page. Adding a token to the theme means adding
 * one line here so it shows up in the preview.
 */

export interface TokenGroup {
  title: string;
  hint?: string;
  tokens: Array<{ name: string; usage?: string }>;
}

export const brandPalette: TokenGroup = {
  title: "Palette",
  hint: "Six values. Everything else on the site is derived from these.",
  tokens: [
    { name: "--canvas", usage: "Page background" },
    { name: "--surface-raw", usage: "Image backdrops, bands" },
    { name: "--border-raw", usage: "Hairlines, card edges" },
    { name: "--muted-raw", usage: "Secondary text" },
    { name: "--ink", usage: "Text and primary buttons" },
    { name: "--sale-raw", usage: "Reduced prices and promo badges ONLY" },
  ],
};

export const semanticColors: TokenGroup[] = [
  {
    title: "Surface & text",
    tokens: [
      { name: "--background", usage: "Page" },
      { name: "--foreground", usage: "All primary text" },
      { name: "--surface", usage: "Product images sit here, never on white" },
      { name: "--muted-foreground", usage: "Meta, struck prices" },
    ],
  },
  {
    title: "Lines & overlays",
    tokens: [
      { name: "--border", usage: "Default hairline" },
      { name: "--border-strong", usage: "Emphasised edge" },
      { name: "--ring", usage: "Focus outline" },
      { name: "--overlay", usage: "Modal scrim" },
    ],
  },
  {
    title: "The one colour",
    tokens: [
      { name: "--sale", usage: "Sale price, promo badge, Promos nav" },
      { name: "--destructive", usage: "Form errors" },
    ],
  },
];

export const typeScale = [
  {
    name: "--text-display",
    label: "Display",
    sample: "Sneakers livrés aujourd'hui",
    display: true,
  },
  { name: "--text-h1", label: "H1", sample: "Nouveautés", display: true },
  { name: "--text-h2", label: "H2", sample: "Sneakers", display: true },
  {
    name: "--text-h3",
    label: "H3",
    sample: "Comment ça marche",
    display: true,
  },
  { name: "--text-h4", label: "H4", sample: "Hoodie molleton", display: true },
  {
    name: "--text-lg",
    label: "Body large",
    sample: "Toutes les pointures en stock.",
  },
  {
    name: "--text-md",
    label: "Body",
    sample: "Toutes les pointures en stock.",
  },
  {
    name: "--text-base",
    label: "Body small",
    sample: "Toutes les pointures en stock.",
  },
  { name: "--text-sm", label: "Meta", sample: "3 couleurs" },
  { name: "--text-xs", label: "Eyebrow", sample: "NOUVEAU" },
  { name: "--text-2xs", label: "Legal", sample: "Paiement à la livraison" },
];

export const spaceScale = [
  "--space-1",
  "--space-2",
  "--space-4",
  "--space-6",
  "--space-8",
  "--space-12",
  "--space-16",
  "--space-24",
  "--space-section",
  "--gutter",
];

export const radiusScale = ["--radius-none", "--radius-sm", "--radius-full"];

export const shadowScale = ["--shadow-md", "--shadow-lg"];

export const motionTokens = {
  durations: ["--dur-instant", "--dur-fast", "--dur-base", "--dur-slow"],
  easings: ["--ease-out", "--ease-in-out", "--ease-editorial"],
};
