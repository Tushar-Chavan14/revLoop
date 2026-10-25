import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CountUp } from "@/components/design-system/count-up";
import { Milestone } from "@/components/design-system/milestone";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { cn } from "@/lib/utils";
import { LandingHero } from "@/features/landing/components/landing-hero";
import { WeekendRidesTable } from "@/features/landing/components/weekend-rides-table";
import { getDestinationPhoto } from "@/lib/wikimedia-photo";
import { getAuthUser } from "@/services/profiles";
import { getWeekendActivity } from "@/services/ride-participation";
import {
  getCommunityStats,
  getFeaturedRide,
  getPopularTripDestinations,
  getUpcomingRides,
  type FeaturedRide,
} from "@/services/rides";
import { getUpcomingWeekendRange } from "@/utils/weekend";

// Hand-picked Unsplash frame: a rider cruising into golden hour.
const HERO_IMAGE = "https://images.unsplash.com/photo-1558981806-ec527fa84c39";

const PHOTO_CREDITS = [
  "“The world's highest motorable claim – Khardung La Pass” by Ashishyadav.photographs, CC BY-SA 4.0",
  "destination photographs from Wikipedia and Wikimedia Commons",
];

// The sequence is written, not counted: each stage of a ride is one line.
const STAGES = [
  {
    line: "First, post the ride.",
    detail: "Date, route, pace and seats on one page, not under 400 unread messages.",
  },
  {
    line: "Then drop the meeting pin.",
    detail: "An exact point on the map. Nobody circles the highway exit asking where you are.",
  },
  {
    line: "Riders claim their seats.",
    detail: "Join requests and a seat count, so you know who is riding before Saturday.",
  },
  {
    line: "Saturday, you roll out.",
    detail: "Crew chat and ride alerts keep everyone together, chai stop to summit.",
  },
] as const;

const STAGE_INDENT = ["", "lg:pl-[12%]", "lg:pl-[24%]", "lg:pl-[36%]"];
const STAGE_INDENT_PHONE = ["pl-0", "pl-[6vw]", "pl-[12vw]", "pl-[18vw]"];

const PRINT_TILT = ["-rotate-[6deg] mt-6", "rotate-[5deg] relative z-[1]", "-rotate-[2deg] mt-10"];

export default async function HomePage() {
  const [user, upcomingRides, popularDestinations, stats, weekend, featuredCommunity, featuredOrganized] =
    await Promise.all([
      getAuthUser(),
      getUpcomingRides(12),
      getPopularTripDestinations(3),
      getCommunityStats(),
      getWeekendActivity(8),
      getFeaturedRide("community"),
      getFeaturedRide("organized"),
    ]);

  const primaryCtaHref = user ? "/rides/create" : "/login";
  const primaryCtaLabel = user ? "Post a ride" : "Find your crew";

  const destinationPhotos = await Promise.all(
    popularDestinations.map((destination) =>
      getDestinationPhoto(destination.destination, destination.lat, destination.lng),
    ),
  );
  const prints = popularDestinations
    .map((destination, index) => ({ ...destination, photo: destinationPhotos[index] }))
    .filter((destination): destination is typeof destination & { photo: string } =>
      Boolean(destination.photo),
    );

  const { start, end } = getUpcomingWeekendRange();
  const weekendRides = upcomingRides.filter(
    (ride) => ride.ride_date && ride.ride_date >= start && ride.ride_date <= end,
  );
  const isWeekend = weekendRides.length > 0;
  const listedRides = (isWeekend ? weekendRides : upcomingRides).slice(0, 8);
  const featured = featuredOrganized ?? featuredCommunity;

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />

      <main className="flex flex-1 flex-col">
        <LandingHero
          image={HERO_IMAGE}
          imageAlt="A rider on a motorcycle leaning into an open highway at golden hour"
          ctaHref={primaryCtaHref}
          ctaLabel={primaryCtaLabel}
          weekendRideCount={weekend.rideCount}
        />

        {/* The weekend's departures: a statement, the timetable pushed right. */}
        <section
          aria-labelledby="rides-title"
          className="mx-auto w-full max-w-[90rem] px-4 pt-32 sm:px-8 lg:pt-44"
        >
          <Reveal>
            <h2
              id="rides-title"
              className="font-display text-[clamp(48px,6.4vw,104px)] leading-[0.9] lg:pl-[3vw]"
            >
              {isWeekend ? "Where we're riding this weekend" : "Where we're riding next"}
            </h2>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-12 lg:mt-24 lg:grid-cols-12 lg:gap-8">
            <div className="flex flex-col gap-4 lg:col-span-5 lg:self-end">
              {featured ? (
                <FeaturedPhoto ride={featured} />
              ) : (
                <Reveal delay={120}>
                  <figure className="flex flex-col gap-3">
                    <div className="relative aspect-4/5 w-full overflow-hidden rounded-md">
                      <Image
                        src="/road/the-world-s-highest-motorable-claim-khardung.jpg"
                        alt="Riders with their motorcycles under the Khardung La summit sign, prayer flags behind"
                        fill
                        sizes="(min-width: 1024px) 40vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                    <figcaption className="text-muted-foreground text-[15px]">
                      Khardung La, Ladakh, 18,380 ft.
                    </figcaption>
                  </figure>
                </Reveal>
              )}
            </div>

            <div className="flex flex-col gap-6 lg:col-span-6 lg:col-start-7">
              {weekend.roster.length > 0 && (
                <Reveal className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {weekend.roster.slice(0, 6).map((rider) => (
                      <Avatar key={rider.profile.id} className="ring-background ring-2">
                        <AvatarImage
                          src={rider.profile.profile_image_url ?? undefined}
                          alt={rider.profile.name}
                        />
                        <AvatarFallback>{rider.profile.name?.[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  <p className="text-[15px] font-semibold">
                    {weekend.ridersCount} rider{weekend.ridersCount === 1 ? "" : "s"} locked in
                    for this weekend
                  </p>
                </Reveal>
              )}
              {listedRides.length > 0 ? (
                <Reveal delay={90}>
                  <WeekendRidesTable rides={listedRides} />
                  <Link
                    href="/rides"
                    className="mt-6 inline-block text-[15px] font-bold underline decoration-2 underline-offset-4"
                  >
                    See every upcoming ride
                  </Link>
                </Reveal>
              ) : (
                <Reveal className="flex flex-col items-start gap-5">
                  <p className="text-lg">
                    Nothing on the calendar yet. Post the first ride and pull your road family
                    together.
                  </p>
                  <Button nativeButton={false} render={<Link href={primaryCtaHref}>Post a ride</Link>} />
                </Reveal>
              )}
            </div>
          </div>
        </section>

        {/* How a ride comes together: four lines stepping down to Saturday. */}
        <section
          aria-labelledby="stage-0"
          className="mx-auto w-full max-w-[90rem] px-4 pt-36 sm:px-8 lg:pt-52"
        >
          <ol className="flex flex-col gap-10 lg:gap-14">
            {STAGES.map((stage, index) => (
              <li key={stage.line} className={cn(STAGE_INDENT_PHONE[index], STAGE_INDENT[index])}>
                <Reveal delay={index * 80}>
                  {index === 0 ? (
                    <h2
                      id="stage-0"
                      className="font-display text-[8.4vw] leading-none sm:text-[clamp(36px,4.6vw,76px)]"
                    >
                      {stage.line}
                    </h2>
                  ) : (
                    <p
                      className={cn(
                        "font-display text-[8.4vw] leading-none sm:text-[clamp(36px,4.6vw,76px)]",
                        index === STAGES.length - 1 && "text-primary-ink",
                      )}
                    >
                      {stage.line}
                    </p>
                  )}
                  <p className="mt-3 max-w-[34ch] text-[17px] leading-snug">
                    {stage.detail}
                  </p>
                </Reveal>
              </li>
            ))}
          </ol>
        </section>

        {/* Where the crews keep riding: the headline, then the prints dropped
            in a fanned pile under it — each one a destination, on its milestone. */}
        {prints.length >= 2 && (
          <section
            aria-labelledby="roads-title"
            className="bg-secondary text-secondary-foreground mt-36 overflow-hidden px-4 pt-20 pb-16 sm:px-8 lg:mt-52 lg:pt-28 lg:pb-20"
          >
            <div className="mx-auto w-full max-w-[90rem]">
              <Reveal>
                <h2
                  id="roads-title"
                  className="font-display text-center text-[19vw] leading-[0.85] sm:text-[clamp(120px,13vw,200px)]"
                >
                  Roads we
                  <br />
                  keep riding
                </h2>
              </Reveal>
              <ul className="mt-12 flex items-start justify-center sm:mt-16">
                {prints.slice(0, 3).map((destination, index) => (
                  <li
                    key={destination.destination}
                    className={cn(
                      "w-[46vw] sm:w-[24vw] sm:max-w-[22rem]",
                      index > 0 && "-ml-[8vw] sm:-ml-[3vw]",
                      index === 2 && "hidden sm:block",
                      PRINT_TILT[index],
                    )}
                  >
                    <Reveal delay={index * 90}>
                      <Link
                        href={`/rides?q=${encodeURIComponent(destination.destination)}`}
                        className="relative block bg-white p-2 pb-3 transition-transform duration-200 ease-out hover:z-10 hover:scale-[1.03] hover:rotate-0 focus-visible:rotate-0"
                      >
                        <span className="relative block aspect-3/4 w-full overflow-hidden">
                          <Image
                            src={destination.photo}
                            alt={`${destination.destination}, where RoadKin rides are headed`}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </span>
                        <span className="flex flex-col gap-1 pt-2 text-[#111]">
                          <span className="font-display text-2xl leading-none sm:text-3xl">
                            {destination.destination}
                          </span>
                          <span className="text-[13px] font-semibold tabular-nums">
                            {destination.rideCount} ride{destination.rideCount === 1 ? "" : "s"}{" "}
                            planned
                          </span>
                        </span>
                      </Link>
                    </Reveal>
                  </li>
                ))}
              </ul>
              <p className="mt-12 max-w-md text-[17px] text-white/80">
                {prints.map((p) => p.destination).join(", ")}: the places our crews keep riding
                back to. Tap one for its rides.
              </p>
            </div>
          </section>
        )}

        {/* The road family, as a ledger of real counts. */}
        <section
          aria-labelledby="family-title"
          className="mx-auto grid w-full max-w-[90rem] grid-cols-1 gap-10 px-4 pt-36 sm:px-8 lg:grid-cols-12 lg:pt-52"
        >
          <Reveal className="lg:col-span-5 lg:self-center">
            <h2
              id="family-title"
              className="text-[28px] leading-tight font-extrabold sm:text-[clamp(32px,3.2vw,52px)]"
            >
              <span className="text-muted-foreground">One road family,</span>
              <br />
              still growing.
            </h2>
          </Reveal>
          <dl className="flex flex-col gap-7 lg:col-span-6 lg:col-start-7">
            {[
              { value: stats.ridersCount, label: "riders have joined RoadKin" },
              { value: stats.upcomingRidesCount, label: "rides planned and open to join" },
              { value: stats.citiesCount, label: "cities with a ride leaving soon" },
              ...(weekend.ridersCount > 0
                ? [{ value: weekend.ridersCount, label: "riders out this weekend" }]
                : []),
            ].map((row, index) => (
              <Reveal key={row.label} delay={index * 80}>
                <div className="grid grid-cols-[52%_1fr] items-baseline gap-x-6">
                  <dd className="font-display text-right text-[15vw] leading-none tabular-nums sm:text-[clamp(64px,7vw,112px)]">
                    <CountUp value={row.value} />
                  </dd>
                  <dt className="text-[15px] font-medium sm:text-base">{row.label}</dt>
                </div>
              </Reveal>
            ))}
          </dl>
        </section>

        {/* The close: the idea again, inverted. */}
        <section
          aria-labelledby="close-title"
          className="bg-secondary text-secondary-foreground mt-36 flex min-h-[80svh] flex-col justify-between px-4 py-14 sm:px-8 lg:mt-52 lg:min-h-[90svh] lg:py-20"
        >
          <div className="mx-auto w-full max-w-[90rem]">
            <Reveal>
              <h2
                id="close-title"
                className="font-display text-[15vw] leading-[0.9] sm:text-[clamp(72px,10vw,168px)]"
              >
                Find your
                <br />
                road family
              </h2>
            </Reveal>
          </div>
          <div className="mx-auto mt-16 flex w-full max-w-[90rem] flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <p className="max-w-md text-[17px] text-white/80 sm:text-xl">
              Claim a seat on this weekend&apos;s ride and roll out with people who ride like you
              do.
            </p>
            <Button
              nativeButton={false}
              size="lg"
              className="h-14 w-full px-8 text-lg sm:w-auto"
              render={<Link href={primaryCtaHref}>{primaryCtaLabel}</Link>}
            />
          </div>
          <details className="mx-auto mt-12 w-full max-w-[90rem] text-white/75">
            <summary className="w-fit cursor-pointer text-[15px] font-semibold underline-offset-4 hover:underline">
              Photo and film credits
            </summary>
            <ul className="mt-3 flex max-w-[75ch] flex-col gap-1 text-base leading-relaxed">
              {PHOTO_CREDITS.map((credit) => (
                <li key={credit}>{credit}</li>
              ))}
              <li>
                Photographs via Wikimedia Commons; opening photograph via Unsplash.
              </li>
            </ul>
          </details>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function FeaturedPhoto({ ride }: { ride: FeaturedRide }) {
  const isOrganized = ride.pricing_model === "organized";
  return (
    <Reveal delay={120}>
      <Link href={`/rides/${ride.id}`} className="group flex flex-col gap-3">
        <span className="bg-surface relative block aspect-4/5 w-full overflow-hidden rounded-md">
          <Image
            src={ride.cover_image_url ?? "/road/the-world-s-highest-motorable-claim-khardung.jpg"}
            alt={ride.cover_image_url ? (ride.title ?? "Ride of the week") : "Riders under the Khardung La summit sign"}
            fill
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
          {ride.destination && (
            <Milestone
              place={ride.destination}
              km={ride.estimated_distance_km}
              size="md"
              className="absolute bottom-4 left-4 max-w-[80%]"
            />
          )}
        </span>
        <span className="flex flex-col gap-0.5">
          <span className="text-lg font-bold group-hover:underline">
            {isOrganized ? "Tour of the week" : "Ride of the week"}: {ride.title}
          </span>
          <span className="text-muted-foreground text-[15px]">
            {[ride.city && `From ${ride.city}`, ride.organizer && `${isOrganized ? "Captain" : "Led by"} ${ride.organizer.name}`]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </span>
      </Link>
    </Reveal>
  );
}
