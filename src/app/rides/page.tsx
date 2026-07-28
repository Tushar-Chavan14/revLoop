import { PageHeading } from "@/components/design-system/page-heading";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { RIDE_TYPES } from "@/constants/ride-type";
import { SPEED_LEVELS } from "@/constants/speed-level";
import { RIDER_LEVELS } from "@/constants/rider-level";
import { RidesExplorer } from "@/features/rides/components/rides-explorer";
import { RidesFilters } from "@/features/rides/components/rides-filters";
import { getAuthUser } from "@/services/profiles";
import { getJoinedRideIds } from "@/services/ride-participation";
import {
  getPopularDestinations,
  listRides,
  type RideFilters,
  type RideSort,
} from "@/services/rides";
import type { Enums } from "@/types/supabase";

export const metadata = {
  title: "Discover Rides",
  description:
    "Browse upcoming motorcycle group rides near your city — breakfast runs, weekend loops, touring, and off-road. Filter by type, pace, distance, and date.",
};

const RIDE_TYPE_VALUES = new Set<string>(RIDE_TYPES.map((type) => type.value));
const SPEED_VALUES = new Set<string>(SPEED_LEVELS.map((level) => level.value));
const RIDER_LEVEL_VALUES = new Set<string>(RIDER_LEVELS.map((level) => level.value));
const SORT_VALUES = new Set<RideSort>(["soonest", "newest", "seats"]);
const PRICING_MODEL_VALUES = new Set<string>(["community", "organized"]);

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
  const pricingModel = first(params.pricing);
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
    pricingModel:
      pricingModel && PRICING_MODEL_VALUES.has(pricingModel)
        ? (pricingModel as Enums<"pricing_model">)
        : undefined,
    dateFrom: first(params.from),
    dateTo: first(params.to),
    openSeatsOnly: first(params.seats) === "1",
    sort: sort && SORT_VALUES.has(sort as RideSort) ? (sort as RideSort) : undefined,
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

export default async function RidesPage({ searchParams }: RidesPageProps) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const cityLabel = first(params.cityLabel);
  const [user, result, cityOptions] = await Promise.all([
    getAuthUser(),
    listRides(filters),
    getPopularDestinations(50),
  ]);
  const joinedRideIds = user
    ? await getJoinedRideIds(
        user.id,
        result.rides.map((ride) => ride.id).filter((id): id is string => id !== null),
      )
    : [];

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col gap-6 px-6 py-10">
        <div className="mx-auto w-full max-w-6xl">
          <PageHeading
            eyebrow="Where Are We Riding?"
            title={cityLabel ? `Rides near ${cityLabel}` : "Discover rides"}
            description={
              cityLabel
                ? "Every ride rolling out in and around this city."
                : "Real riders, real routes — find the weekend ride with your name on it."
            }
          />
        </div>

        <div className="sticky top-16.25 z-30 mx-auto w-full max-w-6xl">
          <div className="bg-background/70 supports-backdrop-filter:bg-background/55 ring-border rounded-2xl p-2 shadow-lg ring-1 backdrop-blur-xl">
            <RidesFilters cityOptions={cityOptions} />
          </div>
        </div>

        <div className="mx-auto w-full max-w-6xl">
          <RidesExplorer
            key={JSON.stringify(filters)}
            initialResult={result}
            filters={filters}
            currentUserId={user?.id ?? null}
            initialJoinedRideIds={joinedRideIds}
          />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
