"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { buildWhatsAppContactLink } from "@/lib/whatsapp";

/**
 * Floating WhatsApp button.
 *
 * Appears only after the hero has scrolled past — at the very top the hero
 * already carries a WhatsApp call to action, and two of them stacked is noise.
 *
 * It sits above the safe-area inset and leaves room for a sticky add-to-cart
 * bar underneath it (`--sticky-bar-h`, which the product page sets when its bar
 * is showing), so the two never overlap on a phone.
 */
export function FloatingWhatsApp() {
  const t = useTranslations("whatsapp");
  const locale = useLocale();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      href={buildWhatsAppContactLink(locale)}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={t("contact")}
      data-visible={visible || undefined}
      className="fixed end-4 [bottom:calc(1rem+var(--sticky-bar-h,0px)+env(safe-area-inset-bottom))] z-50 grid size-12 place-items-center rounded-full bg-[#25D366] text-[#062e16] opacity-0 shadow-md transition-opacity duration-300 not-data-visible:pointer-events-none data-visible:opacity-100"
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        className="size-6"
      >
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.15a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.17 8.17 0 0 1-1.25-4.38c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.69 8.23-8.25 8.23zm4.43-5.77c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.35z" />
      </svg>
    </a>
  );
}
