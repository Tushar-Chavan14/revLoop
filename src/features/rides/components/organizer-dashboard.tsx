import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ManageRequestsPanel } from "@/features/rides/components/manage-requests-panel";
import type { RideRequestWithRequester } from "@/services/ride-participation";
import type { RideWithOrganizer } from "@/services/rides";

interface OrganizerDashboardProps {
  upcoming: RideWithOrganizer[];
  past: RideWithOrganizer[];
  nearestRideRequests: RideRequestWithRequester[];
  pendingCounts: Record<string, number>;
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

export function OrganizerDashboard({
  upcoming,
  past,
  nearestRideRequests,
  pendingCounts,
}: OrganizerDashboardProps) {
  if (upcoming.length === 0 && past.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-muted-foreground">You haven&apos;t organized any rides yet.</p>
          <Button nativeButton={false} render={<Link href="/rides/create">Create a ride</Link>} />
        </CardContent>
      </Card>
    );
  }

  const [nearest, ...restUpcoming] = upcoming;
  const isNearestFull = nearest
    ? nearest.seats_available !== null && nearest.seats_available <= 0
    : false;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-semibold tracking-tight">Upcoming rides</h2>

        {nearest ? (
          <>
            <Card>
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-primary text-xs font-medium tracking-wide uppercase">
                    Your next ride
                  </p>
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

            <ManageRequestsPanel requests={nearestRideRequests} isRideFull={isNearestFull} />

            {restUpcoming.length > 0 && (
              <div className="flex flex-col gap-2">
                {restUpcoming.map((ride) => (
                  <RideRow
                    key={ride.id}
                    ride={ride}
                    pendingCount={ride.id ? pendingCounts[ride.id] : undefined}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <p className="text-muted-foreground text-sm">No upcoming rides.</p>
        )}
      </div>

      {past.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="font-heading text-lg font-semibold tracking-tight">Past rides</h2>
          <div className="flex flex-col gap-2">
            {past.map((ride) => (
              <RideRow key={ride.id} ride={ride} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RideRow({ ride, pendingCount }: { ride: RideWithOrganizer; pendingCount?: number }) {
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
      <div className="flex shrink-0 items-center gap-2">
        {!!pendingCount && <Badge>{pendingCount} pending</Badge>}
        {ride.seats_available !== null && ride.max_riders !== null && (
          <span className="text-muted-foreground text-xs">
            {ride.seats_available}/{ride.max_riders} left
          </span>
        )}
      </div>
    </Link>
  );
}
