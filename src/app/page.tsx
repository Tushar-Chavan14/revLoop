import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowRight,
  Bike,
  Calendar,
  Compass,
  Flag,
  MapPin,
  MessageSquare,
  MessageSquareX,
  Quote,
  UserPlus,
  Users,
  UserX,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/ui/status-chip";
import { DestinationCard } from "@/components/design-system/destination-card";
import { EmptyState } from "@/components/design-system/state-panel";
import { ProfileCard } from "@/components/design-system/profile-card";
import { StatCard } from "@/components/design-system/stat-card";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { RIDE_TYPE_ICONS, RIDE_TYPES } from "@/constants/ride-type";
import { APP_DESCRIPTION } from "@/constants/site";
import { RideCard } from "@/features/rides/components/ride-card";
import { themedPhoto } from "@/lib/placeholder-image";
import { getDestinationPhoto } from "@/lib/wikimedia-photo";
import { getAuthUser } from "@/services/profiles";
import { getWeekendActivity } from "@/services/ride-participation";
import {
  getCommunityStats,
  getFeaturedRide,
  getPopularTripDestinations,
  getUpcomingRides,
} from "@/services/rides";
import { capitalize } from "@/utils/capitalize";
import { getUpcomingWeekendRange } from "@/utils/weekend";

const PAIN_POINTS = [
  {
    icon: MessageSquareX,
    pain: "Buried In Group Chats",
    fix: "Ride plans die under 400 unread messages. On RevLoop, every ride is its own page — date, route, pace, and rules in one place.",
  },
  {
    icon: UserX,
    pain: "No Idea Who's Coming",
    fix: "Seat counts and join requests mean you know exactly who's riding — and organizers choose who joins.",
  },
  {
    icon: MapPin,
    pain: "“Meet near the flyover”",
    fix: "Every ride pins an exact meeting point on the map. No more circling the highway exit calling everyone.",
  },
] as const;

const HOW_IT_WORKS = [
  {
    icon: Compass,
    title: "Find Or Post A Ride",
    description:
      "Browse loops near your city — breakfast runs, ghat roads, overnight tours — or post your own with the route mapped out.",
  },
  {
    icon: UserPlus,
    title: "Request Your Seat",
    description:
      "One tap to ask in. The organizer sees your profile and your machine, and accepts from their dashboard.",
  },
  {
    icon: MessageSquare,
    title: "Sync Up In Ride Chat",
    description:
      "Once you're in, the ride chat opens up — sort out timing, luggage, and where breakfast is happening.",
  },
  {
    icon: Flag,
    title: "Meet at the pin. Roll out.",
    description:
      "The exact meeting point is on the map, and you get notified of every update until kickstands go up.",
  },
] as const;

const TESTIMONIALS = [
  {
    name: "Priya R.",
    city: "Pune",
    quote:
      "Found my crew for the Sunday breakfast runs. Haven't missed one since I joined — the group chat used to kill every plan before it happened.",
  },
  {
    name: "Arjun K.",
    city: "Bengaluru",
    quote:
      "RevLoop turned “someone should organize a ride” into an actual Saturday plan with a pin on the map and eleven other riders confirmed.",
  },
  {
    name: "Meera S.",
    city: "Mumbai",
    quote:
      "A meeting point on a map beats fifteen “where are you guys” texts every single time. This is how group rides should work.",
  },
] as const;

export default async function HomePage() {
  const [user, upcomingRides, popularDestinations, stats, weekend, featuredRide] =
    await Promise.all([
      getAuthUser(),
      getUpcomingRides(9),
      getPopularTripDestinations(4),
      getCommunityStats(),
      getWeekendActivity(8),
      getFeaturedRide(),
    ]);

  const primaryCtaHref = user ? "/rides/create" : "/login";
  const primaryCtaLabel = user ? "Create A Ride" : "Get Started";

  // The destination's own Wikipedia lead photo where one genuinely matches,
  // else a real photo geotagged nearby, else a themed stock photo.
  const destinationPhotos = await Promise.all(
    popularDestinations.map((destination) =>
      getDestinationPhoto(destination.destination, destination.lat, destination.lng),
    ),
  );

  const { start, end } = getUpcomingWeekendRange();
  const weekendRides = upcomingRides.filter(
    (ride) => ride.ride_date && ride.ride_date >= start && ride.ride_date <= end,
  );
  const displayedUpcoming = (weekendRides.length > 0 ? weekendRides : upcomingRides).slice(0, 6);
  const upcomingSectionTitle =
    weekendRides.length > 0 ? "Upcoming Weekend Rides" : "Upcoming Rides";

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="bg-secondary text-secondary-foreground relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,oklch(0.705_0.191_41.6/30%),transparent_55%)]"
        />
        <div
          aria-hidden
          className="bg-primary/20 pointer-events-none absolute -right-24 -bottom-24 h-96 w-96 rounded-full blur-3xl"
        />
        <div
          aria-hidden
          className="bg-road-dashes text-primary/50 absolute top-0 right-0 left-0 h-1"
        />

        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-8 px-6 py-24 text-center sm:py-32">
          <StatusChip status="live" pulse className="border-white/20 bg-white/10 text-white">
            {weekend.ridersCount > 0
              ? `${weekend.ridersCount} riders are riding this weekend`
              : "Rides happening this weekend"}
          </StatusChip>

          <h1 className="font-display max-w-4xl text-6xl text-white uppercase sm:text-8xl">
            {weekend.ridersCount > 0
              ? `${weekend.ridersCount} riders. one weekend.`
              : "Your next ride is out there"}
          </h1>
          <p className="max-w-xl text-lg text-white/70">{APP_DESCRIPTION}</p>

          <div className="flex flex-wrap justify-center gap-3">
            <Button
              nativeButton={false}
              render={<Link href={primaryCtaHref}>{primaryCtaLabel}</Link>}
              size="lg"
            />
            <Button
              nativeButton={false}
              render={<Link href="/rides">Discover Rides</Link>}
              size="lg"
              variant="outline"
              className="border-white/25 bg-transparent text-white hover:bg-white/10"
            />
          </div>

          {featuredRide && (
            <div className="mt-4 w-full max-w-lg rounded-3xl bg-white/10 p-5 text-left ring-1 ring-white/15 backdrop-blur-md">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium tracking-wide text-white/60 uppercase">
                  Featured Ride
                </p>
                {featuredRide.member_count !== null && featuredRide.member_count > 0 && (
                  <span className="text-xs text-white/60">
                    {featuredRide.member_count} riders joined
                  </span>
                )}
              </div>
              <p className="font-heading mt-1 flex items-center gap-1.5 text-lg font-semibold text-white">
                {featuredRide.city}
                <ArrowRight className="size-4 text-white/50" />
                {featuredRide.destination}
              </p>
              <p className="mt-1 text-sm text-white/70">
                {featuredRide.ride_date && format(new Date(featuredRide.ride_date), "EEEE, MMM d")}
                {featuredRide.departure_time && ` · ${featuredRide.departure_time.slice(0, 5)}`}
              </p>
              <div className="mt-4 flex items-center justify-between gap-3">
                {featuredRide.organizer && (
                  <div className="flex items-center gap-2">
                    <Avatar size="sm">
                      <AvatarImage
                        src={featuredRide.organizer.profile_image_url ?? undefined}
                        alt={featuredRide.organizer.name}
                      />
                      <AvatarFallback>{featuredRide.organizer.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-white/70">By {featuredRide.organizer.name}</span>
                  </div>
                )}
                <Button
                  nativeButton={false}
                  size="sm"
                  render={<Link href={`/rides/${featuredRide.id}#join`}>Join Ride</Link>}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      <main className="flex flex-1 flex-col gap-20 px-6 py-16">
        {/* Upcoming weekend rides */}
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-heading text-2xl font-bold tracking-tight">
                {upcomingSectionTitle}
              </h2>
              <p className="text-muted-foreground">Open the app on Friday. Ride on Saturday.</p>
            </div>
            <Button
              nativeButton={false}
              render={<Link href="/rides">See All</Link>}
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex"
            />
          </div>
          {displayedUpcoming.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {displayedUpcoming.map((ride) => (
                <RideCard key={ride.id} ride={ride} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Rides Planned Yet"
              description="Start your next adventure — be the first to post a ride this weekend."
              action={
                <Button
                  nativeButton={false}
                  render={<Link href={primaryCtaHref}>{primaryCtaLabel}</Link>}
                />
              }
            />
          )}
        </section>

        {/* Who's riding this weekend */}
        {weekend.roster.length > 0 && (
          <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
            <div>
              <h2 className="font-heading text-2xl font-bold tracking-tight">
                Who&apos;s Riding This Weekend
              </h2>
              <p className="text-muted-foreground">
                Riders already locked in across the community.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {weekend.roster.map((rider) => (
                <ProfileCard
                  key={rider.profile.id}
                  name={rider.profile.name}
                  username={rider.profile.username}
                  imageUrl={rider.profile.profile_image_url}
                  location={[rider.profile.city, rider.profile.country].filter(Boolean).join(", ")}
                  bike={[rider.profile.bike_brand, rider.profile.bike_model]
                    .filter(Boolean)
                    .join(" ")}
                  riderLevel={
                    rider.profile.experience_level
                      ? capitalize(rider.profile.experience_level)
                      : undefined
                  }
                />
              ))}
            </div>
          </section>
        )}

        {/* Popular destinations */}
        {popularDestinations.length > 0 && (
          <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
            <div>
              <h2 className="font-heading text-2xl font-bold tracking-tight">
                Popular Destinations
              </h2>
              <p className="text-muted-foreground">Where the community keeps heading back to.</p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {popularDestinations.map((destination, index) => (
                <DestinationCard
                  key={destination.destination}
                  href={`/rides?q=${encodeURIComponent(destination.destination)}`}
                  city={destination.destination}
                  rideCount={destination.rideCount}
                  imageUrl={
                    destinationPhotos[index] ?? themedPhoto("mountains,road,scenic", 200 + index)
                  }
                />
              ))}
            </div>
          </section>
        )}

        {/* Featured ride spotlight */}
        {featuredRide && (
          <Reveal>
            <section className="mx-auto w-full max-w-6xl">
              <div className="bg-card ring-foreground/10 grid grid-cols-1 overflow-hidden rounded-3xl ring-1 lg:grid-cols-2">
                <div className="from-secondary via-secondary/60 to-primary/30 relative aspect-video w-full bg-linear-to-br lg:aspect-auto">
                  {featuredRide.cover_image_url ? (
                    <Image
                      src={featuredRide.cover_image_url}
                      alt={featuredRide.title ?? "Featured ride"}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <Image
                      src={themedPhoto("motorcycle,adventure,road", 301)}
                      alt=""
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex flex-col justify-center gap-4 p-8 sm:p-10">
                  <Badge className="w-fit">Ride Of The Week</Badge>
                  <h2 className="font-heading text-3xl font-bold tracking-tight text-balance">
                    {featuredRide.title}
                  </h2>
                  {featuredRide.description && (
                    <p className="text-muted-foreground line-clamp-3">{featuredRide.description}</p>
                  )}
                  <div className="text-muted-foreground flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="text-primary size-4" />
                      {featuredRide.ride_date &&
                        format(new Date(featuredRide.ride_date), "EEE, MMM d")}
                    </span>
                    {featuredRide.estimated_distance_km && (
                      <span className="flex items-center gap-1.5">
                        <Bike className="text-primary size-4" />
                        {featuredRide.estimated_distance_km} km
                      </span>
                    )}
                    {featuredRide.member_count !== null && featuredRide.member_count > 0 && (
                      <span className="flex items-center gap-1.5">
                        <Users className="text-primary size-4" />
                        {featuredRide.member_count} riders joined
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Button
                      nativeButton={false}
                      render={<Link href={`/rides/${featuredRide.id}#join`}>Join This Ride</Link>}
                    />
                    <Button
                      nativeButton={false}
                      variant="outline"
                      render={<Link href={`/rides/${featuredRide.id}`}>View Details</Link>}
                    />
                  </div>
                </div>
              </div>
            </section>
          </Reveal>
        )}

        {/* Community statistics */}
        <Reveal>
          <section className="mx-auto w-full max-w-6xl">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard icon={Users} label="Riders" value={stats.ridersCount} suffix="+" />
              <StatCard icon={Calendar} label="Rides Planned" value={stats.upcomingRidesCount} />
              <StatCard icon={MapPin} label="Cities" value={stats.citiesCount} />
              <StatCard icon={Flag} label="Rides This Weekend" value={weekend.rideCount} />
            </div>
          </section>
        </Reveal>

        {/* Testimonials */}
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-8">
          <h2 className="font-heading text-2xl font-bold tracking-tight">Riders On RevLoop</h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((testimonial, index) => (
              <Reveal key={testimonial.name} delay={index * 120}>
                <div className="bg-card ring-foreground/10 flex h-full flex-col gap-4 rounded-2xl p-6 ring-1">
                  <Quote className="text-primary size-6" />
                  <p className="text-sm leading-relaxed text-pretty">{testimonial.quote}</p>
                  <p className="text-muted-foreground mt-auto text-sm font-medium">
                    {testimonial.name} · {testimonial.city}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Why RevLoop */}
        <section
          aria-labelledby="why-revloop"
          className="mx-auto flex w-full max-w-6xl flex-col gap-8"
        >
          <Reveal className="max-w-2xl">
            <h2
              id="why-revloop"
              className="font-heading text-2xl font-bold tracking-tight sm:text-3xl"
            >
              Weekend plans shouldn&apos;t die in the group chat
            </h2>
            <p className="text-muted-foreground mt-2">
              Every riding crew knows the drill: someone says &ldquo;Sunday?&rdquo;, forty messages
              later nobody knows the plan. RevLoop fixes the three ways group rides fall apart.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {PAIN_POINTS.map((point, index) => (
              <Reveal key={point.pain} delay={index * 120}>
                <div className="border-border hover:border-primary/50 group flex h-full flex-col gap-3 rounded-2xl border p-6 transition-colors">
                  <point.icon className="text-primary size-6 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" />
                  <h3 className="font-heading text-lg font-semibold">{point.pain}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{point.fix}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="how-it-works"
          className="bg-secondary text-secondary-foreground relative -mx-6 overflow-hidden px-6 py-16"
        >
          <div
            aria-hidden
            className="text-primary/30 bg-road-dashes absolute top-0 right-0 left-0 h-1"
          />
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
            <Reveal className="max-w-2xl">
              <h2
                id="how-it-works"
                className="font-heading text-2xl font-bold tracking-tight sm:text-3xl"
              >
                From &ldquo;anyone up for a ride?&rdquo; to kickstands up
              </h2>
              <p className="text-secondary-foreground/60 mt-2">
                Four steps between you and the next loop.
              </p>
            </Reveal>
            <div className="relative grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              <div
                aria-hidden
                className="border-primary/30 absolute top-6 right-[12%] left-[12%] hidden border-t border-dashed lg:block"
              />
              {HOW_IT_WORKS.map((step, index) => (
                <Reveal key={step.title} delay={index * 150} className="relative">
                  <div className="flex flex-col gap-3">
                    <div className="bg-secondary ring-primary text-primary font-heading relative z-10 flex size-12 items-center justify-center rounded-full text-lg font-semibold ring-2">
                      {index + 1}
                    </div>
                    <div className="flex items-center gap-2">
                      <step.icon className="text-primary size-4" />
                      <h3 className="font-heading text-lg font-semibold">{step.title}</h3>
                    </div>
                    <p className="text-secondary-foreground/60 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
          <h2 className="font-heading text-2xl font-bold tracking-tight">Every Kind Of Ride</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {RIDE_TYPES.map((type) => {
              const Icon = RIDE_TYPE_ICONS[type.value];
              return (
                <Link
                  key={type.value}
                  href={`/rides?types=${type.value}`}
                  className="border-border hover:border-primary/60 hover:bg-primary/5 group flex flex-col items-center gap-2 rounded-xl border py-6 text-center transition-colors"
                >
                  <Icon className="text-primary size-5 transition-transform group-hover:scale-110" />
                  <span className="text-sm font-medium">{type.label}</span>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      {/* Join community CTA */}
      <section className="bg-secondary text-secondary-foreground relative overflow-hidden px-6 py-20">
        <Image
          src={themedPhoto("motorcycle,group,riders", 401, 1920, 900)}
          alt=""
          fill
          unoptimized
          className="object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-black/60" />
        <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
          <Users className="text-primary size-8" />
          <h2 className="font-display text-5xl uppercase">Ready to plan your next ride?</h2>
          <p className="text-secondary-foreground/70">
            Join the RevLoop community and never ride alone.
          </p>
          <Button
            nativeButton={false}
            render={<Link href={primaryCtaHref}>{primaryCtaLabel}</Link>}
            size="lg"
          />
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
