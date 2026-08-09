# EDEN HOUSE

Men's clothing storefront for the Moroccan market — Next.js (App Router),
TypeScript, Tailwind CSS v4.

Premium, calm, editorial. Prices in dirhams, cash on delivery first,
trilingual (French / Arabic RTL / English), mobile-first.

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000
```

| Command          | What it does     |
| ---------------- | ---------------- |
| `npm run dev`    | Dev server       |
| `npm run build`  | Production build |
| `npm run lint`   | ESLint           |
| `npm run format` | Prettier write   |

## Where things live

```
messages/                 fr.json · ar.json · en.json — all UI copy
src/
  styles/theme.css        ← ALL design tokens. The only file to touch to rebrand.
  app/
    globals.css           Tailwind entry + base layer + shared utilities
    [locale]/             Every page lives under a locale segment
      page.tsx            Home
      design/tokens/      Living design-token preview (noindex)
  i18n/                   routing · navigation · request config (next-intl)
  proxy.ts                Locale negotiation (Next 16's middleware convention)
  data/
    products.ts           MOCK catalogue — replace with real data
    collections.ts        MOCK collections
    morocco.ts            Cities, delivery zones, shipping fees
    brand.ts              Name, WhatsApp number, socials
  lib/
    shop/                 THE data layer — getProducts / getProduct / …
    money.ts              formatMAD → "450 DH"
    fonts.ts              next/font: Instrument Serif + Inter (+ Arabic faces)
    design-tokens.ts      Token inventory for the preview page
```

## The data layer

Nothing in the UI imports `data/products.ts` directly. Every read goes through
`@/lib/shop`:

```ts
import {
  getProducts,
  getProduct,
  getRelatedProducts,
  getFacets,
} from "@/lib/shop";

const { items, total } = await getProducts({
  collection: "new",
  sort: "newest",
  limit: 8,
});
const product = await getProduct("chemise-oxford-atlas");
```

All of these are `async`, so swapping the mock arrays for Shopify's Storefront
API or a REST backend is a change to `src/lib/shop/index.ts` alone — call sites
don't move. The contract is the types in `src/lib/shop/types.ts`.

Product images are placeholders from `picsum.photos`, addressed by a stable
seed so a given product always renders the same photo. Swap the host in
`next.config.ts` when real photography arrives.

## Theming

`src/styles/theme.css` holds the whole system in three layers:

1. **Brand palette** — the raw paint tins (`--eh-olive`, `--eh-sand`, …).
2. **Semantic roles** — what components actually use (`--brand`,
   `--muted-foreground`, `--sale`, `--border`, …).
3. **Dark theme** — the same roles, re-pointed under `.dark`.

Plus typography (fluid clamp scale), spacing, radii, shadows, motion and
z-index. Everything is bridged into Tailwind through `@theme inline`, so the
tokens are available as utilities: `bg-brand`, `text-muted-foreground`,
`text-h2`, `rounded-sm`, `ease-editorial`.

Rebranding = editing layer 1. Dark mode comes free because it rides the same
role names.

Preview it all at **`/design/tokens`** — colours, type scale, spacing, radii,
shadows, motion and price formatting, with light/dark and locale switches so
the system can be checked in dark mode and in RTL.

## Internationalisation

`next-intl`, three locales: `fr` (default, unprefixed), `ar`, `en`.

- Arabic sets `dir="rtl"` on `<html>` and swaps in Arabic type faces — layouts
  use logical properties (`start`/`end`, `ms-`/`me-`) so the whole page mirrors,
  not just the text.
- Import `Link` and the router hooks from `@/i18n/navigation`, never from
  `next/link`, so URLs keep their locale prefix.
- Copy lives in `messages/*.json`.

## Morocco specifics

- Prices in MAD, formatted `450 DH` / `1 890 DH` — no decimals (`formatMAD`).
- Cash on delivery is the primary checkout; card is a disabled secondary option.
- Delivery estimates by city: 48h for Casablanca / Rabat / Marrakech, 72h
  elsewhere (`src/data/morocco.ts`).
- Sizes shown in both EU and cm.
- WhatsApp contact with a pre-filled product reference.

## Build order

1. **Project setup + theme + token preview** ← done
2. Header, mega-menu, footer
3. Homepage
4. Collection page + filters
5. Product page
6. Cart + COD checkout
