import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/supabase";

export type Profile = Tables<"profiles">;

export async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfileByUserId(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  return data;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getAuthUser();
  if (!user) {
    return null;
  }
  return getProfileByUserId(user.id);
}
