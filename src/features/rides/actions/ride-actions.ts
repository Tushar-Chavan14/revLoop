"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { rideSchema } from "@/features/rides/schema";
import { getProfileByUserId } from "@/services/profiles";
import { isProfileComplete } from "@/utils/profile-completeness";
import type { Enums } from "@/types/supabase";

const COVER_BUCKET = "ride-covers";

type RideActionResult = { error?: string } | void;

function optionalNumber(value: FormDataEntryValue | null): number | undefined {
  if (value === null || value === "") {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function parseRideFormData(formData: FormData) {
  return {
    title: String(formData.get("title") ?? "").trim(),
    description: (formData.get("description") as string)?.trim() || undefined,
    rideDate: String(formData.get("rideDate") ?? ""),
    departureTime: String(formData.get("departureTime") ?? ""),
    meetingPoint: String(formData.get("meetingPoint") ?? "").trim(),
    meetingLat: optionalNumber(formData.get("meetingLat")),
    meetingLng: optionalNumber(formData.get("meetingLng")),
    destination: String(formData.get("destination") ?? "").trim(),
    destinationLat: optionalNumber(formData.get("destinationLat")),
    destinationLng: optionalNumber(formData.get("destinationLng")),
    destinationMapUrl: (formData.get("destinationMapUrl") as string)?.trim() || undefined,
    city: String(formData.get("city") ?? "").trim(),
    maxRiders: optionalNumber(formData.get("maxRiders")),
    rideType: String(formData.get("rideType") ?? ""),
    speed: String(formData.get("speed") ?? ""),
    difficulty: String(formData.get("difficulty") ?? ""),
    breakfastStop: formData.get("breakfastStop") === "true",
    fuelStop: formData.get("fuelStop") === "true",
    helmetRequired: formData.get("helmetRequired") === "true",
    pillionAllowed: formData.get("pillionAllowed") === "true",
    estimatedDistanceKm: optionalNumber(formData.get("estimatedDistanceKm")),
    estimatedDurationMinutes: optionalNumber(formData.get("estimatedDurationMinutes")),
  };
}

async function uploadCoverIfPresent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  formData: FormData,
) {
  const file = formData.get("coverImage");
  if (!(file instanceof File) || file.size === 0) {
    return undefined;
  }

  const extension = file.name.split(".").pop() || "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(COVER_BUCKET).upload(path, file, {
    contentType: file.type,
  });

  if (error) {
    throw new Error("Could not upload cover image");
  }

  const { data } = supabase.storage.from(COVER_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function createRide(formData: FormData): Promise<RideActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getProfileByUserId(user.id);
  if (!isProfileComplete(profile)) {
    redirect("/profile/setup");
  }

  const parsed = parseRideFormData(formData);
  const isValid = await rideSchema.isValid(parsed);
  if (!isValid) {
    return { error: "Please fill in all required fields" };
  }

  let coverImageUrl: string | undefined;
  try {
    coverImageUrl = await uploadCoverIfPresent(supabase, user.id, formData);
  } catch {
    return { error: "Could not upload cover image" };
  }

  const { data: ride, error } = await supabase
    .from("rides")
    .insert({
      organizer_id: user.id,
      title: parsed.title,
      description: parsed.description,
      ride_date: parsed.rideDate,
      departure_time: parsed.departureTime,
      meeting_point: parsed.meetingPoint,
      meeting_lat: parsed.meetingLat!,
      meeting_lng: parsed.meetingLng!,
      destination: parsed.destination,
      destination_lat: parsed.destinationLat!,
      destination_lng: parsed.destinationLng!,
      destination_map_url: parsed.destinationMapUrl,
      city: parsed.city,
      max_riders: parsed.maxRiders!,
      ride_type: parsed.rideType as Enums<"ride_type">,
      speed: parsed.speed as Enums<"speed_level">,
      difficulty: parsed.difficulty as Enums<"rider_level">,
      breakfast_stop: parsed.breakfastStop,
      fuel_stop: parsed.fuelStop,
      helmet_required: parsed.helmetRequired,
      pillion_allowed: parsed.pillionAllowed,
      estimated_distance_km: parsed.estimatedDistanceKm,
      estimated_duration_minutes: parsed.estimatedDurationMinutes,
      cover_image_url: coverImageUrl,
    })
    .select("id")
    .single();

  if (error || !ride) {
    return { error: "Something went wrong, please try again" };
  }

  redirect(`/rides/${ride.id}`);
}

export async function updateRide(rideId: string, formData: FormData): Promise<RideActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const parsed = parseRideFormData(formData);
  const isValid = await rideSchema.isValid(parsed);
  if (!isValid) {
    return { error: "Please fill in all required fields" };
  }

  let coverImageUrl: string | undefined;
  try {
    coverImageUrl = await uploadCoverIfPresent(supabase, user.id, formData);
  } catch {
    return { error: "Could not upload cover image" };
  }

  const { data: ride, error } = await supabase
    .from("rides")
    .update({
      title: parsed.title,
      description: parsed.description,
      ride_date: parsed.rideDate,
      departure_time: parsed.departureTime,
      meeting_point: parsed.meetingPoint,
      meeting_lat: parsed.meetingLat!,
      meeting_lng: parsed.meetingLng!,
      destination: parsed.destination,
      destination_lat: parsed.destinationLat!,
      destination_lng: parsed.destinationLng!,
      destination_map_url: parsed.destinationMapUrl,
      city: parsed.city,
      max_riders: parsed.maxRiders!,
      ride_type: parsed.rideType as Enums<"ride_type">,
      speed: parsed.speed as Enums<"speed_level">,
      difficulty: parsed.difficulty as Enums<"rider_level">,
      breakfast_stop: parsed.breakfastStop,
      fuel_stop: parsed.fuelStop,
      helmet_required: parsed.helmetRequired,
      pillion_allowed: parsed.pillionAllowed,
      estimated_distance_km: parsed.estimatedDistanceKm,
      estimated_duration_minutes: parsed.estimatedDurationMinutes,
      ...(coverImageUrl ? { cover_image_url: coverImageUrl } : {}),
    })
    .eq("id", rideId)
    .select("id")
    .maybeSingle();

  if (error) {
    return { error: "Something went wrong, please try again" };
  }
  if (!ride) {
    return { error: "You don't have permission to edit this ride" };
  }

  redirect(`/rides/${rideId}`);
}
