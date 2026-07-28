import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import {
  AtSign,
  Bike,
  Check,
  ChevronRight,
  Compass,
  MapPin,
  MessageSquare,
  Sparkles,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusChip } from "@/components/ui/status-chip";
import { EmptyState } from "@/components/design-system/state-panel";
import { ProfileCard } from "@/components/design-system/profile-card";
import { RideCountdown } from "@/components/design-system/ride-countdown";
import { SiteHeader } from "@/components/site-header";
import { signOut } from "@/features/auth/actions/auth-actions";
import { RideRequestsAccordion } from "@/features/rides/components/ride-requests-accordion";
import { PayoutSetupCard } from "@/features/profile/components/payout-setup-card";
import { getPayoutDetails } from "@/services/organizer-payout";
import { getRecentMessagesForUser } from "@/services/ride-chat";
import {
  getAttendanceStats,
  getFellowRiders,
  getRequestsForRides,
} from "@/services/ride-participation";
import { getAuthUser, getProfileByUserId } from "@/services/profiles";
import {
  getMyNextRide,
  getMyRides,
  getOrganizedRidesCount,
  getRidesByOrganizer,
} from "@/services/rides";
import { getUserTimeZone } from "@/services/timezone";
import { capitalize } from "@/utils/capitalize";
import { getHourInTimeZone } from "@/utils/timezone";

export const metadata = {
  title: "Rider Home",
};

function greeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function ProfilePage() {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }

  const profile = await getProfileByUserId(user.id);
  if (!profile) {
    redirect("/profile/setup");
  }

  const { upcoming } = await getRidesByOrganizer(user.id);
  const [
    requests,
    attendance,
    organizedCount,
    nextRide,
    myRides,
    fellowRiders,
    recentMessages,
    timeZone,
    payoutDetails,
  ] = await Promise.all([
    getRequestsForRides(upcoming.map((ride) => ride.id).filter((id) => id !== null)),
    getAttendanceStats(user.id),
    getOrganizedRidesCount(user.id),
    getMyNextRide(user.id),
    getMyRides(user.id),
    getFellowRiders(user.id, 6),
    getRecentMessagesForUser(user.id, 5),
    getUserTimeZone(),
    getPayoutDetails(user.id),
  ]);
  const currentHour = getHourInTimeZone(timeZone);

  const stats = [
    {
      icon: Check,
      label: "Rides Completed",
      value: attendance.attended > 0 ? String(attendance.attended) : undefined,
    },
    {
      icon: Compass,
      label: "Rides Organized",
      value: organizedCount > 0 ? String(organizedCount) : undefined,
    },
    {
      icon: MapPin,
      label: "Based In",
      value: [profile.city, profile.country].filter(Boolean).join(", "),
    },
    {
      icon: Bike,
      label: "Rides A",
      value: [profile.bike_brand, profile.bike_model].filter(Boolean).join(" "),
    },
    {
      icon: Sparkles,
      label: "Experience",
      value: profile.experience_level
        ? `${capitalize(profile.experience_level)} · ${profile.years_riding ?? 0} yrs`
        : undefined,
    },
    {
      icon: AtSign,
      label: "Instagram",
      value: profile.instagram_handle ? `@${profile.instagram_handle}` : undefined,
    },
  ].filter((stat) => stat.value);

  const firstName = profile.name.split(" ")[0];

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-6 py-10">
        {/* Rider identity + greeting */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-secondary ring-primary/10 size-16 shrink-0 overflow-hidden rounded-full ring-4">
              {profile.profile_image_url && (
                <Image
                  src={profile.profile_image_url}
                  alt={profile.name}
                  width={64}
                  height={64}
                  unoptimized
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div>
              <p className="text-telemetry text-primary text-[11px]">
                {greeting(currentHour)}, {firstName}
              </p>
              <h1 className="font-heading text-2xl font-extrabold tracking-tight">{profile.name}</h1>
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

        {/* The weekend-planner moment — your next ride, front and centre */}
        {nextRide ? (
          <section className="bg-secondary text-secondary-foreground relative overflow-hidden rounded-3xl p-8 sm:p-12">
            <div
              aria-hidden
              className="bg-primary/20 pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full blur-3xl"
            />
            <div
              aria-hidden
              className="bg-road-dashes absolute inset-x-0 top-0 h-px text-white/25"
            />
            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-col gap-3">
                {nextRide.status === "ongoing" ? (
                  <StatusChip
                    status="live"
                    pulse
                    className="w-fit border-white/20 bg-white/10 text-white"
                  >
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
            title="Your Weekend's Wide Open"
            description="Nothing booked yet — post a ride or find one and claim your seat."
            action={
              <div className="flex gap-2">
                <Button
                  nativeButton={false}
                  render={<Link href="/rides/create">Post A Ride</Link>}
                />
                <Button
                  nativeButton={false}
                  variant="outline"
                  render={<Link href="/rides">Discover Rides</Link>}
                />
              </div>
            }
          />
        )}

        {stats.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-6">
            {stats.map((stat) => (
              <Card key={stat.label} size="sm">
                <CardContent className="flex flex-col gap-1.5">
                  <stat.icon className="text-muted-foreground size-4" />
                  <p className="text-telemetry text-muted-foreground text-[10px]">{stat.label}</p>
                  <p className="text-sm font-medium">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="flex flex-col gap-8 lg:col-span-2">
            <section className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-lg font-bold tracking-tight">Pending Requests</h2>
              </div>
              <RideRequestsAccordion rides={upcoming} requests={requests} />
            </section>

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
              {myRides.ongoing.length + myRides.upcoming.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {[...myRides.ongoing, ...myRides.upcoming].slice(0, 4).map((ride) => (
                    <Link
                      key={ride.id}
                      href={`/rides/${ride.id}`}
                      className="border-border hover:border-primary/50 flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm transition-colors"
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
                        <p className="text-muted-foreground truncate text-xs">
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
              <p className="text-muted-foreground text-xs">
                {myRides.completed.length} completed · {myRides.cancelled.length} cancelled
              </p>
            </section>
          </div>

          <div className="flex flex-col gap-8">
            <section className="flex flex-col gap-3">
              <h2 className="font-heading flex items-center gap-1.5 text-lg font-bold tracking-tight">
                <Users className="text-muted-foreground size-4" />
                Riders You&apos;ll See Again
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
          </div>
        </div>

        {profile.bio && (
          <Card>
            <CardContent>
              <p className="text-muted-foreground">{profile.bio}</p>
            </CardContent>
          </Card>
        )}

        <div id="payout" className="scroll-mt-20">
          <PayoutSetupCard payoutDetails={payoutDetails} />
        </div>
      </div>
    </div>
  );
}
