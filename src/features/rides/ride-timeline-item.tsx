import { format } from "date-fns";
import type { VariantProps } from "class-variance-authority";
import { StatusChip, type statusChipVariants } from "@/components/ui/status-chip";
import type { TimelineItemData } from "@/components/design-system/timeline";
import { DEFAULT_RIDE_TYPE_ICON, RIDE_TYPE_ICONS } from "@/constants/ride-type";
import type { RideWithOrganizer } from "@/services/rides";

/** Shared shape for rendering a ride as a Timeline row — My Rides, public rider profile history. */
export function rideToTimelineItem(
  ride: RideWithOrganizer,
  active: boolean,
  chipStatus: NonNullable<VariantProps<typeof statusChipVariants>["status"]>,
): TimelineItemData {
  const Icon = (ride.ride_type && RIDE_TYPE_ICONS[ride.ride_type]) || DEFAULT_RIDE_TYPE_ICON;
  const riderCount = ride.member_count ?? 0;
  return {
    icon: Icon,
    title: ride.title ?? "Ride",
    time: ride.ride_date ? format(new Date(ride.ride_date), "EEE, MMM d, yyyy") : undefined,
    description: ride.destination ?? undefined,
    active,
    href: `/rides/${ride.id}`,
    badge:
      riderCount > 0 ? (
        <StatusChip status={chipStatus} pulse={chipStatus === "live"} className="shrink-0">
          {riderCount} rider{riderCount === 1 ? "" : "s"}
        </StatusChip>
      ) : undefined,
  };
}
