/**
 * Valid `categorie` values for the catalogue spreadsheet.
 *
 * Kept in its own module with no dependencies so the import script can
 * validate against it without pulling in app code, and so adding a collection
 * is a single edit that both the importer and the storefront pick up.
 */
export const collectionHandles = [
  "nouveautes",
  "vetements",
  "chemises",
  "mailles",
  "polos",
  "pantalons",
  "shorts",
  "vestes",
  "tailleur",
  "costumes",
  "blazers",
  "chaussures",
  "mocassins",
  "bottes",
  "accessoires",
  "ceintures",
  "maroquinerie",
  "cravates",
  "echarpes",
  "lunettes",
  "meilleures-ventes",
  "fins-de-series",
] as const;

export type CollectionHandle = (typeof collectionHandles)[number];
