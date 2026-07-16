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

export async function getRequestsForRides(rideIds: string[]): Promise<RideRequestWithRequester[]> {
  if (rideIds.length === 0) {
    return [];
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("ride_requests")
    .select(`*, requester:profiles!ride_requests_requester_id_fkey(${PROFILE_SELECT})`)
    .in("ride_id", rideIds)
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

export interface AttendanceStats {
  attended: number;
  noShow: number;
}

// Reliability numbers shown on a rider's profile: how many rides they've
// actually shown up for versus flaked on, per attendance_status set by
// organizers after each ride's date has passed.
export async function getAttendanceStats(userId: string): Promise<AttendanceStats> {
  const supabase = await createClient();
  const [attended, noShow] = await Promise.all([
    supabase
      .from("ride_members")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("attendance_status", "attended"),
    supabase
      .from("ride_members")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("attendance_status", "no_show"),
  ]);
  return { attended: attended.count ?? 0, noShow: noShow.count ?? 0 };
}
