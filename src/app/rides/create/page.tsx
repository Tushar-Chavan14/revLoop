import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { createRide } from "@/features/rides/actions/ride-actions";
import { RideForm } from "@/features/rides/components/ride-form";
import { getAuthUser, getProfileByUserId } from "@/services/profiles";
import { getPayoutDetails, hasPayoutDetails } from "@/services/organizer-payout";
import { isProfileComplete } from "@/utils/profile-completeness";

export const metadata = {
  title: "Create A Ride",
};

export default async function CreateRidePage() {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }

  const profile = await getProfileByUserId(user.id);
  if (!isProfileComplete(profile)) {
    redirect("/profile/setup");
  }

  const payoutDetails = await getPayoutDetails(user.id);

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Plan Your Next Adventure
          </h1>
          <p className="text-muted-foreground">
            A few steps and your ride is live for the whole community to join.
          </p>
        </div>
        <RideForm
          mode="create"
          action={createRide}
          hasPayoutDetails={hasPayoutDetails(payoutDetails)}
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
            estimatedDurationDays: undefined,
            estimatedDurationHours: undefined,
            pricingModel: "community",
            rideFee: undefined,
            bookingDeadline: undefined,
            minimumRiders: undefined,
            cancellationPolicy: undefined,
            inclusions: [],
            exclusions: [],
            itinerary: [],
          }}
        />
      </div>
    </div>
  );
}
