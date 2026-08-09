/**
 * CATALOGUE IMPORT
 *
 *   npm run import:catalogue [-- path/to/file.xlsx]
 *
 * Reads the PRODUITS sheet of the catalogue spreadsheet and writes
 * `src/data/products.generated.ts`. Re-run it every time the sheet changes —
 * it is idempotent (same sheet in, byte-identical file out) and never needs
 * anyone to touch TypeScript.
 *
 * It refuses to emit a broken catalogue: any malformed row prints the row
 * number, the column and what was wrong, and the process exits non-zero
 * without writing anything. A missing image file is a warning, not an error,
 * since photography often lands after the data.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import * as XLSX from "xlsx";

import { collectionHandles } from "../src/data/collection-handles";
import type {
  BadgeKey,
  Localized,
  Product,
  ProductColor,
  ProductImage,
} from "../src/lib/shop/types";

const ROOT = process.cwd();
const SHEET_NAME = "PRODUITS";
const PRIMARY_INPUT = path.join(
  ROOT,
  "data",
  "EDEN-HOUSE-catalogue-produits.xlsx",
);
const SAMPLE_INPUT = path.join(ROOT, "data", "catalogue-sample.xlsx");
const OUTPUT = path.join(ROOT, "src", "data", "products.generated.ts");
const IMAGE_DIR = path.join(ROOT, "public", "images", "products");
const IMAGE_URL_PREFIX = "/images/products/";

/**
 * Italic example rows shipped inside the template. Matched by ref, never by
 * position — the owner will add rows above and below them.
 */
const EXAMPLE_REFS = new Set(["CHM-LIN-001", "PNT-CHN-002"]);

/** Sheet badge labels → badge keys. Accent- and case-insensitive. */
const BADGE_ALIASES: Record<string, BadgeKey> = {
  nouveaute: "new",
  nouveau: "new",
  new: "new",
  jadid: "new",
  essentiel: "essential",
  essential: "essential",
  "dernieres pieces": "last-pieces",
  "derniere piece": "last-pieces",
  "last pieces": "last-pieces",
  "stock limite": "last-pieces",
  promo: "sale",
  solde: "sale",
  soldes: "sale",
  sale: "sale",
  "meilleure vente": "bestseller",
  "top vente": "bestseller",
  "meilleures ventes": "bestseller",
  bestseller: "bestseller",
  "best seller": "bestseller",
};

/* ── Reporting ───────────────────────────────────────────────────────────── */

interface Issue {
  row: number;
  column: string;
  message: string;
}

const errors: Issue[] = [];
const warnings: Issue[] = [];

function fail(row: number, column: string, message: string) {
  errors.push({ row, column, message });
}

function warn(row: number, column: string, message: string) {
  warnings.push({ row, column, message });
}

/* ── Cell helpers ────────────────────────────────────────────────────────── */

type Row = Record<string, unknown>;

function str(row: Row, column: string): string {
  const value = row[column];
  if (value == null) return "";
  return String(value).trim();
}

function num(row: Row, column: string, rowNumber: number): number | null {
  const raw = str(row, column);
  if (!raw) return null;
  // Tolerate "1 890", "1.890" and "450 DH" — people type prices, not data.
  const cleaned = raw.replace(/\s| | /g, "").replace(/dh|mad|درهم/gi, "");
  const parsed = Number(cleaned.replace(",", "."));
  if (!Number.isFinite(parsed)) {
    fail(rowNumber, column, `"${raw}" is not a number`);
    return null;
  }
  return parsed;
}

/** Trilingual field with French fallback for empty ar/en. */
function localized(row: Row, base: string, rowNumber: number): Localized {
  const fr = str(row, `${base}_fr`);
  if (!fr) {
    fail(
      rowNumber,
      `${base}_fr`,
      "required (French is the fallback for ar/en)",
    );
    return { fr: "", ar: "", en: "" };
  }
  return {
    fr,
    ar: str(row, `${base}_ar`) || fr,
    en: str(row, `${base}_en`) || fr,
  };
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normaliseKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/* ── Column parsers ──────────────────────────────────────────────────────── */

/** "Écru:#E7E0D2|Olive:#4B5540" */
function parseColors(raw: string, rowNumber: number): ProductColor[] {
  if (!raw) return [];
  const out: ProductColor[] = [];

  for (const chunk of raw.split("|")) {
    const part = chunk.trim();
    if (!part) continue;

    const separator = part.lastIndexOf(":");
    if (separator === -1) {
      fail(
        rowNumber,
        "couleurs",
        `"${part}" is missing a ":" between name and hex`,
      );
      continue;
    }

    const name = part.slice(0, separator).trim();
    const hex = part.slice(separator + 1).trim();

    if (!name) {
      fail(rowNumber, "couleurs", `"${part}" has no colour name`);
      continue;
    }
    if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) {
      fail(
        rowNumber,
        "couleurs",
        `"${hex}" is not a hex colour (expected #RGB or #RRGGBB)`,
      );
      continue;
    }

    out.push({ id: slugify(name) || `c${out.length + 1}`, name, hex });
  }

  return out;
}

/** "S;M;L" — semicolons, but tolerate commas since both get typed. */
function parseList(raw: string): string[] {
  if (!raw) return [];
  return raw
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseImages(raw: string, rowNumber: number): ProductImage[] {
  return parseList(raw).map((entry) => {
    // Absolute URLs pass through untouched, so placeholder photography can be
    // referenced before the real files land.
    if (/^https?:\/\//i.test(entry)) return { src: entry, present: true };

    const file = entry.replace(/^\/+/, "").replace(/^images\/products\//, "");
    const present = existsSync(path.join(IMAGE_DIR, file));
    if (!present) {
      warn(rowNumber, "images", `${file} not found in public/images/products/`);
    }
    return { src: `${IMAGE_URL_PREFIX}${file}`, present };
  });
}

/* ── Row → Product ───────────────────────────────────────────────────────── */

function buildProduct(row: Row, rowNumber: number): Product | null {
  const ref = str(row, "ref");
  if (!ref) {
    fail(rowNumber, "ref", "required");
    return null;
  }

  const collection = normaliseKey(str(row, "categorie"));
  if (!collection) {
    fail(rowNumber, "categorie", "required");
  } else if (!(collectionHandles as readonly string[]).includes(collection)) {
    fail(
      rowNumber,
      "categorie",
      `"${str(row, "categorie")}" is not a known collection handle. ` +
        `Known handles: ${collectionHandles.join(", ")}`,
    );
  }

  const name = localized(row, "nom", rowNumber);
  const price = num(row, "prix_dh", rowNumber);
  if (price == null) {
    // An unparseable value already reported itself; only an empty cell is
    // "required", so the owner doesn't get two errors for one mistake.
    if (!str(row, "prix_dh")) fail(rowNumber, "prix_dh", "required");
  } else if (price <= 0 || !Number.isInteger(price)) {
    fail(
      rowNumber,
      "prix_dh",
      `"${price}" must be a positive whole number of dirhams`,
    );
  }

  const compareRaw = num(row, "prix_barre_dh", rowNumber);
  let compareAtPrice: number | undefined;
  if (compareRaw != null && price != null) {
    // A struck-through price that isn't higher isn't a discount — drop it
    // rather than rendering a nonsense "was 400, now 450".
    if (compareRaw > price) compareAtPrice = Math.round(compareRaw);
    else
      warn(
        rowNumber,
        "prix_barre_dh",
        `${compareRaw} is not above prix_dh (${price}); ignored`,
      );
  }

  let badge: BadgeKey | undefined;
  const badgeRaw = str(row, "badge");
  if (badgeRaw) {
    badge = BADGE_ALIASES[normaliseKey(badgeRaw)];
    if (!badge) {
      fail(
        rowNumber,
        "badge",
        `"${badgeRaw}" is not a known badge. Known: ${[...new Set(Object.keys(BADGE_ALIASES))].join(", ")}`,
      );
    }
  }

  const colors = parseColors(str(row, "couleurs"), rowNumber);
  const sizes = parseList(str(row, "tailles"));
  const soldOutSizes = parseList(str(row, "tailles_rupture"));

  for (const size of soldOutSizes) {
    if (!sizes.includes(size)) {
      warn(
        rowNumber,
        "tailles_rupture",
        `"${size}" is not in tailles; ignored`,
      );
    }
  }

  const images = parseImages(str(row, "images"), rowNumber);
  if (images.length === 0) {
    warn(rowNumber, "images", "no images listed");
  }

  const orderRaw = num(row, "ordre", rowNumber);
  const ratingValue = num(row, "note", rowNumber);
  const ratingCount = num(row, "nb_avis", rowNumber);

  if (ratingValue != null && (ratingValue < 0 || ratingValue > 5)) {
    fail(rowNumber, "note", `"${ratingValue}" must be between 0 and 5`);
  }

  const slugSource = name.fr || ref;
  const slug = slugify(slugSource) || slugify(ref);

  return {
    id: ref,
    ref,
    slug,
    order: orderRaw,
    collection,
    name,
    description: localized(row, "description", rowNumber),
    material: localized(row, "matiere", rowNumber),
    care: localized(row, "entretien", rowNumber),
    price: price ?? 0,
    ...(compareAtPrice != null ? { compareAtPrice } : {}),
    currency: "MAD",
    ...(badge ? { badge } : {}),
    colors,
    sizes,
    soldOutSizes: soldOutSizes.filter((size) => sizes.includes(size)),
    images,
    ...(ratingValue != null
      ? { rating: { value: ratingValue, count: ratingCount ?? 0 } }
      : {}),
  };
}

/* ── Main ────────────────────────────────────────────────────────────────── */

function resolveInput(): string {
  const fromArgs = process.argv.slice(2).find((arg) => !arg.startsWith("-"));
  if (fromArgs) {
    const resolved = path.resolve(ROOT, fromArgs);
    if (!existsSync(resolved)) {
      console.error(`✖ No spreadsheet at ${resolved}`);
      process.exit(1);
    }
    return resolved;
  }

  if (existsSync(PRIMARY_INPUT)) return PRIMARY_INPUT;

  if (existsSync(SAMPLE_INPUT)) {
    console.warn(
      `⚠ ${path.relative(ROOT, PRIMARY_INPUT)} not found — falling back to the\n` +
        `  sample catalogue. Drop the real spreadsheet at that path and re-run.\n`,
    );
    return SAMPLE_INPUT;
  }

  console.error(
    `✖ No catalogue found. Expected one of:\n` +
      `   ${path.relative(ROOT, PRIMARY_INPUT)}\n` +
      `   ${path.relative(ROOT, SAMPLE_INPUT)}`,
  );
  process.exit(1);
}

function main() {
  const input = resolveInput();
  const workbook = XLSX.read(readFileSync(input), { type: "buffer" });

  const sheet = workbook.Sheets[SHEET_NAME];
  if (!sheet) {
    console.error(
      `✖ Sheet "${SHEET_NAME}" not found in ${path.basename(input)}. ` +
        `Sheets present: ${workbook.SheetNames.join(", ")}`,
    );
    process.exit(1);
  }

  const rows = XLSX.utils.sheet_to_json<Row>(sheet, { defval: "", raw: false });

  const products: Product[] = [];
  const seenRefs = new Map<string, number>();
  const seenSlugs = new Map<string, number>();
  let skippedInactive = 0;
  let skippedExamples = 0;

  rows.forEach((row, index) => {
    // +2: one for the header row, one because spreadsheets are 1-indexed.
    const rowNumber = index + 2;

    const ref = str(row, "ref");
    if (EXAMPLE_REFS.has(ref)) {
      skippedExamples += 1;
      return;
    }

    if (normaliseKey(str(row, "actif")) !== "oui") {
      skippedInactive += 1;
      return;
    }

    const product = buildProduct(row, rowNumber);
    if (!product) return;

    const duplicateRef = seenRefs.get(product.ref);
    if (duplicateRef) {
      fail(
        rowNumber,
        "ref",
        `"${product.ref}" already used on row ${duplicateRef}`,
      );
    } else {
      seenRefs.set(product.ref, rowNumber);
    }

    const duplicateSlug = seenSlugs.get(product.slug);
    if (duplicateSlug) {
      fail(
        rowNumber,
        "nom_fr",
        `produces the same URL slug "${product.slug}" as row ${duplicateSlug}`,
      );
    } else {
      seenSlugs.set(product.slug, rowNumber);
    }

    products.push(product);
  });

  // Sort by `ordre` ascending, empty last, then by ref so the output is stable.
  products.sort((a, b) => {
    if (a.order == null && b.order == null) return a.ref.localeCompare(b.ref);
    if (a.order == null) return 1;
    if (b.order == null) return -1;
    if (a.order !== b.order) return a.order - b.order;
    return a.ref.localeCompare(b.ref);
  });

  for (const { row, column, message } of warnings) {
    console.warn(`⚠ row ${row} · ${column}: ${message}`);
  }

  if (errors.length) {
    console.error(`\n✖ ${errors.length} problem(s) — nothing was written:\n`);
    for (const { row, column, message } of errors) {
      console.error(`   row ${row} · column "${column}": ${message}`);
    }
    console.error("");
    process.exit(1);
  }

  const banner = `// GENERATED FILE — DO NOT EDIT.
// Produced by \`npm run import:catalogue\` from ${path.basename(input)}.
// Edit the spreadsheet and re-run the import instead.
`;

  const body = `${banner}
import type { Product } from "@/lib/shop/types";

export const generatedProducts: Product[] = ${JSON.stringify(products, null, 2)};
`;

  mkdirSync(path.dirname(OUTPUT), { recursive: true });

  // Idempotent: identical input leaves the file (and git) untouched.
  const previous = existsSync(OUTPUT) ? readFileSync(OUTPUT, "utf8") : null;
  if (previous === body) {
    console.log(`✓ ${products.length} products — already up to date.`);
  } else {
    writeFileSync(OUTPUT, body);
    console.log(
      `✓ ${products.length} products → ${path.relative(ROOT, OUTPUT)}`,
    );
  }

  const missingImages = products.reduce(
    (total, product) => total + product.images.filter((i) => !i.present).length,
    0,
  );

  console.log(
    `  ${skippedInactive} inactive skipped · ${skippedExamples} example rows skipped` +
      (warnings.length ? ` · ${warnings.length} warning(s)` : "") +
      (missingImages ? ` · ${missingImages} image file(s) missing` : ""),
  );
}

main();
