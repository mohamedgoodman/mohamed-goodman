"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import {
  matchShirtSize,
  PREFERRED_SIZE_KEY,
  shirtSizes,
} from "@/data/size-guide";
import { cn } from "@/lib/utils";

/**
 * "Measure a t-shirt you already own".
 *
 * A size chart asks you to measure your own body with a tape measure you don't
 * own, then trust an abstract number. This asks you to measure a tee or hoodie
 * that already fits — something anyone can do with a ruler — and matches it against
 * the same garment-flat measurements our shirts are cut to.
 *
 * The result is stored so product pages can pre-select the size later.
 */

interface Field {
  key: "chestFlat" | "length" | "sleeve";
  labelKey: string;
  helpKey: string;
  placeholder: string;
}

const FIELDS: Field[] = [
  {
    key: "chestFlat",
    labelKey: "measureChest",
    helpKey: "measureChestHelp",
    placeholder: "57",
  },
  {
    key: "length",
    labelKey: "measureLength",
    helpKey: "measureLengthHelp",
    placeholder: "74",
  },
  {
    key: "sleeve",
    labelKey: "measureSleeve",
    helpKey: "measureSleeveHelp",
    placeholder: "65",
  },
];

export function GarmentMeasureTool() {
  const t = useTranslations("sizeGuide");
  const [values, setValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const parsed = useMemo(
    () => ({
      chestFlat: Number.parseFloat(values.chestFlat ?? "") || undefined,
      length: Number.parseFloat(values.length ?? "") || undefined,
      sleeve: Number.parseFloat(values.sleeve ?? "") || undefined,
    }),
    [values],
  );

  const match = useMemo(() => matchShirtSize(parsed), [parsed]);

  useEffect(() => {
    if (match.status !== "ok" || !match.size) return;
    const id = match.size.id;
    const frame = requestAnimationFrame(() => {
      try {
        window.localStorage.setItem(PREFERRED_SIZE_KEY, id);
        setSaved(true);
      } catch {
        // Storage unavailable — the recommendation still shows on screen.
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [match.status, match.size]);

  return (
    <div>
      <p className="text-subtle-foreground text-md max-w-prose">
        {t("measureIntro")}
      </p>

      <div className="mt-(--space-8) grid gap-6 sm:grid-cols-3">
        {FIELDS.map((field) => (
          <div key={field.key}>
            <label
              htmlFor={`measure-${field.key}`}
              className="text-sm font-medium"
            >
              {t(field.labelKey)}
            </label>
            <div className="border-input focus-within:border-foreground mt-1.5 flex items-baseline gap-2 border-b transition-colors">
              {/* Measurements are numbers: LTR and tabular in every locale. */}
              <input
                id={`measure-${field.key}`}
                type="number"
                inputMode="decimal"
                dir="ltr"
                min={20}
                max={120}
                step="0.5"
                value={values[field.key] ?? ""}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [field.key]: e.target.value }))
                }
                placeholder={field.placeholder}
                aria-describedby={`measure-${field.key}-help`}
                className="text-md placeholder:text-muted-foreground w-full min-w-0 bg-transparent py-2 text-start tabular-nums outline-none"
              />
              <span className="text-muted-foreground shrink-0 text-sm">
                {t("cm")}
              </span>
            </div>
            <p
              id={`measure-${field.key}-help`}
              className="text-muted-foreground mt-2 text-xs"
            >
              {t(field.helpKey)}
            </p>
          </div>
        ))}
      </div>

      <div
        role="status"
        aria-live="polite"
        className={cn(
          "mt-(--space-8) rounded-sm p-(--space-6)",
          match.status === "ok" || match.status === "between"
            ? "bg-surface"
            : "bg-surface-2",
        )}
      >
        {match.status === "insufficient" ? (
          <p className="text-subtle-foreground text-md">{t("resultNone")}</p>
        ) : match.status === "out-of-range" ? (
          <p className="text-subtle-foreground text-md">{t("outOfRange")}</p>
        ) : match.status === "between" && match.size && match.larger ? (
          <>
            <p className="eyebrow">{t("result")}</p>
            <p className="text-h3 font-display mt-2">
              {match.size.label} / {match.larger.label}
            </p>
            <p className="text-subtle-foreground text-md mt-3 max-w-prose">
              {t("resultBetween", {
                size: match.size.label,
                larger: match.larger.label,
              })}
            </p>
          </>
        ) : match.size ? (
          <>
            <p className="eyebrow">{t("result")}</p>
            <p className="text-h2 font-display mt-2">{match.size.label}</p>
            <p className="text-subtle-foreground text-md mt-3 max-w-prose">
              {t("resultBody", { size: match.size.label })}
            </p>
            {saved ? (
              <p className="text-muted-foreground mt-3 text-xs">{t("saved")}</p>
            ) : null}
          </>
        ) : null}
      </div>

      {Object.keys(values).length > 0 ? (
        <button
          type="button"
          onClick={() => {
            setValues({});
            setSaved(false);
          }}
          className="link-underline mt-6 text-sm"
        >
          {t("reset")}
        </button>
      ) : null}

      <table className="mt-(--space-12) w-full border-collapse text-start">
        <caption className="text-muted-foreground mb-3 text-start text-xs">
          {t("chartIntro")}
        </caption>
        <thead>
          <tr className="border-border border-b">
            {["colSize", "colEu", "colChest", "colLength", "colSleeve"].map(
              (key) => (
                <th
                  key={key}
                  scope="col"
                  className="text-muted-foreground py-2 text-start text-xs font-medium"
                >
                  {t(key)}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {shirtSizes.map((size) => (
            <tr
              key={size.id}
              className={cn(
                "border-border border-b",
                match.size?.id === size.id && "bg-surface",
              )}
            >
              <th scope="row" className="py-2.5 text-start text-sm font-medium">
                {size.label}
              </th>
              <td className="py-2.5 text-sm tabular-nums">{size.eu}</td>
              <td className="py-2.5 text-sm tabular-nums">{size.chestFlat}</td>
              <td className="py-2.5 text-sm tabular-nums">{size.length}</td>
              <td className="py-2.5 text-sm tabular-nums">{size.sleeve}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
