"use client";

import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {/* Both icons render on the server; CSS (not JS state) decides which
          one shows, so there's no hydration mismatch or mount-detection
          effect needed. */}
      <SunIcon className="size-4 scale-100 dark:scale-0" aria-hidden="true" />
      <MoonIcon
        className="absolute size-4 scale-0 dark:scale-100"
        aria-hidden="true"
      />
    </Button>
  );
}
