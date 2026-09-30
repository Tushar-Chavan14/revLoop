import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/supabase";

export type Profile = Tables<"profiles">;

/** The subset of the Supabase user that pages actually read — built from the verified JWT claims. */
export interface AuthUser {
  id: string;
  email: string | undefined;
  user_metadata: Record<string, unknown>;
}

// cache() dedupes within a single request — the page, SiteHeader, SiteFooter
// and getMyRole() all ask for the user on the same render.
//
// getClaims() verifies the JWT locally against the project's cached ES256
// JWKS instead of round-tripping to the Auth server like getUser() does.
// Server Actions that write still call auth.getUser() themselves, and RLS
// re-checks the same JWT on every query anyway.
export const getAuthUser = cache(async (): Promise<AuthUser | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) {
    return null;
  }
  return {
    id: claims.sub,
    email: claims.email,
    user_metadata: (claims.user_metadata as Record<string, unknown> | undefined) ?? {},
  };
});

export const getProfileByUserId = cache(async (userId: string): Promise<Profile | null> => {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  return data;
});

export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getAuthUser();
  if (!user) {
    return null;
  }
  return getProfileByUserId(user.id);
}

export const getProfileByUsername = cache(async (username: string): Promise<Profile | null> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();
  return data;
});
