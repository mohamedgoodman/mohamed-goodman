import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

// Next 16 renamed the middleware convention to "proxy"; same request-time hook.
export default createMiddleware(routing);

export const config = {
  // Run on every path except API routes, Next internals and static files.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
