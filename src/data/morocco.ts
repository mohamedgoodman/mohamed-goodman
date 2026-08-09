/**
 * Morocco-specific delivery data: the checkout city dropdown and the
 * delivery-estimate widget both read from here.
 */

export interface MoroccanCity {
  id: string;
  /** Latin name — used in French and English. */
  name: string;
  /** Arabic name — used in the RTL locale. */
  nameAr: string;
  region: string;
  /** Working days until delivery. 1 = next 48h zone, 2 = 72h zone. */
  deliveryDays: 1 | 2;
}

/** Cities on the 48h express ring. Everything else is 72h. */
const EXPRESS = new Set(["casablanca", "rabat", "marrakech"]);

const RAW: Array<[id: string, name: string, nameAr: string, region: string]> = [
  ["casablanca", "Casablanca", "الدار البيضاء", "Casablanca-Settat"],
  ["rabat", "Rabat", "الرباط", "Rabat-Salé-Kénitra"],
  ["marrakech", "Marrakech", "مراكش", "Marrakech-Safi"],
  ["tanger", "Tanger", "طنجة", "Tanger-Tétouan-Al Hoceïma"],
  ["fes", "Fès", "فاس", "Fès-Meknès"],
  ["meknes", "Meknès", "مكناس", "Fès-Meknès"],
  ["agadir", "Agadir", "أكادير", "Souss-Massa"],
  ["oujda", "Oujda", "وجدة", "Oriental"],
  ["kenitra", "Kénitra", "القنيطرة", "Rabat-Salé-Kénitra"],
  ["tetouan", "Tétouan", "تطوان", "Tanger-Tétouan-Al Hoceïma"],
  ["sale", "Salé", "سلا", "Rabat-Salé-Kénitra"],
  ["mohammedia", "Mohammedia", "المحمدية", "Casablanca-Settat"],
  ["el-jadida", "El Jadida", "الجديدة", "Casablanca-Settat"],
  ["safi", "Safi", "آسفي", "Marrakech-Safi"],
  ["beni-mellal", "Béni Mellal", "بني ملال", "Béni Mellal-Khénifra"],
  ["nador", "Nador", "الناظور", "Oriental"],
  ["temara", "Témara", "تمارة", "Rabat-Salé-Kénitra"],
  ["khouribga", "Khouribga", "خريبكة", "Béni Mellal-Khénifra"],
  ["settat", "Settat", "سطات", "Casablanca-Settat"],
  ["berrechid", "Berrechid", "برشيد", "Casablanca-Settat"],
  ["taza", "Taza", "تازة", "Fès-Meknès"],
  ["essaouira", "Essaouira", "الصويرة", "Marrakech-Safi"],
  ["ouarzazate", "Ouarzazate", "ورزازات", "Drâa-Tafilalet"],
  ["errachidia", "Errachidia", "الرشيدية", "Drâa-Tafilalet"],
  ["laayoune", "Laâyoune", "العيون", "Laâyoune-Sakia El Hamra"],
  ["dakhla", "Dakhla", "الداخلة", "Dakhla-Oued Ed-Dahab"],
  ["ifrane", "Ifrane", "إفران", "Fès-Meknès"],
  ["larache", "Larache", "العرائش", "Tanger-Tétouan-Al Hoceïma"],
  ["khemisset", "Khémisset", "الخميسات", "Rabat-Salé-Kénitra"],
  ["guelmim", "Guelmim", "كلميم", "Guelmim-Oued Noun"],
];

export const moroccanCities: MoroccanCity[] = RAW.map(
  ([id, name, nameAr, region]) => ({
    id,
    name,
    nameAr,
    region,
    deliveryDays: EXPRESS.has(id) ? (1 as const) : (2 as const),
  }),
).sort((a, b) => a.name.localeCompare(b.name, "fr"));

export function getCity(id: string): MoroccanCity | undefined {
  return moroccanCities.find((c) => c.id === id);
}

/** Hours quoted to the customer: 48h on the express ring, 72h elsewhere. */
export function deliveryHours(city?: MoroccanCity): 48 | 72 {
  return city?.deliveryDays === 1 ? 48 : 72;
}

/** Free delivery above this basket total, in MAD. */
export const FREE_SHIPPING_THRESHOLD = 800;

/** Flat cash-on-delivery shipping fee, in MAD. */
export const SHIPPING_FEE = 35;
