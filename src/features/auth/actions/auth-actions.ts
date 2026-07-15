"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { magicLinkSchema } from "@/features/auth/schema";
import { getSiteUrl } from "@/utils/get-site-url";

export async function signInWithGoogle() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${getSiteUrl()}/auth/callback`,
    },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect(data.url);
}

export async function signInWithMagicLink(email: string) {
  const isValid = await magicLinkSchema.isValid({ email });

  if (!isValid) {
    redirect("/login?error=Enter a valid email address");
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${getSiteUrl()}/auth/callback`,
    },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/login?message=Check your email for a login link");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
