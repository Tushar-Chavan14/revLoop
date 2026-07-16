"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { profileSchema } from "@/features/profile/schema";
import type { Enums } from "@/types/supabase";
import { getOAuthAvatarUrl } from "@/utils/oauth-metadata";

const AVATAR_BUCKET = "avatars";

type ProfileActionResult = { error?: string } | void;

function parseProfileFormData(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    username: String(formData.get("username") ?? "")
      .trim()
      .toLowerCase(),
    city: String(formData.get("city") ?? "").trim(),
    country: String(formData.get("country") ?? "").trim(),
    bikeBrand: String(formData.get("bikeBrand") ?? "").trim(),
    bikeModel: String(formData.get("bikeModel") ?? "").trim(),
    experienceLevel: String(formData.get("experienceLevel") ?? ""),
    yearsRiding: Number(formData.get("yearsRiding")),
    bio: (formData.get("bio") as string)?.trim() || undefined,
    instagramHandle: (formData.get("instagramHandle") as string)?.trim() || undefined,
  };
}

async function uploadAvatarIfPresent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  formData: FormData,
) {
  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    return undefined;
  }

  const extension = file.name.split(".").pop() || "jpg";
  const path = `${userId}/avatar.${extension}`;

  const { error } = await supabase.storage.from(AVATAR_BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type,
  });

  if (error) {
    throw new Error("Could not upload profile image");
  }

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function createProfile(formData: FormData): Promise<ProfileActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const parsed = parseProfileFormData(formData);
  const isValid = await profileSchema.isValid(parsed);
  if (!isValid) {
    return { error: "Please fill in all required fields" };
  }

  let profileImageUrl: string | undefined;
  try {
    profileImageUrl = await uploadAvatarIfPresent(supabase, user.id, formData);
  } catch {
    return { error: "Could not upload profile image" };
  }
  // No manual upload — fall back to the OAuth provider's own photo (e.g.
  // Google) rather than leaving new riders with no avatar at all.
  profileImageUrl ??= getOAuthAvatarUrl(user.user_metadata);

  const { error } = await supabase.from("profiles").insert({
    id: user.id,
    name: parsed.name,
    username: parsed.username,
    city: parsed.city,
    country: parsed.country,
    bike_brand: parsed.bikeBrand,
    bike_model: parsed.bikeModel,
    // Safe: profileSchema.isValid(parsed) above already confirmed this is one
    // of the enum's literal values.
    experience_level: parsed.experienceLevel as Enums<"rider_level">,
    years_riding: parsed.yearsRiding,
    bio: parsed.bio,
    instagram_handle: parsed.instagramHandle,
    profile_image_url: profileImageUrl,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "That username is already taken" };
    }
    return { error: "Something went wrong, please try again" };
  }

  redirect("/");
}

export async function updateProfile(formData: FormData): Promise<ProfileActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const parsed = parseProfileFormData(formData);
  const isValid = await profileSchema.isValid(parsed);
  if (!isValid) {
    return { error: "Please fill in all required fields" };
  }

  let profileImageUrl: string | undefined;
  try {
    profileImageUrl = await uploadAvatarIfPresent(supabase, user.id, formData);
  } catch {
    return { error: "Could not upload profile image" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      name: parsed.name,
      username: parsed.username,
      city: parsed.city,
      country: parsed.country,
      bike_brand: parsed.bikeBrand,
      bike_model: parsed.bikeModel,
      // Safe: profileSchema.isValid(parsed) above already confirmed this is one
      // of the enum's literal values.
      experience_level: parsed.experienceLevel as Enums<"rider_level">,
      years_riding: parsed.yearsRiding,
      bio: parsed.bio,
      instagram_handle: parsed.instagramHandle,
      ...(profileImageUrl ? { profile_image_url: profileImageUrl } : {}),
    })
    .eq("id", user.id);

  if (error) {
    if (error.code === "23505") {
      return { error: "That username is already taken" };
    }
    return { error: "Something went wrong, please try again" };
  }

  redirect("/profile");
}
