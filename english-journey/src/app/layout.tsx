import type { Metadata, Viewport } from "next";
import { Cairo, Inter } from "next/font/google";
import { ThemeProvider, themeScript } from "@/components/theme-provider";
import { AmbientBackground } from "@/components/visual/ambient-background";
import { I18nProvider } from "@/i18n/provider";
import { dirFor } from "@/i18n/config";
import { getLocale } from "@/i18n";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-latin", display: "swap" });
// Arabic face for the Darija interface. Latin glyphs still come from Inter,
// because the font stack lists it first and Inter has no Arabic coverage.
const cairo = Cairo({ subsets: ["arabic"], variable: "--font-arabic", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "English Journey — تعلم الإنجليزية بالدارجة",
    template: "%s · English Journey",
  },
  description:
    "تعلم الإنجليزية اللي خاصك بصح: حصة يومية، عبارات حقيقية، استماع، هضرة، نطق ومراجعة — كلشي مشروح بالدارجة المغربية.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f5fb" },
    { media: "(prefers-color-scheme: dark)", color: "#080b18" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      dir={dirFor(locale)}
      suppressHydrationWarning
      className={`${inter.variable} ${cairo.variable}`}
    >
      <head>
        {/* Set the theme before first paint so there is no flash. */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <I18nProvider locale={locale}>
          <ThemeProvider>
            <AmbientBackground />
            {children}
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
