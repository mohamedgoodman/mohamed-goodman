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
| `npm run import:catalogue` | Rebuild products from the spreadsheet |

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
    products.generated.ts GENERATED from the spreadsheet — never edit
    collection-handles.ts Valid `categorie` values, shared with the importer
    collections.ts        Collection metadata (trilingual)
    morocco.ts            Cities, delivery zones, shipping fees
    brand.ts              Name, WhatsApp number, socials
  lib/
    shop/                 THE data layer — getProducts / getProduct / …
    money.ts              formatMAD → "450 DH"
    fonts.ts              next/font: Instrument Serif + Inter (+ Arabic faces)
    design-tokens.ts      Token inventory for the preview page
```

## The catalogue

Products come from a spreadsheet, not from TypeScript. To update the store:

```bash
# 1. drop your spreadsheet here (this exact filename)
#    data/EDEN-HOUSE-catalogue-produits.xlsx
# 2. regenerate
npm run import:catalogue
```

That reads the `PRODUITS` sheet and writes `src/data/products.generated.ts`.
It is idempotent — an unchanged sheet leaves the file byte-identical, so it
produces no git noise. You never edit product data by hand.

The importer refuses to emit a broken catalogue. Any malformed row prints the
spreadsheet row number, the column and what was wrong, then exits non-zero
without writing anything:

```
✖ 2 problem(s) — nothing was written:
   row 7 · column "categorie": "chapeaux" is not a known collection handle…
   row 9 · column "couleurs": "#zzz" is not a hex colour (expected #RGB or #RRGGBB)
```

Missing image files are a **warning**, not an error — photography usually lands
after the data, so the import continues and the card shows a placeholder.

Column mapping lives at the top of `scripts/import-catalogue.ts`. Valid values
for `categorie` are the handles in `src/data/collection-handles.ts`.

Until the real spreadsheet is in place the importer falls back to
`data/catalogue-sample.xlsx` (and says so loudly) so the storefront has
something to render.

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
