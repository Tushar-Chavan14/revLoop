"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { rideSchema, type ItineraryDay } from "@/features/rides/schema";
import { getProfileByUserId } from "@/services/profiles";
import { getPayoutDetails, hasPayoutDetails } from "@/services/organizer-payout";
import { isProfileComplete } from "@/utils/profile-completeness";
import type { Enums, Json } from "@/types/supabase";

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
  const pricingModel = String(formData.get("pricingModel") ?? "community");
  const itineraryRaw = (formData.get("itinerary") as string) || "[]";
  let itinerary: ItineraryDay[] = [];
  try {
    itinerary = JSON.parse(itineraryRaw);
  } catch {
    itinerary = [];
  }

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
    estimatedDurationDays: optionalNumber(formData.get("estimatedDurationDays")),
    estimatedDurationHours: optionalNumber(formData.get("estimatedDurationHours")),
    pricingModel,
    rideFee: optionalNumber(formData.get("rideFee")),
    bookingDeadline: (formData.get("bookingDeadline") as string) || undefined,
    minimumRiders: optionalNumber(formData.get("minimumRiders")),
    cancellationPolicy: (formData.get("cancellationPolicy") as string)?.trim() || undefined,
    inclusions: formData.getAll("inclusions").map(String),
    exclusions: formData.getAll("exclusions").map(String),
    itinerary,
  };
}

// Stored as total minutes in the DB (no separate days/hours columns). Days
// is a day *count*, not additive with hours: 1 day means "same-day ride,
// estimate it in hours" (the form only shows the hours input then), while
// 2+ days means a multi-day tour where hours don't apply — see
// formatRideDuration in src/utils/ride-duration.ts, which reverses this.
function toDurationMinutes(days: number | undefined, hours: number | undefined) {
  if (days === undefined) {
    return undefined;
  }
  if (days === 1) {
    return (hours ?? 0) * 60;
  }
  return days * 24 * 60;
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

  if (parsed.pricingModel === "organized" && !hasPayoutDetails(await getPayoutDetails(user.id))) {
    return { error: "Add your payout details in your profile before creating an Organized Ride." };
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
      estimated_duration_minutes: toDurationMinutes(
        parsed.estimatedDurationDays,
        parsed.estimatedDurationHours,
      ),
      cover_image_url: coverImageUrl,
      pricing_model: parsed.pricingModel as Enums<"pricing_model">,
      ride_fee: parsed.pricingModel === "organized" ? parsed.rideFee : undefined,
      currency: "INR",
      booking_deadline: parsed.pricingModel === "organized" ? parsed.bookingDeadline : undefined,
      minimum_riders: parsed.pricingModel === "organized" ? parsed.minimumRiders : undefined,
      ride_inclusions: parsed.pricingModel === "organized" ? parsed.inclusions : [],
      ride_exclusions: parsed.pricingModel === "organized" ? parsed.exclusions : [],
      ride_itinerary:
        parsed.pricingModel === "organized" ? (parsed.itinerary as unknown as Json) : [],
      cancellation_policy:
        parsed.pricingModel === "organized" ? parsed.cancellationPolicy : undefined,
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

  const { data: existingRide } = await supabase
    .from("rides")
    .select("pricing_model")
    .eq("id", rideId)
    .maybeSingle();

  if (existingRide && existingRide.pricing_model !== parsed.pricingModel) {
    const [{ count: bookingCount }, { count: requestCount }] = await Promise.all([
      supabase
        .from("ride_bookings")
        .select("id", { count: "exact", head: true })
        .eq("ride_id", rideId),
      supabase
        .from("ride_requests")
        .select("id", { count: "exact", head: true })
        .eq("ride_id", rideId),
    ]);
    if ((bookingCount ?? 0) > 0 || (requestCount ?? 0) > 0) {
      return { error: "Can't change ride type once riders have booked or requested to join." };
    }
  }

  if (parsed.pricingModel === "organized" && !hasPayoutDetails(await getPayoutDetails(user.id))) {
    return { error: "Add your payout details in your profile before creating an Organized Ride." };
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
      estimated_duration_minutes: toDurationMinutes(
        parsed.estimatedDurationDays,
        parsed.estimatedDurationHours,
      ),
      ...(coverImageUrl ? { cover_image_url: coverImageUrl } : {}),
      pricing_model: parsed.pricingModel as Enums<"pricing_model">,
      ride_fee: parsed.pricingModel === "organized" ? parsed.rideFee : undefined,
      currency: "INR",
      booking_deadline: parsed.pricingModel === "organized" ? parsed.bookingDeadline : undefined,
      minimum_riders: parsed.pricingModel === "organized" ? parsed.minimumRiders : undefined,
      ride_inclusions: parsed.pricingModel === "organized" ? parsed.inclusions : [],
      ride_exclusions: parsed.pricingModel === "organized" ? parsed.exclusions : [],
      ride_itinerary:
        parsed.pricingModel === "organized" ? (parsed.itinerary as unknown as Json) : [],
      cancellation_policy:
        parsed.pricingModel === "organized" ? parsed.cancellationPolicy : undefined,
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
