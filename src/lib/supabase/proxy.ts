import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Routes that are useless without a session. Redirecting here (a real 307,
// before any rendering) beats the page's own redirect("/login"), which — now
// that routes stream behind loading.tsx — can only fire after the loader has
// already been sent. The pages keep their own checks as the real guard.
const SIGNED_IN_ONLY = [
  /^\/chats(\/|$)/,
  /^\/profile(\/|$)/,
  /^\/notifications(\/|$)/,
  /^\/admin(\/|$)/,
  /^\/rides\/create$/,
  /^\/rides\/[^/]+\/(edit|chat)$/,
];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and supabase.auth.getClaims().
  // A simple mistake could make it very hard to debug issues with users
  // being randomly logged out.
  //
  // IMPORTANT: `getClaims()` validates the JWT signature on every request.
  // Never rely on `getSession()` here — it doesn't guarantee revalidation.
  const { data } = await supabase.auth.getClaims();

  const { pathname } = request.nextUrl;
  if (
    !data?.claims &&
    request.method === "GET" &&
    SIGNED_IN_ONLY.some((pattern) => pattern.test(pathname))
  ) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    const redirectResponse = NextResponse.redirect(loginUrl);
    // Carry over any cookies getClaims() just cleared/refreshed.
    supabaseResponse.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If
  // you're creating a new response, make sure to copy over the cookies from
  // supabaseResponse, or the browser and server sessions will fall out of sync.
  return supabaseResponse;
}
