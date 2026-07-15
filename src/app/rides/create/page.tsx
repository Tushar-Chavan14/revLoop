import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { createRide } from "@/features/rides/actions/ride-actions";
import { RideForm } from "@/features/rides/components/ride-form";
import { getAuthUser, getProfileByUserId } from "@/services/profiles";
import { isProfileComplete } from "@/utils/profile-completeness";

export default async function CreateRidePage() {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }

  const profile = await getProfileByUserId(user.id);
  if (!isProfileComplete(profile)) {
    redirect("/profile/setup");
  }

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Create a ride</h1>
          <p className="text-muted-foreground">Plan your next ride and invite riders to join.</p>
        </div>
        <RideForm
          mode="create"
          action={createRide}
          initialValues={{
            title: "",
            description: "",
            rideDate: "",
            departureTime: "",
            meetingPoint: "",
            meetingLat: null,
            meetingLng: null,
            destination: "",
            destinationLat: null,
            destinationLng: null,
            destinationMapUrl: "",
            city: "",
            maxRiders: 10,
            rideType: "",
            speed: "",
            difficulty: "",
            breakfastStop: false,
            fuelStop: false,
            helmetRequired: true,
            pillionAllowed: true,
            estimatedDistanceKm: undefined,
            estimatedDurationMinutes: undefined,
          }}
        />
      </div>
    </div>
  );
}
