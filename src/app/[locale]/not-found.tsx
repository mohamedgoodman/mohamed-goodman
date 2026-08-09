import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("common");

  return (
    <div className="container-narrow flex min-h-[60vh] flex-col justify-center py-(--space-24)">
      <p className="eyebrow">404</p>
      <h1 className="text-h1 mt-4">Page introuvable</h1>
      <p className="text-subtle-foreground text-md mt-4 max-w-prose">
        Cette page n&apos;existe pas ou a été déplacée.
      </p>
      <p className="mt-(--space-8)">
        <Link href="/" className="link-underline text-sm">
          {t("brand")} →
        </Link>
      </p>
    </div>
  );
}
