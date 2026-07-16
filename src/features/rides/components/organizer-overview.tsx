import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RideRequestsAccordion } from "@/features/rides/components/ride-requests-accordion";
import type { RideRequestWithRequester } from "@/services/ride-participation";
import type { RideWithOrganizer } from "@/services/rides";

interface OrganizerOverviewProps {
  upcoming: RideWithOrganizer[];
  past: RideWithOrganizer[];
  requests: RideRequestWithRequester[];
}

function rideSummaryLine(ride: RideWithOrganizer) {
  return [
    ride.ride_date && format(new Date(ride.ride_date), "EEE, MMM d"),
    ride.departure_time && ride.departure_time.slice(0, 5),
    ride.seats_available !== null && ride.max_riders !== null
      ? `${ride.seats_available} of ${ride.max_riders} seats left`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function OrganizerOverview({ upcoming, past, requests }: OrganizerOverviewProps) {
  if (upcoming.length === 0 && past.length === 0) {
    return (
      <Card className="border-border border">
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-muted-foreground">You haven&apos;t organized any rides yet.</p>
          <Button nativeButton={false} render={<Link href="/rides/create">Create a ride</Link>} />
        </CardContent>
      </Card>
    );
  }

  const [nearest, ...restUpcoming] = upcoming;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <div className="flex flex-col gap-6 lg:col-span-3 lg:max-h-[80vh] lg:overflow-y-auto lg:pr-2">
        <section className="flex flex-col gap-3">
          <h2 className="font-heading text-lg font-semibold tracking-tight">
            Nearest upcoming ride
          </h2>
          {nearest ? (
            <Card className="border-border border">
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <Link
                    href={`/rides/${nearest.id}`}
                    className="font-heading truncate text-lg font-semibold hover:underline"
                  >
                    {nearest.title}
                  </Link>
                  <p className="text-muted-foreground text-sm">{rideSummaryLine(nearest)}</p>
                </div>
                <Button
                  nativeButton={false}
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  render={<Link href={`/rides/${nearest.id}`}>View ride</Link>}
                />
              </CardContent>
            </Card>
          ) : (
            <p className="text-muted-foreground text-sm">No upcoming rides.</p>
          )}
        </section>

        <section className="border-border flex flex-col gap-3 border-t pt-6">
          <h2 className="font-heading text-lg font-semibold tracking-tight">Upcoming rides</h2>
          {restUpcoming.length > 0 ? (
            <div className="flex flex-col gap-2">
              {restUpcoming.map((ride) => (
                <RideRow key={ride.id} ride={ride} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Nothing else coming up.</p>
          )}
        </section>

        <section className="border-border flex flex-col gap-3 border-t pt-6">
          <h2 className="font-heading text-lg font-semibold tracking-tight">Past rides</h2>
          {past.length > 0 ? (
            <div className="flex flex-col gap-2">
              {past.map((ride) => (
                <RideRow key={ride.id} ride={ride} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No past rides yet.</p>
          )}
        </section>
      </div>

      <div className="border-border flex flex-col gap-3 lg:col-span-2 lg:max-h-[80vh] lg:overflow-y-auto lg:border-l lg:pl-6">
        <RideRequestsAccordion rides={upcoming} requests={requests} />
      </div>
    </div>
  );
}

function RideRow({ ride }: { ride: RideWithOrganizer }) {
  return (
    <Link
      href={`/rides/${ride.id}`}
      className="border-border hover:border-primary/50 flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm transition-colors"
    >
      <div className="min-w-0">
        <p className="truncate font-medium">{ride.title}</p>
        <p className="text-muted-foreground text-xs">
          {ride.ride_date && format(new Date(ride.ride_date), "EEE, MMM d, yyyy")}
        </p>
      </div>
      {ride.seats_available !== null && ride.max_riders !== null && (
        <Badge variant="outline" className="text-muted-foreground shrink-0">
          {ride.seats_available}/{ride.max_riders} left
        </Badge>
      )}
    </Link>
  );
}
