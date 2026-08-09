/**
 * Delivery is Ben Guerir only.
 *
 * That single constraint is the shop's positioning, so it's modelled here
 * rather than assumed in a form: the checkout picks a *neighbourhood*, not a
 * city, and anyone outside the zone gets told plainly and handed a WhatsApp
 * link instead of a validation error they can't act on.
 */

export interface Neighbourhood {
  id: string;
  /** Latin name, used in French and English. */
  name: string;
  /** Arabic name, used in the RTL locale. */
  nameAr: string;
}

/**
 * TODO: confirm this list with the shop — these are the commonly used
 * neighbourhood names in Ben Guerir, but the owner knows which ones customers
 * actually type.
 */
export const neighbourhoods: Neighbourhood[] = [
  { id: "centre-ville", name: "Centre-ville", nameAr: "وسط المدينة" },
  { id: "hay-el-massira", name: "Hay El Massira", nameAr: "حي المسيرة" },
  { id: "hay-el-amal", name: "Hay El Amal", nameAr: "حي الأمل" },
  { id: "hay-el-qods", name: "Hay El Qods", nameAr: "حي القدس" },
  { id: "hay-el-wifaq", name: "Hay El Wifaq", nameAr: "حي الوفاق" },
  { id: "hay-el-fath", name: "Hay El Fath", nameAr: "حي الفتح" },
  { id: "hay-salam", name: "Hay Salam", nameAr: "حي السلام" },
  { id: "hay-nahda", name: "Hay Nahda", nameAr: "حي النهضة" },
  { id: "sidi-bouathmane", name: "Sidi Bouathmane", nameAr: "سيدي بوعثمان" },
  { id: "um6p", name: "UM6P / Ville Verte", nameAr: "المدينة الخضراء" },
];

/** Picking up in store is a first-class option, not an afterthought. */
export const STORE_PICKUP_ID = "store-pickup";

export function getNeighbourhood(id: string): Neighbourhood | undefined {
  return neighbourhoods.find((n) => n.id === id);
}

/**
 * TODO: set the real delivery fee, or 0 if it's free inside Ben Guerir.
 * Same-day, inside the city, so there's no distance tier to model.
 */
export const DELIVERY_FEE = 0;

/** Collecting in store never costs anything. */
export const PICKUP_FEE = 0;
