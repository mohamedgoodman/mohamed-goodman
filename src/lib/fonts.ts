import {
  IBM_Plex_Sans_Arabic,
  Instrument_Serif,
  Inter,
  Noto_Naskh_Arabic,
} from "next/font/google";

/**
 * Editorial display face. Used for every heading via `--font-serif`.
 * Instrument Serif ships a single weight by design — its contrast comes
 * from size, not weight, which is what gives the pages their magazine feel.
 */
export const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

/** Neutral grotesque for all UI and body copy. */
export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

/**
 * Arabic counterparts. Latin faces have no Arabic coverage, so the RTL
 * locale swaps `--font-sans` / `--font-serif` onto these (see theme.css).
 */
export const arabicSans = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic-sans",
  subsets: ["arabic"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const arabicSerif = Noto_Naskh_Arabic({
  variable: "--font-arabic-serif",
  subsets: ["arabic"],
  weight: ["400", "500"],
  display: "swap",
});

export const fontVariables = [
  instrumentSerif.variable,
  inter.variable,
  arabicSans.variable,
  arabicSerif.variable,
].join(" ");
