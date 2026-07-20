import { createClient } from "@/lib/supabase/server";

export async function getMyRole(): Promise<"user" | "admin"> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return "user";
  }

  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  return data?.role ?? "user";
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  return (await getMyRole()) === "admin";
}
