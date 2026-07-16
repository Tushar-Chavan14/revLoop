import { notFound, redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { updateRide } from "@/features/rides/actions/ride-actions";
import { RideForm } from "@/features/rides/components/ride-form";
import { getAuthUser } from "@/services/profiles";
import { getRideById } from "@/services/rides";

export const metadata = {
  title: "Edit ride",
};

type EditRidePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditRidePage({ params }: EditRidePageProps) {
  const { id } = await params;

  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }

  const ride = await getRideById(id);
  if (!ride) {
    notFound();
  }
  if (ride.organizer_id !== user.id) {
    redirect(`/rides/${id}`);
  }

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Edit ride</h1>
        </div>
        <RideForm
          mode="edit"
          action={updateRide.bind(null, id)}
          initialCoverImageUrl={ride.cover_image_url}
          initialValues={{
            title: ride.title ?? "",
            description: ride.description ?? "",
            rideDate: ride.ride_date ?? "",
            departureTime: ride.departure_time?.slice(0, 5) ?? "",
            meetingPoint: ride.meeting_point ?? "",
            meetingLat: ride.meeting_lat,
            meetingLng: ride.meeting_lng,
            destination: ride.destination ?? "",
            destinationLat: ride.destination_lat,
            destinationLng: ride.destination_lng,
            destinationMapUrl: ride.destination_map_url ?? "",
            city: ride.city ?? "",
            maxRiders: ride.max_riders ?? 10,
            rideType: ride.ride_type ?? "",
            speed: ride.speed ?? "",
            difficulty: ride.difficulty ?? "",
            breakfastStop: ride.breakfast_stop ?? false,
            fuelStop: ride.fuel_stop ?? false,
            helmetRequired: ride.helmet_required ?? true,
            pillionAllowed: ride.pillion_allowed ?? true,
            estimatedDistanceKm: ride.estimated_distance_km ?? undefined,
            estimatedDurationDays:
              ride.estimated_duration_minutes != null
                ? ride.estimated_duration_minutes < 24 * 60
                  ? 1
                  : Math.round(ride.estimated_duration_minutes / (24 * 60))
                : undefined,
            estimatedDurationHours:
              ride.estimated_duration_minutes != null && ride.estimated_duration_minutes < 24 * 60
                ? Math.round(ride.estimated_duration_minutes / 60)
                : undefined,
          }}
        />
      </div>
    </div>
  );
}
