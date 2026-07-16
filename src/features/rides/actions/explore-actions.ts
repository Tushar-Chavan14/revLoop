"use server";

import { listRides, type RideFilters, type RideListResult } from "@/services/rides";

export async function loadMoreRides(filters: RideFilters, page: number): Promise<RideListResult> {
  return listRides({ ...filters, page });
}
