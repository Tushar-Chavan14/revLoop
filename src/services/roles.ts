import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/services/profiles";
import type { Enums } from "@/types/supabase";

export type AppRole = Enums<"app_role">;

export async function getMyRole(): Promise<AppRole> {
  const user = await getAuthUser();
  if (!user) {
    return "user";
  }

  return getUserRole(user.id);
}

// role is publicly readable (same posture as profiles) — used to decide
// what to show on someone else's public profile page, not just the current
// session's own role. cache() dedupes it across header/footer/page per request.
export const getUserRole = cache(async (userId: string): Promise<AppRole> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();
  return data?.role ?? "user";
});

export async function isCurrentUserAdmin(): Promise<boolean> {
  return (await getMyRole()) === "admin";
}

export async function isCurrentUserOrganizer(): Promise<boolean> {
  return (await getMyRole()) === "organizer";
}
