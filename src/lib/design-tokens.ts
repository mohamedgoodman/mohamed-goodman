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
  title: "Brand palette",
  hint: "Raw values. Change these to rebrand — nothing else references them directly.",
  tokens: [
    { name: "--eh-sand", usage: "Page background" },
    { name: "--eh-sand-deep", usage: "Wells, inputs" },
    { name: "--eh-sand-deeper", usage: "Skeletons" },
    { name: "--eh-ink", usage: "Primary text" },
    { name: "--eh-ink-soft", usage: "Body copy" },
    { name: "--eh-olive", usage: "Accent / primary action" },
    { name: "--eh-olive-hover", usage: "Pressed accent" },
    { name: "--eh-olive-tint", usage: "Section wash" },
    { name: "--eh-muted", usage: "Meta, placeholders" },
    { name: "--eh-terracotta", usage: "Sale, badges" },
    { name: "--eh-terracotta-tint", usage: "Badge background" },
  ],
};

export const semanticColors: TokenGroup[] = [
  {
    title: "Surface & text",
    tokens: [
      { name: "--background", usage: "Page" },
      { name: "--foreground", usage: "Headings, primary text" },
      { name: "--surface", usage: "Cards, drawers, menus" },
      { name: "--surface-2", usage: "Wells, hovered rows" },
      { name: "--surface-3", usage: "Image placeholders" },
      { name: "--subtle-foreground", usage: "Body copy" },
      { name: "--muted-foreground", usage: "Meta, captions" },
    ],
  },
  {
    title: "Accent",
    tokens: [
      { name: "--brand", usage: "Buttons, links, focus ring" },
      { name: "--brand-hover", usage: "Hover / pressed" },
      { name: "--brand-foreground", usage: "Text on accent" },
      { name: "--brand-tint", usage: "Quiet accent wash" },
    ],
  },
  {
    title: "Sale & status",
    tokens: [
      { name: "--sale", usage: "Sale price, badges" },
      { name: "--sale-tint", usage: "Badge background" },
      { name: "--success", usage: "In stock, order confirmed" },
      { name: "--warning", usage: "Low stock" },
      { name: "--destructive", usage: "Errors, remove" },
    ],
  },
  {
    title: "Lines & overlays",
    tokens: [
      { name: "--border", usage: "Default hairline" },
      { name: "--border-strong", usage: "Emphasised divider" },
      { name: "--input", usage: "Form field border" },
      { name: "--ring", usage: "Focus outline" },
      { name: "--overlay", usage: "Modal scrim" },
    ],
  },
];

export const typeScale = [
  {
    name: "--text-display",
    label: "Display",
    sample: "EDEN HOUSE",
    serif: true,
  },
  { name: "--text-h1", label: "H1", sample: "Le vestiaire", serif: true },
  { name: "--text-h2", label: "H2", sample: "Nouveautés", serif: true },
  { name: "--text-h3", label: "H3", sample: "La salle de coupe", serif: true },
  {
    name: "--text-h4",
    label: "H4",
    sample: "Chemise Oxford Atlas",
    serif: true,
  },
  {
    name: "--text-h5",
    label: "H5",
    sample: "Matière & entretien",
    serif: true,
  },
  {
    name: "--text-lg",
    label: "Body large",
    sample: "Coton oxford lavé, coupe droite.",
  },
  {
    name: "--text-md",
    label: "Body",
    sample: "Coton oxford lavé, coupe droite.",
  },
  {
    name: "--text-base",
    label: "Body small",
    sample: "Coton oxford lavé, coupe droite.",
  },
  { name: "--text-sm", label: "Meta", sample: "3 couleurs disponibles" },
  { name: "--text-xs", label: "Eyebrow", sample: "NOUVEAUTÉ" },
  { name: "--text-2xs", label: "Legal", sample: "Paiement à la livraison" },
];

export const spaceScale = [
  "--space-1",
  "--space-2",
  "--space-3",
  "--space-4",
  "--space-6",
  "--space-8",
  "--space-12",
  "--space-16",
  "--space-24",
  "--space-32",
  "--space-section",
  "--gutter",
];

export const radiusScale = [
  "--radius-none",
  "--radius-xs",
  "--radius-sm",
  "--radius-md",
  "--radius-lg",
  "--radius-xl",
  "--radius-full",
];

export const shadowScale = [
  "--shadow-xs",
  "--shadow-sm",
  "--shadow-md",
  "--shadow-lg",
];

export const motionTokens = {
  durations: [
    "--dur-instant",
    "--dur-fast",
    "--dur-base",
    "--dur-slow",
    "--dur-slower",
  ],
  easings: ["--ease-out", "--ease-in-out", "--ease-editorial"],
};
