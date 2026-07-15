import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/supabase";

export type RideMember = Tables<"ride_members">;
export type RideRequest = Tables<"ride_requests">;
export type RiderProfile = Pick<
  Tables<"profiles">,
  "id" | "name" | "username" | "profile_image_url"
>;

export type RideMemberWithProfile = RideMember & { profile: RiderProfile | null };
export type RideRequestWithRequester = RideRequest & { requester: RiderProfile | null };

const PROFILE_SELECT = "id, name, username, profile_image_url";

export async function getRideMembers(rideId: string): Promise<RideMemberWithProfile[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ride_members")
    .select(`*, profile:profiles!ride_members_user_id_fkey(${PROFILE_SELECT})`)
    .eq("ride_id", rideId)
    .order("role", { ascending: true })
    .order("joined_at", { ascending: true });
  return (data ?? []) as RideMemberWithProfile[];
}

export async function getRideRequests(rideId: string): Promise<RideRequestWithRequester[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ride_requests")
    .select(`*, requester:profiles!ride_requests_requester_id_fkey(${PROFILE_SELECT})`)
    .eq("ride_id", rideId)
    .order("created_at", { ascending: false });
  return (data ?? []) as RideRequestWithRequester[];
}

export async function getMyRideRequest(
  rideId: string,
  userId: string,
): Promise<RideRequest | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ride_requests")
    .select("*")
    .eq("ride_id", rideId)
    .eq("requester_id", userId)
    .maybeSingle();
  return data;
}
