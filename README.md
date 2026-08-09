# EDEN HOUSE

Sneakers and streetwear shop in Ben Guerir — Next.js (App Router), TypeScript,
Tailwind CSS v4.

Neutral and photo-led: white, greys and near-black, with one saturated red
reserved for sale prices. Prices in dirhams, pay on delivery, same-day inside
Ben Guerir, trilingual (French default / Arabic RTL / English), mobile-first.

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000
```

| Command                    | What it does                          |
| -------------------------- | ------------------------------------- |
| `npm run dev`              | Dev server                            |
| `npm run build`            | Production build                      |
| `npm run lint`             | ESLint                                |
| `npm run format`           | Prettier write                        |
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
    delivery.ts           Ben Guerir neighbourhoods, pickup, fees
    brand.ts              Name, WhatsApp number, socials
  lib/
    shop/                 THE data layer — getProducts / getProduct / …
    money.ts              formatMAD → "450 DH"
    fonts.ts              next/font: Archivo + Inter + IBM Plex Sans Arabic
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

`src/styles/theme.css` is the whole visual system, in three layers:

1. **Palette** — six raw values (`--canvas`, `--surface-raw`, `--border-raw`,
   `--muted-raw`, `--ink`, `--sale-raw`). That is the entire brand.
2. **Semantic roles** — what components use (`--background`, `--foreground`,
   `--surface`, `--border`, `--sale`…).
3. **Dark** — a straight inversion; `--sale` lightens so it stays legible.

Rules the system depends on:

- **No brand colour in the chrome.** Product photography is the only colour on
  the page. If a component reaches for an accent, it uses ink.
- **`--sale` is the only saturated value**, and only for a reduced price, a
  promo badge, or the Promos nav item. Anywhere else is a bug.
- **Product images always sit on `--surface`, never white** — it makes photos
  with inconsistent backgrounds read as deliberate.
- **Primary button** = ink fill, white text, 2px radius. **Secondary** =
  transparent with a 1px ink border.

Type is Archivo (Bold/Black) for headlines — large, tight, sentence case — and
Inter for UI. No serif anywhere. Arabic uses IBM Plex Sans Arabic with
letter-spacing forced to `normal`, looser leading and a size step up.

Preview it at **`/design/tokens`**.

## Internationalisation

`next-intl`, three locales: `fr` (default, unprefixed), `ar`, `en`.

- Arabic sets `dir="rtl"` on `<html>` and swaps in Arabic type faces — layouts
  use logical properties (`start`/`end`, `ms-`/`me-`) so the whole page mirrors,
  not just the text.
- Import `Link` and the router hooks from `@/i18n/navigation`, never from
  `next/link`, so URLs keep their locale prefix.
- Copy lives in `messages/*.json`.

## Ben Guerir specifics

Delivery is Ben Guerir only, and that constraint drives the site:

- Announcement bar, trust strip and the "Comment ça marche" section all say so.
- Checkout picks a **neighbourhood**, not a city (`src/data/delivery.ts`), with
  collect-in-store as a first-class option. Anyone outside the zone is told
  plainly and handed a WhatsApp link.
- Prices in MAD, formatted `450 DH` (`formatMAD`), pay cash to the driver.
- Phone, address and Instagram are single TODO constants at the top of
  `src/data/brand.ts` — set them once and every surface updates.

## Build order

1. **Project setup + theme + token preview** ← done
2. Header, mega-menu, footer
3. Homepage
4. Collection page + filters
5. Product page
6. Cart + COD checkout
