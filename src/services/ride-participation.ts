import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/supabase";
import { getUpcomingWeekendRange } from "@/utils/weekend";

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

export interface FellowRider {
  profile: RiderProfile;
  nextRideId: string;
  nextRideTitle: string;
  nextRideDate: string | null;
}

// Riders the current user has shared a ride with before, who have another
// upcoming ride on the calendar — the closest honest reading of "friends
// riding" without a follows/friends graph in the schema.
export async function getFellowRiders(userId: string, limit = 6): Promise<FellowRider[]> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: myRideRows } = await supabase
    .from("ride_members")
    .select("ride_id")
    .eq("user_id", userId);
  const myRideIds = [...new Set((myRideRows ?? []).map((row) => row.ride_id))];
  if (myRideIds.length === 0) {
    return [];
  }

  const { data: coMemberRows } = await supabase
    .from("ride_members")
    .select(`user_id, profile:profiles!ride_members_user_id_fkey(${PROFILE_SELECT})`)
    .in("ride_id", myRideIds)
    .neq("user_id", userId);

  const coRiderIds = [
    ...new Set((coMemberRows ?? []).map((row) => row.user_id).filter(Boolean)),
  ] as string[];
  if (coRiderIds.length === 0) {
    return [];
  }
  const profileById = new Map(
    (coMemberRows ?? [])
      .filter((row) => row.profile)
      .map((row) => [row.user_id, row.profile as RiderProfile]),
  );

  const { data: upcomingRows } = await supabase
    .from("ride_members")
    .select("user_id, ride:rides!ride_members_ride_id_fkey(id, title, ride_date, status)")
    .in("user_id", coRiderIds)
    .order("user_id", { ascending: true });

  const nextRideByUser = new Map<string, { id: string; title: string; date: string | null }>();
  for (const row of upcomingRows ?? []) {
    const ride = row.ride as {
      id: string;
      title: string | null;
      ride_date: string | null;
      status: string;
    } | null;
    if (!ride || ride.status !== "upcoming" || !ride.ride_date || ride.ride_date < today) {
      continue;
    }
    const existing = nextRideByUser.get(row.user_id);
    if (!existing || ride.ride_date < (existing.date ?? "9999-99-99")) {
      nextRideByUser.set(row.user_id, {
        id: ride.id,
        title: ride.title ?? "a ride",
        date: ride.ride_date,
      });
    }
  }

  const fellows: FellowRider[] = [];
  for (const riderId of coRiderIds) {
    const profile = profileById.get(riderId);
    const nextRide = nextRideByUser.get(riderId);
    if (!profile || !nextRide) {
      continue;
    }
    fellows.push({
      profile,
      nextRideId: nextRide.id,
      nextRideTitle: nextRide.title,
      nextRideDate: nextRide.date,
    });
  }

  return fellows
    .sort((a, b) => (a.nextRideDate ?? "").localeCompare(b.nextRideDate ?? ""))
    .slice(0, limit);
}

export interface WeekendRider {
  profile: Tables<"profiles">;
  rideId: string;
  rideTitle: string;
  rideDate: string;
}

export interface WeekendActivity {
  ridersCount: number;
  rideCount: number;
  roster: WeekendRider[];
}

// Drives the "N riders are riding this weekend" hero stat and the "Who's
// riding this weekend" roster — there's no dedicated rollup for this, so it
// pages through ride_members joined to rides + profiles and filters/dedupes
// in application code, same pattern as popular-destination grouping.
export async function getWeekendActivity(rosterLimit = 8): Promise<WeekendActivity> {
  const supabase = await createClient();
  const { start, end } = getUpcomingWeekendRange();

  const { data } = await supabase
    .from("ride_members")
    .select(
      "joined_at, user_id, profile:profiles!ride_members_user_id_fkey(*), ride:rides!ride_members_ride_id_fkey(id, title, ride_date, status)",
    )
    .order("joined_at", { ascending: false })
    .limit(400);

  const weekendRows = (data ?? []).filter((row) => {
    const ride = row.ride as { ride_date: string | null; status: string } | null;
    return (
      ride &&
      ride.status === "upcoming" &&
      ride.ride_date &&
      ride.ride_date >= start &&
      ride.ride_date <= end
    );
  });

  const riderIds = new Set(weekendRows.map((row) => row.user_id));
  const rideIds = new Set(
    weekendRows.map((row) => (row.ride as { id: string }).id).filter(Boolean),
  );

  const seenRiders = new Set<string>();
  const roster: WeekendRider[] = [];
  for (const row of weekendRows) {
    if (!row.profile || seenRiders.has(row.user_id)) {
      continue;
    }
    const ride = row.ride as { id: string; title: string | null; ride_date: string };
    seenRiders.add(row.user_id);
    roster.push({
      profile: row.profile as Tables<"profiles">,
      rideId: ride.id,
      rideTitle: ride.title ?? "a ride",
      rideDate: ride.ride_date,
    });
    if (roster.length >= rosterLimit) {
      break;
    }
  }

  return { ridersCount: riderIds.size, rideCount: rideIds.size, roster };
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
