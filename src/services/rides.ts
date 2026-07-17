import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Enums, Tables } from "@/types/supabase";
import { haversineKm } from "@/utils/geo";

// A radius wide enough to cover a metro/tricity cluster (e.g. Chandigarh +
// Panchkula + Mohali + Zirakpur are all within ~20km of each other) without
// pulling in genuinely distant cities.
const NEARBY_RADIUS_KM = 50;

export type RideWithStats = Tables<"rides_with_stats">;
export type RideOrganizer = Pick<
  Tables<"profiles">,
  "id" | "name" | "username" | "profile_image_url"
>;
export type RideWithOrganizer = RideWithStats & { organizer: RideOrganizer | null };

const RIDE_WITH_ORGANIZER_SELECT =
  "*, organizer:profiles!rides_organizer_id_fkey(id, name, username, profile_image_url)";

export type RideSort = "soonest" | "newest" | "seats";

export interface RideFilters {
  search?: string;
  cityLat?: number;
  cityLng?: number;
  /** Ride's own trip length (estimated_distance_km), not the city-search radius. */
  distanceMinKm?: number;
  distanceMaxKm?: number;
  rideTypes?: Enums<"ride_type">[];
  speed?: Enums<"speed_level">;
  difficulty?: Enums<"rider_level">;
  dateFrom?: string;
  dateTo?: string;
  openSeatsOnly?: boolean;
  sort?: RideSort;
  page?: number;
  pageSize?: number;
}

export interface RideListResult {
  rides: RideWithOrganizer[];
  total: number;
  page: number;
  pageSize: number;
}

// PostgREST's `.or()` filter syntax uses commas/parens as separators — strip
// them from free-text search so a stray character can't break the filter.
function sanitizeForOrFilter(value: string) {
  return value.replace(/[,()]/g, " ").trim();
}

export async function listRides(filters: RideFilters = {}): Promise<RideListResult> {
  const supabase = await createClient();
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = filters.pageSize ?? 9;
  const today = new Date().toISOString().slice(0, 10);

  let query = supabase
    .from("rides_with_stats")
    .select(RIDE_WITH_ORGANIZER_SELECT, { count: "exact" })
    .eq("status", "upcoming")
    .gte("ride_date", filters.dateFrom || today);

  const search = filters.search ? sanitizeForOrFilter(filters.search) : "";
  if (search) {
    query = query.or(
      `title.ilike.%${search}%,destination.ilike.%${search}%,city.ilike.%${search}%,meeting_point.ilike.%${search}%`,
    );
  }
  if (filters.rideTypes && filters.rideTypes.length > 0) {
    query = query.in("ride_type", filters.rideTypes);
  }
  if (filters.speed) {
    query = query.eq("speed", filters.speed);
  }
  if (filters.difficulty) {
    query = query.eq("difficulty", filters.difficulty);
  }
  if (filters.dateTo) {
    query = query.lte("ride_date", filters.dateTo);
  }
  if (filters.openSeatsOnly) {
    query = query.gt("seats_available", 0);
  }
  if (filters.distanceMinKm !== undefined) {
    query = query.gte("estimated_distance_km", filters.distanceMinKm);
  }
  if (filters.distanceMaxKm !== undefined) {
    query = query.lte("estimated_distance_km", filters.distanceMaxKm);
  }

  if (filters.sort === "newest") {
    query = query.order("created_at", { ascending: false });
  } else if (filters.sort === "seats") {
    query = query.order("seats_available", { ascending: false, nullsFirst: false });
  } else {
    query = query.order("ride_date", { ascending: true }).order("departure_time", {
      ascending: true,
    });
  }

  const hasCityCenter = filters.cityLat !== undefined && filters.cityLng !== undefined;

  if (!hasCityCenter) {
    const from = (page - 1) * pageSize;
    const { data, count } = await query.range(from, from + pageSize - 1);
    return {
      rides: (data ?? []) as RideWithOrganizer[],
      total: count ?? 0,
      page,
      pageSize,
    };
  }

  // Radius search can't be expressed as a PostgREST filter, so fetch every
  // ride matching the other filters (no DB-side pagination) and filter/slice
  // by great-circle distance in application code instead.
  const { data } = await query;
  const cityLat = filters.cityLat!;
  const cityLng = filters.cityLng!;

  const nearby = ((data ?? []) as RideWithOrganizer[]).filter(
    (ride) =>
      ride.meeting_lat !== null &&
      ride.meeting_lng !== null &&
      haversineKm(cityLat, cityLng, ride.meeting_lat, ride.meeting_lng) <= NEARBY_RADIUS_KM,
  );

  const from = (page - 1) * pageSize;
  return {
    rides: nearby.slice(from, from + pageSize),
    total: nearby.length,
    page,
    pageSize,
  };
}

export interface CommunityStats {
  ridersCount: number;
  upcomingRidesCount: number;
  citiesCount: number;
}

export async function getCommunityStats(): Promise<CommunityStats> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [{ count: ridersCount }, { count: upcomingRidesCount }, { data: cityRows }] =
    await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase
        .from("rides")
        .select("id", { count: "exact", head: true })
        .eq("status", "upcoming")
        .gte("ride_date", today),
      supabase.from("rides").select("city").eq("status", "upcoming"),
    ]);

  const citiesCount = new Set((cityRows ?? []).map((row) => row.city).filter(Boolean)).size;

  return {
    ridersCount: ridersCount ?? 0,
    upcomingRidesCount: upcomingRidesCount ?? 0,
    citiesCount,
  };
}

// cache() dedupes within a single request — the ride detail page calls this
// from both generateMetadata and the page component.
export const getRideById = cache(async (id: string): Promise<RideWithOrganizer | null> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("rides_with_stats")
    .select(RIDE_WITH_ORGANIZER_SELECT)
    .eq("id", id)
    .maybeSingle();
  return data as RideWithOrganizer | null;
});

export async function getUpcomingRides(limit = 6): Promise<RideWithOrganizer[]> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("rides_with_stats")
    .select(RIDE_WITH_ORGANIZER_SELECT)
    .eq("status", "upcoming")
    .gte("ride_date", today)
    .order("ride_date", { ascending: true })
    .limit(limit);
  return (data ?? []) as RideWithOrganizer[];
}

// The next ride on this rider's own calendar, whether they organized it or
// just joined — ride_members has a row for the organizer too, so their own
// rides already show up here without a separate lookup. Can be upcoming
// *or* ongoing — a cron sweep + an attendance-marking trigger keep
// `rides.status` itself accurate, so it's trusted directly here.
export async function getMyNextRide(userId: string): Promise<RideWithOrganizer | null> {
  const supabase = await createClient();

  const { data: memberRows } = await supabase
    .from("ride_members")
    .select("ride_id")
    .eq("user_id", userId);
  const rideIds = [...new Set((memberRows ?? []).map((row) => row.ride_id))];
  if (rideIds.length === 0) {
    return null;
  }

  const { data } = await supabase
    .from("rides_with_stats")
    .select(RIDE_WITH_ORGANIZER_SELECT)
    .in("id", rideIds)
    .in("status", ["upcoming", "ongoing"])
    .order("ride_date", { ascending: true })
    .order("departure_time", { ascending: true })
    .limit(1)
    .maybeSingle();

  return data as RideWithOrganizer | null;
}

export interface MyRides {
  upcoming: RideWithOrganizer[];
  ongoing: RideWithOrganizer[];
  completed: RideWithOrganizer[];
  cancelled: RideWithOrganizer[];
}

// Every ride this rider has organized or joined, grouped for the "My Rides"
// timeline by its DB `status` — kept accurate by a cron sweep (time-elapsed)
// and an attendance-marking trigger (instant), so it's trusted directly.
export async function getMyRides(userId: string): Promise<MyRides> {
  const supabase = await createClient();

  const { data: memberRows } = await supabase
    .from("ride_members")
    .select("ride_id")
    .eq("user_id", userId);
  const rideIds = [...new Set((memberRows ?? []).map((row) => row.ride_id))];
  if (rideIds.length === 0) {
    return { upcoming: [], ongoing: [], completed: [], cancelled: [] };
  }

  const { data } = await supabase
    .from("rides_with_stats")
    .select(RIDE_WITH_ORGANIZER_SELECT)
    .in("id", rideIds)
    .order("ride_date", { ascending: false });

  const rides = (data ?? []) as RideWithOrganizer[];
  const grouped: MyRides = { upcoming: [], ongoing: [], completed: [], cancelled: [] };
  for (const ride of rides) {
    grouped[ride.status ?? "upcoming"].push(ride);
  }
  grouped.upcoming.reverse(); // soonest first — everything else stays newest-first

  return grouped;
}

export interface OrganizerRides {
  upcoming: RideWithOrganizer[];
  past: RideWithOrganizer[];
}

export async function getRidesByOrganizer(organizerId: string): Promise<OrganizerRides> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("rides_with_stats")
    .select(RIDE_WITH_ORGANIZER_SELECT)
    .eq("organizer_id", organizerId)
    .order("ride_date", { ascending: true });

  const rides = (data ?? []) as RideWithOrganizer[];
  const isUpcoming = (ride: RideWithOrganizer) =>
    ride.status === "upcoming" && (ride.ride_date ?? "") >= today;

  return {
    upcoming: rides.filter(isUpcoming),
    past: rides.filter((ride) => !isUpcoming(ride)).reverse(),
  };
}

export async function getOrganizedRidesCount(organizerId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("rides")
    .select("id", { count: "exact", head: true })
    .eq("organizer_id", organizerId);
  return count ?? 0;
}

export async function getRecentRides(limit = 6): Promise<RideWithOrganizer[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("rides_with_stats")
    .select(RIDE_WITH_ORGANIZER_SELECT)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as RideWithOrganizer[];
}

export interface DestinationSummary {
  city: string;
  rideCount: number;
  lat: number;
  lng: number;
}

// The single ride the hero banner leads with — favors what's happening soon
// and already has momentum (riders joined) over a ride nobody's noticed yet.
export async function getFeaturedRide(): Promise<RideWithOrganizer | null> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("rides_with_stats")
    .select(RIDE_WITH_ORGANIZER_SELECT)
    .eq("status", "upcoming")
    .gte("ride_date", today)
    .gt("member_count", 1)
    .order("member_count", { ascending: false })
    .order("ride_date", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (data) {
    return data as RideWithOrganizer;
  }

  // No ride has other riders yet (new/quiet community) — fall back to
  // whatever's soonest so the hero always has something to show.
  const { data: soonest } = await supabase
    .from("rides_with_stats")
    .select(RIDE_WITH_ORGANIZER_SELECT)
    .eq("status", "upcoming")
    .gte("ride_date", today)
    .order("ride_date", { ascending: true })
    .limit(1)
    .maybeSingle();
  return soonest as RideWithOrganizer | null;
}

export async function getRidesInCity(
  city: string,
  excludeRideIds: string[] = [],
  limit = 4,
): Promise<RideWithOrganizer[]> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  let query = supabase
    .from("rides_with_stats")
    .select(RIDE_WITH_ORGANIZER_SELECT)
    .eq("status", "upcoming")
    .eq("city", city)
    .gte("ride_date", today)
    .order("ride_date", { ascending: true })
    .limit(limit);

  if (excludeRideIds.length > 0) {
    query = query.not("id", "in", `(${excludeRideIds.join(",")})`);
  }

  const { data } = await query;
  return (data ?? []) as RideWithOrganizer[];
}

export type RideImage = Tables<"ride_images">;

export async function getRideImages(rideId: string): Promise<RideImage[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ride_images")
    .select("*")
    .eq("ride_id", rideId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

// A rider's photo wall — every image posted to a ride they organized or
// joined, newest first. Empty until the (not-yet-built) upload flow ships.
export async function getRiderGalleryImages(userId: string, limit = 12): Promise<RideImage[]> {
  const supabase = await createClient();
  const { data: memberRows } = await supabase
    .from("ride_members")
    .select("ride_id")
    .eq("user_id", userId);
  const rideIds = [...new Set((memberRows ?? []).map((row) => row.ride_id))];
  if (rideIds.length === 0) {
    return [];
  }

  const { data } = await supabase
    .from("ride_images")
    .select("*")
    .in("ride_id", rideIds)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export interface CommunityActivityItem {
  id: string;
  timestamp: string;
  actorName: string;
  actorImage: string | null;
  rideId: string;
  rideTitle: string;
  kind: "created";
}

// A lightweight public feed — recently created rides — built from
// existing tables rather than a dedicated activity log.
export async function getCommunityActivity(limit = 8): Promise<CommunityActivityItem[]> {
  const supabase = await createClient();

  const { data: created } = await supabase
    .from("rides_with_stats")
    .select(RIDE_WITH_ORGANIZER_SELECT)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (created as RideWithOrganizer[])
    .filter((ride) => ride.id && ride.created_at)
    .map((ride) => ({
      id: `created-${ride.id}`,
      timestamp: ride.created_at as string,
      actorName: ride.organizer?.name ?? "A rider",
      actorImage: ride.organizer?.profile_image_url ?? null,
      rideId: ride.id as string,
      rideTitle: ride.title ?? "a ride",
      kind: "created" as const,
    }));
}

export async function getPopularDestinations(limit = 6): Promise<DestinationSummary[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("rides")
    .select("city, meeting_lat, meeting_lng")
    .eq("status", "upcoming");

  const groups = new Map<string, { count: number; latSum: number; lngSum: number }>();
  for (const row of data ?? []) {
    if (!row.city || row.meeting_lat === null || row.meeting_lng === null) {
      continue;
    }
    const group = groups.get(row.city) ?? { count: 0, latSum: 0, lngSum: 0 };
    group.count += 1;
    group.latSum += row.meeting_lat;
    group.lngSum += row.meeting_lng;
    groups.set(row.city, group);
  }

  return [...groups.entries()]
    .map(([city, group]) => ({
      city,
      rideCount: group.count,
      lat: group.latSum / group.count,
      lng: group.lngSum / group.count,
    }))
    .sort((a, b) => b.rideCount - a.rideCount)
    .slice(0, limit);
}

export interface TripDestinationSummary {
  destination: string;
  rideCount: number;
  lat: number;
  lng: number;
}

// Where rides are actually headed — distinct from getPopularDestinations,
// which groups by the ride's meeting city (used for "search rides near me").
// This is what the landing page's "Popular destinations" rail should show.
export async function getPopularTripDestinations(limit = 6): Promise<TripDestinationSummary[]> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("rides")
    .select("destination, destination_lat, destination_lng")
    .eq("status", "upcoming")
    .gte("ride_date", today);

  const groups = new Map<string, { count: number; latSum: number; lngSum: number }>();
  for (const row of data ?? []) {
    if (!row.destination || row.destination_lat === null || row.destination_lng === null) {
      continue;
    }
    const group = groups.get(row.destination) ?? { count: 0, latSum: 0, lngSum: 0 };
    group.count += 1;
    group.latSum += row.destination_lat;
    group.lngSum += row.destination_lng;
    groups.set(row.destination, group);
  }

  return [...groups.entries()]
    .map(([destination, group]) => ({
      destination,
      rideCount: group.count,
      lat: group.latSum / group.count,
      lng: group.lngSum / group.count,
    }))
    .sort((a, b) => b.rideCount - a.rideCount)
    .slice(0, limit);
}
