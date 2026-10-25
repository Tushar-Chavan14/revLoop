import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CountUp } from "@/components/design-system/count-up";
import { Milestone } from "@/components/design-system/milestone";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  LandingHero,
  type HeroRide,
  type HeroScene,
} from "@/features/landing/components/landing-hero";
import {
  DealtPrints,
  JourneyStone,
  PinnedStages,
  WipeUp,
} from "@/features/landing/components/scroll-scenes";
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


const PHOTO_CREDITS = [
  "“The world's highest motorable claim – Khardung La Pass” by Ashishyadav.photographs, CC BY-SA 4.0",
  "destination photographs from Wikipedia and Wikimedia Commons",
];

// The sequence is written, not counted: each stage of a ride is one line.
// The hero's two scenes on one ghat road, generated for RoadKin (kie.ai,
// scrollcraft/builds/roadkin-landing): the rider alone at first light, then
// the crew an hour later. Each has a 3:4 frame art-directed for phones.
const HERO_ALONE: HeroScene = {
  src: "/hero/scene1-alone.webp",
  mobileSrc: "/hero/scene1-alone-m.webp",
  alt: "A lone motorcyclist riding up a misty mountain highway at dawn, a white milestone with an orange top at the roadside",
  ink: "ink",
};
// The scrubbed ride: one generated 5 s clip of the crew (kling, from the crew
// still), reversed so scrolling down brings the riders toward the visitor,
// encoded with dense keyframes for seeking.
const HERO_RIDE: HeroRide = {
  mp4: "/hero/ride.mp4",
  mp4Mobile: "/hero/ride-m.mp4",
  poster: "/hero/ride-poster.webp",
  posterMobile: "/hero/ride-poster-m.webp",
};
const HERO_CREW: HeroScene = {
  src: "/hero/scene2-crew.webp",
  mobileSrc: "/hero/scene2-crew-m.webp",
  alt: "A crew of five motorcyclists riding together up the same mountain highway in warm morning light",
  ink: "ink",
};

// The roadside stone's journey is fixed copy, not data: the page is one ride
// down the length of India, Kashmir at the top of the page to Kanyakumari at
// the close (3,676 km by road), counted down as the visitor scrolls.
const STONE = { place: "Kanyakumari", km: 3676 } as const;

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



export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ hero?: string }>;
}) {
  // Preview switch while the hero is being chosen: the default is the
  // scroll-scrubbed ride; /?hero=wipe shows the two-scene wipe.
  const { hero } = await searchParams;
  const heroMode = hero === "wipe" ? "wipe" : "scrub";

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
          mode={heroMode}
          ride={HERO_RIDE}
          alone={HERO_ALONE}
          crew={HERO_CREW}
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

        {/* How a ride comes together: the frame holds while four lines step down. */}
        <PinnedStages stages={STAGES} />

        {/* Where the crews keep riding: the field opens, the prints are dealt. */}
        {prints.length >= 2 && <DealtPrints prints={prints} />}

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
                <div className="grid grid-cols-[minmax(3.25rem,auto)_1fr] items-baseline gap-x-4 sm:grid-cols-[52%_1fr] sm:gap-x-6">
                  <dd className="font-display text-left text-[15vw] leading-none tabular-nums sm:text-right sm:text-[clamp(64px,7vw,112px)]">
                    <CountUp value={row.value} />
                  </dd>
                  <dt className="text-[15px] font-medium sm:text-base">{row.label}</dt>
                </div>
              </Reveal>
            ))}
          </dl>
        </section>

        {/* The close: the idea again, inverted. */}
        <WipeUp className="bg-secondary text-secondary-foreground mt-36 flex min-h-[80svh] flex-col justify-between px-4 py-14 sm:px-8 lg:mt-52 lg:min-h-[90svh] lg:py-20">
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
                Photographs via Wikimedia Commons. The two opening road scenes are
                AI-generated for RoadKin.
              </li>
            </ul>
          </details>
        </WipeUp>
      </main>

      <JourneyStone place={STONE.place} km={STONE.km} />

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
