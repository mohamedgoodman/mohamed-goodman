import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center py-20 text-center">
      <p className="text-primary text-sm font-semibold tracking-wide">404</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        Page not found
      </h1>
      <p className="text-muted-foreground mt-3 max-w-md text-balance">
        The page you&apos;re looking for doesn&apos;t exist or may have been
        moved.
      </p>
      <Button className="mt-8" asChild>
        <Link href="/">
          <ArrowLeftIcon className="size-4" aria-hidden="true" />
          Back home
        </Link>
      </Button>
    </div>
  );
}
