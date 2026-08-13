import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { Compass, IndianRupee, MapPin, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusChip } from "@/components/ui/status-chip";
import { EmptyState } from "@/components/design-system/state-panel";
import { RideCountdown } from "@/components/design-system/ride-countdown";
import { signOut } from "@/features/auth/actions/auth-actions";
import { BusinessDetailsCard } from "@/features/organizer/components/business-details-card";
import { PayoutSetupCard } from "@/features/profile/components/payout-setup-card";
import { getPayoutDetails } from "@/services/organizer-payout";
import { getOrganizerDetails } from "@/services/organizer-details";
import { getRecentMessagesForUser } from "@/services/ride-chat";
import { getOrganizerPendingSettlement } from "@/services/settlements";
import type { Profile } from "@/services/profiles";
import { getMyNextRide, getOrganizedRidesCount, getRidesByOrganizer } from "@/services/rides";

export async function OrganizerHomeView({ profile }: { profile: Profile }) {
  const userId = profile.id;
  const [organizerDetails, organizedCount, nextRide, { upcoming }, recentMessages, payoutDetails, pendingSettlement] =
    await Promise.all([
      getOrganizerDetails(userId),
      getOrganizedRidesCount(userId),
      getMyNextRide(userId),
      getRidesByOrganizer(userId),
      getRecentMessagesForUser(userId, 5),
      getPayoutDetails(userId),
      getOrganizerPendingSettlement(userId),
    ]);

  const displayName = organizerDetails?.business_name ?? profile.name;

  return (
    <>
      {/* Organizer identity */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-secondary ring-primary/10 size-16 shrink-0 overflow-hidden rounded-full ring-4">
            {profile.profile_image_url && (
              <Image
                src={profile.profile_image_url}
                alt={displayName}
                width={64}
                height={64}
                unoptimized
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div>
            <p className="text-telemetry text-primary text-[11px]">Organizer Home</p>
            <h1 className="font-heading text-2xl font-extrabold tracking-tight">{displayName}</h1>
            <Link
              href={`/riders/${profile.username}`}
              className="text-muted-foreground text-sm hover:underline"
            >
              @{profile.username} · View public profile
            </Link>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            nativeButton={false}
            render={<Link href="/profile/edit">Edit Profile</Link>}
            variant="outline"
            size="sm"
          />
          <form action={signOut}>
            <Button type="submit" variant="ghost" size="sm">
              Sign Out
            </Button>
          </form>
        </div>
      </div>

      {/* Next ride hero */}
      {nextRide ? (
        <section className="bg-secondary text-secondary-foreground relative overflow-hidden rounded-3xl p-8 sm:p-12">
          <div
            aria-hidden
            className="bg-primary/20 pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full blur-3xl"
          />
          <div aria-hidden className="bg-road-dashes absolute inset-x-0 top-0 h-px text-white/25" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-3">
              {nextRide.status === "ongoing" ? (
                <StatusChip status="live" pulse className="w-fit border-white/20 bg-white/10 text-white">
                  Ride In Progress
                </StatusChip>
              ) : (
                <p className="text-telemetry text-primary text-[11px]">Your Next Ride</p>
              )}
              <h2 className="font-display text-4xl text-white uppercase sm:text-5xl">
                {nextRide.title}
              </h2>
              <p className="text-secondary-foreground/70 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-white/50" />
                  {nextRide.destination}
                </span>
                {nextRide.ride_date && (
                  <span>
                    {format(new Date(nextRide.ride_date), "EEE, MMM d")}
                    {nextRide.departure_time && ` · ${nextRide.departure_time.slice(0, 5)}`}
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-8">
              {nextRide.status !== "ongoing" && (
                <div className="flex flex-col gap-1">
                  <RideCountdown
                    targetIso={`${nextRide.ride_date}T${nextRide.departure_time ?? "00:00"}`}
                    className="font-display text-6xl text-white sm:text-7xl"
                  />
                  <span className="text-telemetry text-secondary-foreground/60 text-[10px]">
                    until kickstands up
                  </span>
                </div>
              )}
              <Button
                nativeButton={false}
                render={<Link href={`/rides/${nextRide.id}`}>View Ride</Link>}
                className="bg-sunrise border-0 text-white"
              />
            </div>
          </div>
        </section>
      ) : (
        <EmptyState
          title="No Rides Live Yet"
          description="Host your first Organized Ride and get it in front of riders."
          action={
            <Button nativeButton={false} render={<Link href="/rides/create">Host A Ride</Link>} />
          }
        />
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card size="sm">
          <CardContent className="flex flex-col gap-1.5">
            <Compass className="text-muted-foreground size-4" />
            <p className="text-telemetry text-muted-foreground text-[10px]">Rides Organized</p>
            <p className="text-sm font-medium">{organizedCount}</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="flex flex-col gap-1.5">
            <Compass className="text-muted-foreground size-4" />
            <p className="text-telemetry text-muted-foreground text-[10px]">Upcoming Rides</p>
            <p className="text-sm font-medium">{upcoming.length}</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="flex flex-col gap-1.5">
            <MapPin className="text-muted-foreground size-4" />
            <p className="text-telemetry text-muted-foreground text-[10px]">Based In</p>
            <p className="text-sm font-medium">
              {[profile.city, profile.country].filter(Boolean).join(", ") || "—"}
            </p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="flex flex-col gap-1.5">
            <IndianRupee className="text-muted-foreground size-4" />
            <p className="text-telemetry text-muted-foreground text-[10px]">Awaiting Settlement</p>
            <p className="text-sm font-medium">
              {pendingSettlement.count > 0
                ? `₹${pendingSettlement.totalOwed.toFixed(2)} · ${pendingSettlement.count} paid`
                : "None"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-8 lg:col-span-2">
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold tracking-tight">
                <Compass className="text-muted-foreground mr-1.5 inline size-4" />
                Your Rides
              </h2>
              <Button
                nativeButton={false}
                variant="ghost"
                size="sm"
                render={<Link href="/profile/rides">See All</Link>}
              />
            </div>
            {upcoming.length > 0 ? (
              <div className="flex flex-col gap-2">
                {upcoming.slice(0, 6).map((ride) => (
                  <Link
                    key={ride.id}
                    href={`/rides/${ride.id}`}
                    className="border-border hover:border-primary/50 flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{ride.title}</p>
                      <p className="text-muted-foreground truncate text-xs">
                        {ride.ride_date && format(new Date(ride.ride_date), "EEE, MMM d")} ·{" "}
                        {ride.destination} · {ride.seats_available ?? 0} seats left
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No upcoming rides yet.</p>
            )}
          </section>

          <BusinessDetailsCard details={organizerDetails} />
        </div>

        <div className="flex flex-col gap-8">
          <section className="flex flex-col gap-3">
            <h2 className="font-heading flex items-center gap-1.5 text-lg font-bold tracking-tight">
              <MessageSquare className="text-muted-foreground size-4" />
              Recent Messages
            </h2>
            {recentMessages.length > 0 ? (
              <div className="flex flex-col gap-1">
                {recentMessages.map((message) => (
                  <Link
                    key={message.id}
                    href={`/rides/${message.rideId}/chat`}
                    className="hover:bg-muted -mx-2 flex items-start gap-2.5 rounded-lg px-2 py-2"
                  >
                    <Avatar size="sm">
                      <AvatarImage
                        src={message.sender?.profile_image_url ?? undefined}
                        alt={message.sender?.name ?? "Rider"}
                      />
                      <AvatarFallback>{message.sender?.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{message.rideTitle}</p>
                      <p className="text-muted-foreground truncate text-xs">
                        {message.sender?.name}: {message.body}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No messages yet.</p>
            )}
          </section>

          <div id="payout" className="scroll-mt-20">
            <PayoutSetupCard payoutDetails={payoutDetails} />
          </div>
        </div>
      </div>
    </>
  );
}
