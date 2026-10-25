import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UnsplashImage } from "@/components/unsplash-image";
import { WeekendCountdown } from "@/features/landing/components/weekend-countdown";

interface LandingHeroProps {
  /** A bare images.unsplash.com photo URL — sized on Unsplash's CDN. */
  image: string;
  imageAlt: string;
  ctaHref: string;
  ctaLabel: string;
  weekendRideCount: number;
}

// Each line of the sentence is sized to the screen's height as well as its
// width, so the two lines plus the road between them always fill one screen.
const LINE_SIZE = "text-[min(17vw,7rem)] lg:text-[min(12vw,18svh)]";

/**
 * "Never ride [the road] alone again" — the tagline split by the road itself:
 * a full-bleed photograph runs between the two lines. The live countdown and
 * the call to action sit in the corners the type leaves open.
 */
export function LandingHero({
  image,
  imageAlt,
  ctaHref,
  ctaLabel,
  weekendRideCount,
}: LandingHeroProps) {
  const intro = (
    <div className="flex max-w-[30rem] flex-col gap-4">
      <p className="text-lg leading-snug font-medium text-pretty">
        RoadKin is where India&apos;s weekend motorcycle crews plan their rides: route, meeting
        pin, pace and seats on one page.
      </p>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Button nativeButton={false} size="lg" render={<Link href={ctaHref}>{ctaLabel}</Link>} />
        <Link
          href="/rides"
          className="text-[15px] font-bold underline decoration-2 underline-offset-4 hover:decoration-[3px]"
        >
          See every ride
        </Link>
      </div>
    </div>
  );

  return (
    <section aria-labelledby="hero-title" className="relative">
      <div className="flex flex-col overflow-hidden lg:h-[calc(100svh-4rem)] lg:min-h-[40rem]">
        <div className="relative mx-auto flex w-full max-w-[90rem] flex-1 flex-col px-4 pt-6 pb-6 sm:px-8 lg:min-h-0 lg:pt-4">
          {/* The road sits inside the h1 (hidden from assistive tech, which
              reads "Never ride alone again"). */}
          <h1
            id="hero-title"
            aria-label="Never ride alone again"
            className={`font-display flex flex-col gap-4 leading-[0.86] lg:min-h-0 lg:flex-1 lg:gap-5 ${LINE_SIZE}`}
          >
            <span aria-hidden className="block">
              Never ride
            </span>
            <span
              aria-hidden
              className="bg-secondary relative -mx-4 block aspect-4/3 overflow-hidden sm:-mx-8 sm:aspect-video lg:mx-[calc(50%-50vw)] lg:aspect-auto lg:min-h-0 lg:flex-1"
            >
              <UnsplashImage
                src={image}
                alt={imageAlt}
                fill
                preload
                sizes="100vw"
                className="object-cover object-[50%_40%]"
              />
            </span>
            <span aria-hidden className="block self-end">
              alone again
            </span>
          </h1>

          {/* Wide screens: the countdown answers line one from the top-right,
              the intro and action share line two's baseline on the left. */}
          <div className="absolute top-4 right-8 hidden h-[calc(min(12vw,18svh)*0.86)] items-end xl:flex">
            <WeekendCountdown rideCount={weekendRideCount} />
          </div>
          <div className="absolute bottom-6 left-8 hidden xl:block">{intro}</div>

          {/* Narrower screens: the same two blocks follow the sentence. */}
          <div className="mt-8 flex flex-col-reverse gap-8 sm:flex-row sm:items-end sm:justify-between xl:hidden">
            {intro}
            <WeekendCountdown rideCount={weekendRideCount} />
          </div>
        </div>
      </div>
    </section>
  );
}
