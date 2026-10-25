import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { ChevronRight, Compass, MapPin, MessageSquare, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusChip } from "@/components/ui/status-chip";
import { EmptyState } from "@/components/design-system/state-panel";
import { ProfileCard } from "@/components/design-system/profile-card";
import { RideCountdown } from "@/components/design-system/ride-countdown";
import { signOut } from "@/features/auth/actions/auth-actions";
import { RideRequestsAccordion } from "@/features/rides/components/ride-requests-accordion";
import { getRecentMessagesForUser } from "@/services/ride-chat";
import {
  getAttendanceStats,
  getFellowRiders,
  getRequestsForRides,
} from "@/services/ride-participation";
import type { Profile } from "@/services/profiles";
import {
  getMyNextRide,
  getMyRides,
  getOrganizedRidesCount,
  getRidesByOrganizer,
} from "@/services/rides";
import { getUserTimeZone } from "@/services/timezone";
import { capitalize } from "@/utils/capitalize";
import { getHourInTimeZone } from "@/utils/timezone";
import { InstallAppCard } from "@/features/app-install/components/install-app-card";

function greeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export async function RiderHomeView({ profile }: { profile: Profile }) {
  const userId = profile.id;
  const [
    { upcoming, requests },
    attendance,
    organizedCount,
    nextRide,
    myRides,
    fellowRiders,
    recentMessages,
    timeZone,
  ] = await Promise.all([
    // Only this lookup depends on the organized-rides list — chain it here
    // rather than making every other query below wait for it.
    getRidesByOrganizer(userId).then(async ({ upcoming }) => ({
      upcoming,
      requests: await getRequestsForRides(
        upcoming.map((ride) => ride.id).filter((id) => id !== null),
      ),
    })),
    getAttendanceStats(userId),
    getOrganizedRidesCount(userId),
    getMyNextRide(userId),
    getMyRides(userId),
    getFellowRiders(userId, 6),
    getRecentMessagesForUser(userId, 5),
    getUserTimeZone(),
  ]);
  const currentHour = getHourInTimeZone(timeZone);

  const stats = [
    {
      label: "Rides completed",
      numeric: true,
      value: attendance.attended > 0 ? String(attendance.attended) : undefined,
    },
    {
      label: "Rides organized",
      numeric: true,
      value: organizedCount > 0 ? String(organizedCount) : undefined,
    },
    {
      label: "Based in",
      value: [profile.city, profile.country].filter(Boolean).join(", "),
    },
    {
      label: "Bike",
      value: [profile.bike_brand, profile.bike_model].filter(Boolean).join(" "),
    },
    {
      label: "Experience",
      value: profile.experience_level
        ? `${capitalize(profile.experience_level)} · ${profile.years_riding ?? 0} yrs`
        : undefined,
    },
    {
      label: "Instagram",
      value: profile.instagram_handle ? `@${profile.instagram_handle}` : undefined,
    },
  ].filter((stat) => stat.value);

  const firstName = profile.name.split(" ")[0];

  return (
    <>
      {/* Rider identity + greeting */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-secondary size-16 shrink-0 overflow-hidden rounded-full">
            {profile.profile_image_url && (
              <Image
                src={profile.profile_image_url}
                alt={profile.name}
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div>
            <h1 className="font-display text-[2.5rem] text-balance sm:text-5xl">
              {greeting(currentHour)}, {firstName}
            </h1>
            <p className="text-muted-foreground text-sm">
              {profile.name} ·{" "}
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

      {/* The weekend-planner moment — your next ride, front and centre */}
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
          title="Your weekend's wide open"
          description="Nothing booked yet — post a ride or find one and claim your seat."
          action={
            <div className="flex gap-2">
              <Button nativeButton={false} render={<Link href="/rides/create">Post a ride</Link>} />
              <Button
                nativeButton={false}
                variant="outline"
                render={<Link href="/rides">Discover rides</Link>}
              />
            </div>
          }
        />
      )}

      {stats.length > 0 && (
        <dl className="bg-card grid grid-cols-2 gap-x-6 gap-y-5 rounded-md p-5 sm:grid-cols-3 lg:grid-cols-6">
          {stats.map((stat) => (
            <div key={stat.label} className="flex min-w-0 flex-col gap-1">
              <dt className="text-muted-foreground text-sm">{stat.label}</dt>
              <dd
                className={
                  stat.numeric
                    ? "text-2xl font-bold tabular-nums"
                    : "text-base font-semibold break-words"
                }
              >
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-8 lg:col-span-2">
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Pending requests</h2>
            </div>
            <RideRequestsAccordion rides={upcoming} requests={requests} />
          </section>

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
            {myRides.ongoing.length + myRides.upcoming.length > 0 ? (
              <div className="flex flex-col gap-2">
                {[...myRides.ongoing, ...myRides.upcoming].slice(0, 4).map((ride) => (
                  <Link
                    key={ride.id}
                    href={`/rides/${ride.id}`}
                    className="bg-card hover:bg-muted flex items-center justify-between gap-3 rounded-md px-4 py-3 text-sm transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium">{ride.title}</p>
                        {ride.status === "ongoing" && (
                          <StatusChip status="live" pulse className="shrink-0">
                            Live
                          </StatusChip>
                        )}
                      </div>
                      <p className="text-muted-foreground truncate text-sm tabular-nums">
                        {ride.ride_date && format(new Date(ride.ride_date), "EEE, MMM d")} ·{" "}
                        {ride.destination}
                      </p>
                    </div>
                    <ChevronRight className="text-muted-foreground size-4 shrink-0" />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No upcoming rides yet.</p>
            )}
            <p className="text-muted-foreground text-sm tabular-nums">
              {myRides.completed.length} completed · {myRides.cancelled.length} cancelled
            </p>
          </section>
        </div>

        <div className="flex flex-col gap-8">
          <section className="flex flex-col gap-3">
            <h2 className="flex items-center gap-1.5 text-lg font-bold">
              <Users className="text-muted-foreground size-4" />
              Riders you&apos;ll see again
            </h2>
            {fellowRiders.length > 0 ? (
              <div className="flex flex-col gap-2">
                {fellowRiders.map((fellow) => (
                  <ProfileCard
                    key={fellow.profile.id}
                    name={fellow.profile.name}
                    username={fellow.profile.username}
                    imageUrl={fellow.profile.profile_image_url}
                    action={
                      <Badge variant="outline" className="text-muted-foreground">
                        {fellow.nextRideTitle}
                      </Badge>
                    }
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Join a ride to start crossing paths with regulars.
              </p>
            )}
          </section>

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
        </div>
      </div>

      {profile.bio && (
        <Card>
          <CardContent>
            <p className="text-muted-foreground">{profile.bio}</p>
          </CardContent>
        </Card>
      )}
    </>
  );
}
