import Link from "next/link";
import { MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { RIDE_TYPE_ICONS, RIDE_TYPES } from "@/constants/ride-type";
import { APP_DESCRIPTION, APP_TAGLINE } from "@/constants/site";
import { RideCard } from "@/features/rides/components/ride-card";
import { getAuthUser } from "@/services/profiles";
import {
  getCommunityStats,
  getPopularDestinations,
  getRecentRides,
  getUpcomingRides,
} from "@/services/rides";

export default async function HomePage() {
  const [user, upcomingRides, recentRides, popularDestinations, stats] = await Promise.all([
    getAuthUser(),
    getUpcomingRides(6),
    getRecentRides(6),
    getPopularDestinations(6),
    getCommunityStats(),
  ]);

  const primaryCtaHref = user ? "/rides/create" : "/login";
  const primaryCtaLabel = user ? "Create a ride" : "Get started";

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />

      <section className="bg-secondary text-secondary-foreground relative overflow-hidden px-6 py-24">
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
          className="text-primary/40 bg-road-dashes absolute top-0 right-0 left-0 h-1"
        />

        <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <span className="border-secondary-foreground/20 text-secondary-foreground/70 rounded-full border px-3 py-1 text-xs font-medium tracking-wide uppercase">
            Built by riders, for riders
          </span>
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance uppercase sm:text-6xl">
            {APP_TAGLINE}
          </h1>
          <p className="text-secondary-foreground/70 max-w-xl text-lg">{APP_DESCRIPTION}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              nativeButton={false}
              render={<Link href={primaryCtaHref}>{primaryCtaLabel}</Link>}
              size="lg"
            />
            <Button
              nativeButton={false}
              render={<Link href="/rides">Discover rides</Link>}
              size="lg"
              variant="outline"
              className="border-secondary-foreground/20 text-secondary-foreground hover:bg-secondary-foreground/10 bg-transparent"
            />
          </div>

          <div className="border-secondary-foreground/10 mt-6 grid w-full max-w-lg grid-cols-3 gap-4 border-t pt-6">
            <StatItem label="Riders" value={stats.ridersCount} />
            <StatItem label="Rides planned" value={stats.upcomingRidesCount} />
            <StatItem label="Cities" value={stats.citiesCount} />
          </div>
        </div>
      </section>

      <main className="flex flex-1 flex-col gap-16 px-6 py-16">
        <section id="upcoming-rides" className="mx-auto flex w-full max-w-6xl flex-col gap-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-heading text-2xl font-semibold tracking-tight">Upcoming rides</h2>
              <p className="text-muted-foreground">Open the app on Friday. Ride on Saturday.</p>
            </div>
            <Button
              nativeButton={false}
              render={<Link href="/rides">See all</Link>}
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex"
            />
          </div>
          {upcomingRides.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingRides.map((ride) => (
                <RideCard key={ride.id} ride={ride} />
              ))}
            </div>
          ) : (
            <EmptyState primaryCtaHref={primaryCtaHref} primaryCtaLabel={primaryCtaLabel} />
          )}
        </section>

        {popularDestinations.length > 0 && (
          <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              Popular destinations
            </h2>
            <div className="flex flex-wrap gap-3">
              {popularDestinations.map((destination) => (
                <Link
                  key={destination.city}
                  href={`/rides?cityLat=${destination.lat}&cityLng=${destination.lng}&cityLabel=${encodeURIComponent(destination.city)}`}
                  className="border-border hover:border-primary/60 hover:bg-primary/5 flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors"
                >
                  <MapPin className="text-primary size-3.5" />
                  <span className="font-medium">{destination.city}</span>
                  <span className="text-muted-foreground">
                    {destination.rideCount} ride{destination.rideCount === 1 ? "" : "s"}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">Every kind of ride</h2>
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

        {recentRides.length > 0 && (
          <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
            <h2 className="font-heading text-2xl font-semibold tracking-tight">Recently created</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {recentRides.map((ride) => (
                <RideCard key={ride.id} ride={ride} />
              ))}
            </div>
          </section>
        )}
      </main>

      <section className="bg-secondary text-secondary-foreground relative overflow-hidden px-6 py-20">
        <div
          aria-hidden
          className="bg-primary/20 pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl"
        />
        <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
          <Users className="text-primary size-8" />
          <h2 className="font-heading text-3xl font-semibold tracking-tight">
            Ready to plan your next ride?
          </h2>
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

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="font-heading text-2xl font-semibold">{value.toLocaleString()}+</span>
      <span className="text-secondary-foreground/60 text-xs tracking-wide uppercase">{label}</span>
    </div>
  );
}

function EmptyState({
  primaryCtaHref,
  primaryCtaLabel,
}: {
  primaryCtaHref: string;
  primaryCtaLabel: string;
}) {
  return (
    <div className="border-border flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
      <p className="text-muted-foreground">No rides yet — be the first to plan one.</p>
      <Button nativeButton={false} render={<Link href={primaryCtaHref}>{primaryCtaLabel}</Link>} />
    </div>
  );
}
