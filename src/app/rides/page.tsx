import Link from "next/link";
import { CalendarSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { RIDE_TYPES } from "@/constants/ride-type";
import { SPEED_LEVELS } from "@/constants/speed-level";
import { RIDER_LEVELS } from "@/constants/rider-level";
import { RideCard } from "@/features/rides/components/ride-card";
import { RidesFilters } from "@/features/rides/components/rides-filters";
import {
  getPopularDestinations,
  listRides,
  type RideFilters,
  type RideSort,
} from "@/services/rides";
import type { Enums } from "@/types/supabase";

const RIDE_TYPE_VALUES = new Set<string>(RIDE_TYPES.map((type) => type.value));
const SPEED_VALUES = new Set<string>(SPEED_LEVELS.map((level) => level.value));
const RIDER_LEVEL_VALUES = new Set<string>(RIDER_LEVELS.map((level) => level.value));
const SORT_VALUES = new Set<RideSort>(["soonest", "newest", "seats"]);

// Mirrors the DISTANCE_OPTIONS buckets in RidesFilters — the ride's own trip
// length (estimated_distance_km), not the fixed city-search radius.
const DISTANCE_BUCKETS: Record<string, { min?: number; max?: number }> = {
  "0-50": { max: 50 },
  "50-150": { min: 50, max: 150 },
  "150-300": { min: 150, max: 300 },
  "300+": { min: 300 },
};

type RidesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseFilters(params: Record<string, string | string[] | undefined>): RideFilters {
  const types = first(params.types)
    ?.split(",")
    .filter((value): value is Enums<"ride_type"> => RIDE_TYPE_VALUES.has(value));
  const speed = first(params.speed);
  const difficulty = first(params.difficulty);
  const sort = first(params.sort);
  const page = Number(first(params.page));
  const cityLat = Number(first(params.cityLat));
  const cityLng = Number(first(params.cityLng));
  const distanceBucket = first(params.distance);
  const distanceRange = distanceBucket ? DISTANCE_BUCKETS[distanceBucket] : undefined;

  return {
    search: first(params.q),
    cityLat: Number.isFinite(cityLat) && first(params.cityLat) ? cityLat : undefined,
    cityLng: Number.isFinite(cityLng) && first(params.cityLng) ? cityLng : undefined,
    distanceMinKm: distanceRange?.min,
    distanceMaxKm: distanceRange?.max,
    rideTypes: types && types.length > 0 ? types : undefined,
    speed: speed && SPEED_VALUES.has(speed) ? (speed as Enums<"speed_level">) : undefined,
    difficulty:
      difficulty && RIDER_LEVEL_VALUES.has(difficulty)
        ? (difficulty as Enums<"rider_level">)
        : undefined,
    dateFrom: first(params.from),
    dateTo: first(params.to),
    openSeatsOnly: first(params.seats) === "1",
    sort: sort && SORT_VALUES.has(sort as RideSort) ? (sort as RideSort) : undefined,
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

function buildPageHref(params: Record<string, string | string[] | undefined>, page: number) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const resolved = first(value);
    if (resolved) {
      search.set(key, resolved);
    }
  }
  search.set("page", String(page));
  return `/rides?${search.toString()}`;
}

export default async function RidesPage({ searchParams }: RidesPageProps) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const cityLabel = first(params.cityLabel);
  const [{ rides, total, page, pageSize }, cityOptions] = await Promise.all([
    listRides(filters),
    getPopularDestinations(50),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col gap-8 px-6 py-12">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            {cityLabel ? `Rides near ${cityLabel}` : "Discover rides"}
          </h1>
          <p className="text-muted-foreground">
            {cityLabel
              ? "Includes rides in and around this city."
              : "Filter by type, speed, and date to find your next weekend loop."}
          </p>
        </div>

        <div className="mx-auto w-full max-w-6xl">
          <RidesFilters cityOptions={cityOptions} />
        </div>

        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
          <p className="text-muted-foreground text-sm">
            {total} ride{total === 1 ? "" : "s"} found
          </p>

          {rides.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rides.map((ride) => (
                <RideCard key={ride.id} ride={ride} />
              ))}
            </div>
          ) : (
            <div className="border-border flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
              <CalendarSearch className="text-muted-foreground size-8" />
              <p className="text-muted-foreground">
                No rides match those filters — try widening your search.
              </p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <Button
                nativeButton={false}
                variant="outline"
                size="sm"
                disabled={page <= 1}
                render={<Link href={buildPageHref(params, page - 1)}>Previous</Link>}
              />
              <p className="text-muted-foreground text-sm">
                Page {page} of {totalPages}
              </p>
              <Button
                nativeButton={false}
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                render={<Link href={buildPageHref(params, page + 1)}>Next</Link>}
              />
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
