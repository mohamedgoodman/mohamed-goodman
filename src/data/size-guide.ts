/**
 * Shirt measurements, garment laid flat, in centimetres.
 *
 * These are the numbers the "measure a shirt you already own" tool compares
 * against — flat garment measurements, not body measurements, because that's
 * what someone can actually check at home with a ruler.
 */
export interface ShirtSize {
  id: string;
  label: string;
  eu: string;
  /** Armpit seam to armpit seam, buttoned and flat. */
  chestFlat: number;
  /** Shoulder high point to hem. */
  length: number;
  /** Shoulder seam to cuff. */
  sleeve: number;
}

export const shirtSizes: ShirtSize[] = [
  { id: "xs", label: "XS", eu: "44", chestFlat: 52, length: 70, sleeve: 62 },
  { id: "s", label: "S", eu: "46", chestFlat: 54.5, length: 72, sleeve: 63.5 },
  { id: "m", label: "M", eu: "48", chestFlat: 57, length: 74, sleeve: 65 },
  { id: "l", label: "L", eu: "50", chestFlat: 60, length: 76, sleeve: 66.5 },
  { id: "xl", label: "XL", eu: "52", chestFlat: 63, length: 78, sleeve: 68 },
  {
    id: "xxl",
    label: "XXL",
    eu: "54",
    chestFlat: 66,
    length: 80,
    sleeve: 69.5,
  },
];

/** Anything outside this range isn't one of our sizes. */
export const CHEST_RANGE = { min: 45, max: 75 } as const;

export interface SizeMatch {
  status: "ok" | "between" | "out-of-range" | "insufficient";
  size?: ShirtSize;
  /** Present when the measurement falls between two sizes. */
  larger?: ShirtSize;
}

/**
 * Matches flat measurements to a size.
 *
 * Chest carries the decision — it's the measurement that actually determines
 * whether a shirt fits, and the easiest of the three to take accurately.
 * Length and sleeve only break ties, weighted well below chest.
 */
export function matchShirtSize(input: {
  chestFlat?: number;
  length?: number;
  sleeve?: number;
}): SizeMatch {
  const { chestFlat, length, sleeve } = input;

  if (!chestFlat || Number.isNaN(chestFlat)) return { status: "insufficient" };
  if (chestFlat < CHEST_RANGE.min || chestFlat > CHEST_RANGE.max) {
    return { status: "out-of-range" };
  }

  const scored = shirtSizes
    .map((size) => {
      let distance = Math.abs(size.chestFlat - chestFlat) * 3;
      if (length) distance += Math.abs(size.length - length) * 0.5;
      if (sleeve) distance += Math.abs(size.sleeve - sleeve) * 0.5;
      return { size, distance };
    })
    .sort((a, b) => a.distance - b.distance);

  const best = scored[0];

  // Sitting near the midpoint between two neighbouring sizes is genuinely
  // ambiguous — say so rather than pretending to a precision we don't have.
  const neighbours = shirtSizes.filter(
    (s) => Math.abs(s.chestFlat - chestFlat) <= 1.6 && s.id !== best.size.id,
  );
  if (neighbours.length && Math.abs(best.size.chestFlat - chestFlat) >= 1.1) {
    const pair = [best.size, neighbours[0]].sort(
      (a, b) => a.chestFlat - b.chestFlat,
    );
    return { status: "between", size: pair[0], larger: pair[1] };
  }

  return { status: "ok", size: best.size };
}

/** localStorage key shared with the "Find your fit" quiz. */
export const PREFERRED_SIZE_KEY = "eh:preferred-size";
