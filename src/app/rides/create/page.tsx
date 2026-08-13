import { redirect } from "next/navigation";
import { PageHeading } from "@/components/design-system/page-heading";
import { SiteHeader } from "@/components/site-header";
import { createRide } from "@/features/rides/actions/ride-actions";
import { RideForm } from "@/features/rides/components/ride-form";
import { getAuthUser, getProfileByUserId } from "@/services/profiles";
import { getPayoutDetails, hasPayoutDetails } from "@/services/organizer-payout";
import { getMyRole } from "@/services/roles";
import { isProfileComplete } from "@/utils/profile-completeness";

export const metadata = {
  title: "Create A Ride",
};

export default async function CreateRidePage() {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }

  const [profile, role] = await Promise.all([getProfileByUserId(user.id), getMyRole()]);
  if (role === "admin") {
    redirect("/admin/settlements");
  }
  if (!isProfileComplete(profile, role)) {
    redirect("/profile/setup");
  }

  const pricingModel = role === "organizer" ? "organized" : "community";
  const payoutDetails = await getPayoutDetails(user.id);

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
        <PageHeading
          eyebrow="Post A Ride"
          title="Plan your next adventure"
          description="A few steps and your ride is live for your whole road family to join."
        />
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
            pricingModel,
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
