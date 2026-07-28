"use server";

import { getJoinedRideIds } from "@/services/ride-participation";
import { listRides, type RideFilters, type RideListResult } from "@/services/rides";

export async function loadMoreRides(
  filters: RideFilters,
  page: number,
  userId?: string | null,
): Promise<RideListResult & { joinedRideIds: string[] }> {
  const result = await listRides({ ...filters, page });
  const rideIds = result.rides.map((ride) => ride.id).filter((id): id is string => id !== null);
  const joinedRideIds = userId ? await getJoinedRideIds(userId, rideIds) : [];
  return { ...result, joinedRideIds };
}
