"use server";

import { getAuthUser } from "@/services/profiles";
import { getJoinedRideIds } from "@/services/ride-participation";
import { getMyRole } from "@/services/roles";
import { listRides, type RideFilters, type RideListResult } from "@/services/rides";

export async function loadMoreRides(
  filters: RideFilters,
  page: number,
): Promise<RideListResult & { joinedRideIds: string[] }> {
  // Identity comes from the session, never the client — and the same
  // organizer-only scoping RidesPage applies is re-applied here, since the
  // filters object round-trips through the browser.
  const user = await getAuthUser();
  const isOrganizerViewer = user ? (await getMyRole()) === "organizer" : false;
  const scopedFilters: RideFilters = isOrganizerViewer
    ? { ...filters, pricingModel: "organized", excludeOrganizerId: user!.id }
    : filters;

  const result = await listRides({ ...scopedFilters, page });
  const rideIds = result.rides.map((ride) => ride.id).filter((id): id is string => id !== null);
  const joinedRideIds = user ? await getJoinedRideIds(user.id, rideIds) : [];
  return { ...result, joinedRideIds };
}
