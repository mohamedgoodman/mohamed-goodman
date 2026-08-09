"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

/**
 * Shows the value a CSS custom property actually resolves to in the current
 * theme. Server-rendered as the variable name, then upgraded on the client —
 * so it degrades to something readable without JS.
 */
export function TokenValue({ name }: { name: string }) {
  const { resolvedTheme } = useTheme();
  const [value, setValue] = useState<string | null>(null);

  useEffect(() => {
    const read = () =>
      setValue(
        getComputedStyle(document.documentElement)
          .getPropertyValue(name)
          .trim(),
      );
    // Wait a frame so the theme class is applied before we measure.
    const id = requestAnimationFrame(read);
    return () => cancelAnimationFrame(id);
  }, [name, resolvedTheme]);

  return (
    <code className="text-muted-foreground text-2xs font-mono break-all">
      {value || name}
    </code>
  );
}
