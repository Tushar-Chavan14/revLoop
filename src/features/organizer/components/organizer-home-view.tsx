import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { Compass, MapPin, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import { InstallAppCard } from "@/features/app-install/components/install-app-card";

export async function OrganizerHomeView({ profile }: { profile: Profile }) {
  const userId = profile.id;
  const [
    organizerDetails,
    organizedCount,
    nextRide,
    { upcoming },
    recentMessages,
    payoutDetails,
    pendingSettlement,
  ] = await Promise.all([
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
          <div className="bg-secondary size-16 shrink-0 overflow-hidden rounded-full">
            {profile.profile_image_url && (
              <Image
                src={profile.profile_image_url}
                alt={displayName}
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div>
            <h1 className="font-display text-[2.5rem] text-balance sm:text-5xl">{displayName}</h1>
            <p className="text-muted-foreground text-sm">
              Organizer ·{" "}
              <Link href={`/riders/${profile.username}`} className="hover:underline">
                @{profile.username} · View public profile
              </Link>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            nativeButton={false}
            render={<Link href="/profile/edit">Edit profile</Link>}
            variant="outline"
            size="sm"
          />
          <form action={signOut}>
            <Button type="submit" variant="ghost" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </div>

      <InstallAppCard />

      {/* Next ride hero */}
      {nextRide ? (
        <section className="bg-secondary text-secondary-foreground rounded-md p-8 sm:p-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-3">
              {nextRide.status === "ongoing" ? (
                <StatusChip
                  status="live"
                  pulse
                  className="w-fit border-white/20 bg-white/10 text-white"
                >
                  Ride in progress
                </StatusChip>
              ) : null}
              <h2 className="font-display text-4xl text-white sm:text-5xl">{nextRide.title}</h2>
              <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/75">
                {nextRide.status !== "ongoing" && (
                  <span className="font-semibold text-white">Your next ride</span>
                )}
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-white/50" />
                  {nextRide.destination}
                </span>
                {nextRide.ride_date && (
                  <span className="tabular-nums">
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
                    className="font-display text-6xl text-white tabular-nums sm:text-7xl"
                  />
                  <span className="text-sm text-white/75">until kickstands up</span>
                </div>
              )}
              <Button
                nativeButton={false}
                render={<Link href={`/rides/${nextRide.id}`}>View ride</Link>}
              />
            </div>
          </div>
        </section>
      ) : (
        <EmptyState
          title="No rides live yet"
          description="Host your first organized ride and get it in front of riders."
          action={
            <Button nativeButton={false} render={<Link href="/rides/create">Host a ride</Link>} />
          }
        />
      )}

      {/* Stats row */}
      <dl className="bg-card grid grid-cols-2 gap-x-6 gap-y-5 rounded-md p-5 sm:grid-cols-4">
        <div className="flex flex-col gap-1">
          <dt className="text-muted-foreground text-sm">Rides organized</dt>
          <dd className="text-2xl font-bold tabular-nums">{organizedCount}</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-muted-foreground text-sm">Upcoming rides</dt>
          <dd className="text-2xl font-bold tabular-nums">{upcoming.length}</dd>
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <dt className="text-muted-foreground text-sm">Based in</dt>
          <dd className="text-base font-semibold break-words">
            {[profile.city, profile.country].filter(Boolean).join(", ") || "—"}
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-muted-foreground text-sm">Awaiting settlement</dt>
          <dd className="text-base font-semibold tabular-nums">
            {pendingSettlement.count > 0
              ? `₹${pendingSettlement.totalOwed.toFixed(2)} · ${pendingSettlement.count} paid`
              : "None"}
          </dd>
        </div>
      </dl>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-8 lg:col-span-2">
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">
                <Compass className="text-muted-foreground mr-1.5 inline size-4" />
                Your rides
              </h2>
              <Button
                nativeButton={false}
                variant="ghost"
                size="sm"
                render={<Link href="/profile/rides">See all</Link>}
              />
            </div>
            {upcoming.length > 0 ? (
              <div className="flex flex-col gap-2">
                {upcoming.slice(0, 6).map((ride) => (
                  <Link
                    key={ride.id}
                    href={`/rides/${ride.id}`}
                    className="bg-card hover:bg-muted flex items-center justify-between gap-3 rounded-md px-4 py-3 text-sm transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{ride.title}</p>
                      <p className="text-muted-foreground truncate text-sm tabular-nums">
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
            <h2 className="flex items-center gap-1.5 text-lg font-bold">
              <MessageSquare className="text-muted-foreground size-4" />
              Recent messages
            </h2>
            {recentMessages.length > 0 ? (
              <div className="flex flex-col gap-1">
                {recentMessages.map((message) => (
                  <Link
                    key={message.id}
                    href={`/chats/${message.rideId}`}
                    className="hover:bg-muted -mx-2 flex items-start gap-2.5 rounded-md px-2 py-2"
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
                      <p className="text-muted-foreground truncate text-sm">
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
