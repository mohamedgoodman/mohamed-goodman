/**
 * Valid `categorie` values for the catalogue spreadsheet.
 *
 * No dependencies, so the import script can validate against it without
 * pulling in app code. Adding a collection is a single edit here that both the
 * importer and the storefront pick up — and a `categorie` the sheet uses that
 * isn't in this list fails the import loudly rather than creating a page
 * nobody can navigate to.
 */
export const collectionHandles = [
  "nouveautes",
  "sneakers",
  "t-shirts",
  "hoodies",
  "sweats",
  "vestes",
  "survetements",
  "pantalons",
  "casquettes",
  "sacs",
  "promos",
] as const;

export type CollectionHandle = (typeof collectionHandles)[number];
