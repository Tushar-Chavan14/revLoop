import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico / icon.png / icons/ / opengraph-image (metadata assets)
     * - robots.txt / sitemap.xml / sw.js / offline.html / manifest.webmanifest
     * - the Razorpay webhook (server-to-server, no session)
     * - any static file extension served from /public
     *
     * This export MUST be named `config` — any other name is silently ignored
     * and the session refresh then runs on every asset request too.
     */
    "/((?!_next/static|_next/image|favicon.ico|icon.png|icons/|opengraph-image|robots.txt|sitemap.xml|sw.js|offline.html|manifest.webmanifest|api/razorpay/webhook|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2?)$).*)",
  ],
};
