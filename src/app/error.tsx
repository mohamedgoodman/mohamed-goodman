"use client";

import { useEffect } from "react";
import { RotateCcwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center py-20 text-center">
      <p className="text-destructive text-sm font-semibold tracking-wide">
        Error
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        Something went wrong
      </h1>
      <p className="text-muted-foreground mt-3 max-w-md text-balance">
        An unexpected error occurred. You can try again, or head back home.
      </p>
      <Button className="mt-8" onClick={reset}>
        <RotateCcwIcon className="size-4" aria-hidden="true" />
        Try again
      </Button>
    </div>
  );
}
