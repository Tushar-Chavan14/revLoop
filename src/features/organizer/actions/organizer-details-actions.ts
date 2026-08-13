"use server";

import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { error?: string } | void;

export async function saveOrganizerDetails(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const businessName = (formData.get("businessName") as string)?.trim();
  const primaryDestination = (formData.get("primaryDestination") as string)?.trim();
  const businessEmail = (formData.get("businessEmail") as string)?.trim();
  const businessPhone = (formData.get("businessPhone") as string)?.trim();
  const instagramHandle = (formData.get("instagramHandle") as string)?.trim() || null;
  const eventsOrganisedCount = Number(formData.get("eventsOrganisedCount") ?? 0);

  if (!businessName || !primaryDestination || !businessEmail || !businessPhone) {
    return { error: "Please fill in all required fields." };
  }

  const { error } = await supabase.from("organizer_details").upsert(
    {
      user_id: user.id,
      business_name: businessName,
      primary_destination: primaryDestination,
      business_email: businessEmail,
      business_phone: businessPhone,
      instagram_handle: instagramHandle,
      events_organised_count: Number.isFinite(eventsOrganisedCount) ? eventsOrganisedCount : 0,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return { error: "Couldn't save business details, please try again." };
  }

  refresh();
}
