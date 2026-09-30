import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

let publicClient: ReturnType<typeof createClient<Database>> | undefined;

/**
 * A cookie-less, anonymous client for data every visitor sees the same way
 * (anon-readable RLS: rides, profiles, ride_members, ride_images, user_roles,
 * organizer_details). Because it never touches cookies() it can run inside
 * unstable_cache, so these reads are shared across visitors instead of
 * hitting Postgres on every page view. Never use it for per-user data.
 */
export function createPublicClient() {
  publicClient ??= createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
  );
  return publicClient;
}
