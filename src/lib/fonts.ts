import { Archivo, IBM_Plex_Sans_Arabic, Inter } from "next/font/google";

/**
 * Display face: a wide grotesque, Bold and Black. Headlines are set large and
 * tight (see --tracking-display) in sentence case — the weight and width do
 * the work, not capitals.
 */
export const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "700", "900"],
  display: "swap",
});

/** UI and body copy. */
export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

/**
 * Arabic. Latin faces have no Arabic coverage, so the RTL locale points both
 * --font-display and --font-sans at this (see theme.css).
 */
export const arabicSans = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic-sans",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const fontVariables = [
  archivo.variable,
  inter.variable,
  arabicSans.variable,
].join(" ");
