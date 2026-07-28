import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowRight,
  Bike,
  Calendar,
  Flag,
  MapPin,
  MessageSquareX,
  Quote,
  Users,
  UserX,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DestinationCard } from "@/components/design-system/destination-card";
import { EmptyState } from "@/components/design-system/state-panel";
import { ProfileCard } from "@/components/design-system/profile-card";
import { StatCard } from "@/components/design-system/stat-card";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { cn } from "@/lib/utils";
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
  type RideWithOrganizer,
} from "@/services/rides";
import { capitalize } from "@/utils/capitalize";
import { getUpcomingWeekendRange } from "@/utils/weekend";

// Curated cinematic motorcycle photography carries the emotion — golden-hour
// open roads and real machines. Hotlinked from Unsplash's CDN (keyless,
// unoptimized), hand-picked frames rather than random keyword matches.
const unsplash = (id: string, w = 2000) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;
const IMG = {
  hero: unsplash("1558981806-ec527fa84c39"), // rider cruising into golden hour
  featuredCommunity: unsplash("1600298881974-6be191ceeda1"), // rugged peaks
  featuredOrganized: unsplash("1454496522488-7a8e488e8606"), // snow summit
};

const PAIN_POINTS = [
  {
    icon: MessageSquareX,
    pain: "Buried In Group Chats",
    fix: "Ride plans die under 400 unread messages. On RoadKin, every ride is its own page — date, route, pace, and rules in one place.",
  },
  {
    icon: UserX,
    pain: "No Idea Who's Coming",
    fix: "Seat counts and join requests mean you know exactly who's riding — and the organizer waves in the crew.",
  },
  {
    icon: MapPin,
    pain: "“Meet near the flyover”",
    fix: "Every ride pins an exact meeting point on the map. No more circling the highway exit calling everyone.",
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
      "RoadKin turned “someone should organize a ride” into an actual Saturday plan with a pin on the map and eleven other riders confirmed.",
  },
  {
    name: "Meera S.",
    city: "Mumbai",
    quote:
      "A meeting point on a map beats fifteen “where are you guys” texts every single time. This is how weekend rides should work.",
  },
] as const;

export default async function HomePage() {
  const [
    user,
    upcomingRides,
    popularDestinations,
    stats,
    weekend,
    featuredCommunityRide,
    featuredOrganizedRide,
  ] = await Promise.all([
    getAuthUser(),
    getUpcomingRides(9),
    getPopularTripDestinations(4),
    getCommunityStats(),
    getWeekendActivity(8),
    getFeaturedRide("community"),
    getFeaturedRide("organized"),
  ]);

  const primaryCtaHref = user ? "/rides/create" : "/login";
  const primaryCtaLabel = user ? "Post A Ride" : "Find Your Crew";

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
  const isWeekend = weekendRides.length > 0;

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />

      {/* Hero — the home of weekend riders. Golden-hour photography carries it. */}
      <section className="bg-secondary text-secondary-foreground relative flex min-h-svh items-end overflow-hidden">
        <Image src={IMG.hero} alt="" fill priority unoptimized className="object-cover" />
        {/* Cinematic scrim — deep at the base for legibility, warm amber glow at
            the horizon so the whole frame reads golden hour. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-t from-black via-black/55 to-black/20"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-r from-black/85 via-black/20 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_85%_15%,rgba(231,111,36,0.28),transparent_55%)]"
        />

        <div className="relative mx-auto w-full max-w-6xl px-6 pt-44 pb-24">
          <div className="text-telemetry flex items-center gap-2.5 text-[11px] text-white/85">
            <span className="relative flex size-2">
              <span className="bg-primary absolute inline-flex size-full animate-ping rounded-full opacity-75" />
              <span className="bg-primary relative inline-flex size-2 rounded-full" />
            </span>
            {weekend.ridersCount > 0
              ? `${weekend.ridersCount} rider${weekend.ridersCount === 1 ? "" : "s"} out this weekend`
              : "The home of weekend riders"}
          </div>

          <h1 className="font-display mt-8 max-w-5xl text-7xl leading-[0.85] text-white uppercase sm:text-8xl lg:text-[10rem]">
            Never ride
            <br />
            alone again
          </h1>

          <p className="mt-8 max-w-xl text-lg text-pretty text-white/80 sm:text-xl">
            Open RoadKin on Friday. Find your people. Ride together on Saturday.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button
              nativeButton={false}
              render={<Link href={primaryCtaHref}>{primaryCtaLabel}</Link>}
              size="lg"
              className="bg-sunrise h-12 border-0 px-6 text-base text-white shadow-xl transition-opacity hover:opacity-90"
            />
            <Button
              nativeButton={false}
              render={<Link href="/rides">Discover Rides</Link>}
              size="lg"
              variant="outline"
              className="h-12 border-white/30 bg-white/5 px-6 text-base text-white backdrop-blur-sm hover:bg-white/10 hover:text-white"
            />
          </div>
        </div>

        <div
          aria-hidden
          className="bg-road-dashes absolute inset-x-0 bottom-0 h-px text-white/25"
        />
      </section>

      <main className="flex flex-1 flex-col gap-24 px-6 py-20">
        {/* Upcoming weekend rides */}
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-8">
          <SectionHeading
            eyebrow={isWeekend ? "This Weekend" : "Coming Up"}
            title="Where are we riding?"
            description="Open RoadKin on Friday. Roll out on Saturday."
            action={
              <Button
                nativeButton={false}
                render={<Link href="/rides">See All</Link>}
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
              />
            }
          />
          {displayedUpcoming.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {displayedUpcoming.map((ride) => (
                <RideCard key={ride.id} ride={ride} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Rides Planned Yet"
              description="Be the first to post a ride and pull your road family together this weekend."
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
          <section className="mx-auto flex w-full max-w-6xl flex-col gap-8">
            <SectionHeading
              eyebrow="Your Road Family"
              title="Who's riding this weekend"
              description="Riders already locked in and ready to roll."
            />
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
          <section className="mx-auto flex w-full max-w-6xl flex-col gap-8">
            <SectionHeading
              eyebrow="On The Map"
              title="Where the road keeps pulling us back"
              description="The destinations your road family rides again and again."
            />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {popularDestinations.map((destination, index) => (
                <DestinationCard
                  key={destination.destination}
                  href={`/rides?q=${encodeURIComponent(destination.destination)}`}
                  city={destination.destination}
                  rideCount={destination.rideCount}
                  imageUrl={
                    destinationPhotos[index] ?? themedPhoto("motorcycle,mountain,road", 200 + index)
                  }
                />
              ))}
            </div>
          </section>
        )}

        {/* Featured Community Ride */}
        {featuredCommunityRide && (
          <Reveal>
            <section className="mx-auto flex w-full max-w-6xl flex-col gap-8">
              <SectionHeading
                eyebrow="Community Ride"
                eyebrowClassName="text-ride-community"
                title="This week's community ride"
              />
              <FeaturedRideSpotlight
                ride={featuredCommunityRide}
                accent="community"
                fallbackPhoto={IMG.featuredCommunity}
              />
            </section>
          </Reveal>
        )}

        {/* Featured Organized Ride */}
        {featuredOrganizedRide && (
          <Reveal>
            <section className="mx-auto flex w-full max-w-6xl flex-col gap-8">
              <SectionHeading eyebrow="Organized Ride" title="This week's organized tour" />
              <FeaturedRideSpotlight
                ride={featuredOrganizedRide}
                accent="organized"
                fallbackPhoto={IMG.featuredOrganized}
              />
            </section>
          </Reveal>
        )}

        {/* Community statistics */}
        <Reveal>
          <section className="mx-auto flex w-full max-w-6xl flex-col gap-8">
            <SectionHeading eyebrow="By The Numbers" title="One growing road family" />
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
          <SectionHeading eyebrow="From The Saddle" title="Riders on RoadKin" />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((testimonial, index) => (
              <Reveal key={testimonial.name} delay={index * 120}>
                <div className="bg-card ring-foreground/10 flex h-full flex-col gap-4 rounded-2xl p-6 ring-1">
                  <Quote className="text-muted-foreground/40 size-6" />
                  <p className="leading-relaxed text-pretty">{testimonial.quote}</p>
                  <p className="text-muted-foreground text-telemetry mt-auto text-[11px]">
                    {testimonial.name} · {testimonial.city}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Why RoadKin */}
        <section
          aria-labelledby="why-roadkin"
          className="mx-auto flex w-full max-w-6xl flex-col gap-8"
        >
          <Reveal className="max-w-2xl">
            <p className="text-telemetry text-primary text-[11px]">Why RoadKin</p>
            <h2
              id="why-roadkin"
              className="font-heading mt-3 text-3xl font-extrabold tracking-tight text-balance sm:text-4xl"
            >
              Weekend plans shouldn&apos;t die in the group chat
            </h2>
            <p className="text-muted-foreground mt-3">
              Every riding crew knows the drill: someone says &ldquo;Sunday?&rdquo;, forty messages
              later nobody knows the plan. RoadKin fixes the three ways group rides fall apart.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {PAIN_POINTS.map((point, index) => (
              <Reveal key={point.pain} delay={index * 120}>
                <div className="border-border hover:border-foreground/30 group flex h-full flex-col gap-3 rounded-2xl border p-6 transition-colors">
                  <point.icon className="text-foreground size-6 transition-transform duration-300 group-hover:scale-110" />
                  <h3 className="font-heading text-lg font-bold">{point.pain}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{point.fix}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      </main>

      {/* Join the road family CTA — full-bleed cinematic close. */}
      <section className="bg-secondary text-secondary-foreground relative flex min-h-[70svh] items-center overflow-hidden px-6 py-28">
        <Image src="/footer-mountains.jpg" alt="" fill unoptimized className="object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/60 to-black/70" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_100%,rgba(231,111,36,0.25),transparent_60%)]"
        />
        <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-7 text-center">
          <p className="text-telemetry text-primary text-[11px]">Never Ride Alone Again</p>
          <h2 className="font-display text-6xl text-white uppercase sm:text-7xl lg:text-8xl">
            Find your road family
          </h2>
          <p className="max-w-md text-lg text-pretty text-white/75">
            Open RoadKin, claim your seat on this weekend&apos;s ride, and roll out with people who
            ride like you do.
          </p>
          <Button
            nativeButton={false}
            render={<Link href={primaryCtaHref}>{primaryCtaLabel}</Link>}
            size="lg"
            className="bg-sunrise h-12 border-0 px-6 text-base text-white shadow-xl transition-opacity hover:opacity-90"
          />
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  eyebrowClassName,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  eyebrowClassName?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="max-w-2xl">
        <p className={cn("text-telemetry text-primary text-[11px]", eyebrowClassName)}>{eyebrow}</p>
        <h2 className="font-heading mt-3 text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
          {title}
        </h2>
        {description && <p className="text-muted-foreground mt-3">{description}</p>}
      </div>
      {action}
    </div>
  );
}

const SPOTLIGHT_ACCENT = {
  community: { badge: "bg-ride-community text-white", icon: "text-ride-community" },
  organized: { badge: "bg-primary text-primary-foreground", icon: "text-primary" },
} as const;

function FeaturedRideSpotlight({
  ride,
  accent,
  fallbackPhoto,
}: {
  ride: RideWithOrganizer;
  accent: keyof typeof SPOTLIGHT_ACCENT;
  fallbackPhoto: string;
}) {
  const theme = SPOTLIGHT_ACCENT[accent];
  return (
    <div className="bg-card ring-foreground/10 grid grid-cols-1 overflow-hidden rounded-3xl ring-1 lg:grid-cols-2">
      <div className="from-secondary via-secondary/60 to-secondary/30 relative aspect-video w-full bg-linear-to-br lg:aspect-auto">
        <Image
          src={ride.cover_image_url ?? fallbackPhoto}
          alt={ride.title ?? "Featured ride"}
          fill
          unoptimized
          className="object-cover"
        />
      </div>
      <div className="flex flex-col justify-center gap-4 p-8 sm:p-10">
        <Badge className={cn("w-fit border-0", theme.badge)}>Ride Of The Week</Badge>
        <h3 className="font-heading text-3xl font-extrabold tracking-tight text-balance">
          {ride.title}
        </h3>
        {ride.city && ride.destination && (
          <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
            {ride.city}
            <ArrowRight className={cn("size-4", theme.icon)} />
            {ride.destination}
          </p>
        )}
        {ride.description && (
          <p className="text-muted-foreground line-clamp-2">{ride.description}</p>
        )}
        <div className="text-muted-foreground flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <span className="flex items-center gap-1.5">
            <Calendar className={cn("size-4", theme.icon)} />
            {ride.ride_date && format(new Date(ride.ride_date), "EEE, MMM d")}
          </span>
          {ride.estimated_distance_km && (
            <span className="flex items-center gap-1.5">
              <Bike className={cn("size-4", theme.icon)} />
              {ride.estimated_distance_km} km
            </span>
          )}
          {ride.member_count !== null && ride.member_count > 0 && (
            <span className="flex items-center gap-1.5">
              <Users className={cn("size-4", theme.icon)} />
              {ride.member_count} riders in
            </span>
          )}
        </div>
        {ride.organizer && (
          <div className="mt-2 flex items-center gap-2">
            <Avatar size="sm">
              <AvatarImage
                src={ride.organizer.profile_image_url ?? undefined}
                alt={ride.organizer.name}
              />
              <AvatarFallback>{ride.organizer.name?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="text-muted-foreground text-telemetry text-[10px]">
              {accent === "organized" ? "Captain" : "Led by"} {ride.organizer.name}
            </span>
          </div>
        )}
        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            nativeButton={false}
            render={<Link href={`/rides/${ride.id}#join`}>Claim Your Seat</Link>}
          />
          <Button
            nativeButton={false}
            variant="outline"
            render={<Link href={`/rides/${ride.id}`}>View Ride</Link>}
          />
        </div>
      </div>
    </div>
  );
}
