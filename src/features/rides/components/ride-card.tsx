"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Check, MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/ui/status-chip";
import { DEFAULT_RIDE_TYPE_ICON, RIDE_TYPE_ICONS, RIDE_TYPES } from "@/constants/ride-type";
import { RIDER_LEVELS } from "@/constants/rider-level";
import { SPEED_LEVELS } from "@/constants/speed-level";
import { hoverLift } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { RideWithOrganizer } from "@/services/rides";
import { formatRideDuration } from "@/utils/ride-duration";

function rideTypeLabel(value: string | null) {
  return RIDE_TYPES.find((type) => type.value === value)?.label ?? value;
}

function speedLabel(value: string | null) {
  return SPEED_LEVELS.find((level) => level.value === value)?.label ?? value;
}

function difficultyLabel(value: string | null) {
  return RIDER_LEVELS.find((level) => level.value === value)?.label ?? value;
}

// Difficulty reads as its own colour — beginner/intermediate/experienced —
// rather than a flat neutral badge, so pace is legible at a glance.
const DIFFICULTY_COLOR: Record<string, string> = {
  beginner: "border-level-beginner/30 text-level-beginner bg-level-beginner/10",
  intermediate: "border-level-intermediate/30 text-level-intermediate bg-level-intermediate/10",
  experienced: "border-level-experienced/30 text-level-experienced bg-level-experienced/10",
};

export function RideCard({
  ride,
  isJoined = false,
}: {
  ride: RideWithOrganizer;
  isJoined?: boolean;
}) {
  const isFull = ride.seats_available !== null && ride.seats_available <= 0;
  const lowSeats =
    !isFull &&
    ride.seats_available !== null &&
    ride.seats_available !== 0 &&
    ride.seats_available <= 2;
  const CoverIcon = (ride.ride_type && RIDE_TYPE_ICONS[ride.ride_type]) || DEFAULT_RIDE_TYPE_ICON;
  const duration = formatRideDuration(ride.estimated_duration_minutes);
  const riderCount = ride.member_count ?? 0;
  const isOrganized = ride.pricing_model === "organized";

  const cta = isJoined
    ? { label: "You're In", variant: "outline" as const, href: `/rides/${ride.id}` }
    : isFull
      ? { label: "View Ride", variant: "outline" as const, href: `/rides/${ride.id}` }
      : { label: "Claim Your Seat", variant: "default" as const, href: `/rides/${ride.id}#join` };

  return (
    <motion.div
      {...hoverLift}
      className="group bg-card ring-foreground/10 hover:ring-primary/40 flex flex-col overflow-hidden rounded-2xl ring-1 transition-shadow duration-300 hover:shadow-xl"
    >
      <Link
        href={`/rides/${ride.id}`}
        className="focus-visible:ring-primary flex flex-1 flex-col outline-none focus-visible:ring-2"
      >
        <div className="from-secondary via-secondary/60 to-secondary/20 relative aspect-4/3 w-full overflow-hidden bg-linear-to-br">
          {ride.cover_image_url ? (
            <Image
              src={ride.cover_image_url}
              alt={ride.title ?? "Ride cover"}
              fill
              unoptimized
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <CoverIcon className="text-secondary-foreground/20 absolute -right-4 -bottom-4 size-32" />
          )}
          {/* Darkens top and bottom regardless of the uploaded photo's own
              brightness — a light/white cover photo would otherwise make the
              white badge text and title illegible. */}
          <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/0 to-black/85" />

          <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
            <Badge variant="secondary" className="bg-white/15 text-white backdrop-blur-sm">
              {rideTypeLabel(ride.ride_type)}
            </Badge>
            {ride.seats_available !== null && (
              <StatusChip
                status={isFull ? "full" : lowSeats ? "filling" : "open"}
                className="border-transparent bg-white/15 text-white backdrop-blur-sm"
              >
                {isFull ? "Full" : `${ride.seats_available} seats left`}
              </StatusChip>
            )}
          </div>

          <div className="absolute inset-x-3 bottom-3 flex flex-col gap-1.5">
            <p className="font-heading truncate text-lg font-semibold text-balance text-white">
              {ride.title}
            </p>
            {ride.organizer && (
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "size-1.5 shrink-0 rounded-full",
                    isOrganized ? "bg-ride-organized" : "bg-ride-community",
                  )}
                />
                <p className="text-telemetry truncate text-[10px] text-white/70">
                  {isOrganized ? "Captain" : "Led by"} {ride.organizer.name}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {ride.speed && (
              <Badge variant="outline" className="text-muted-foreground">
                {speedLabel(ride.speed)}
              </Badge>
            )}
            {ride.difficulty && (
              <Badge
                variant="outline"
                className={cn(
                  DIFFICULTY_COLOR[ride.difficulty] ?? "text-muted-foreground",
                  "border",
                )}
              >
                {difficultyLabel(ride.difficulty)}
              </Badge>
            )}
            {ride.estimated_distance_km && (
              <Badge variant="outline" className="text-muted-foreground">
                {ride.estimated_distance_km} km
              </Badge>
            )}
            {duration && (
              <Badge variant="outline" className="text-muted-foreground">
                {duration}
              </Badge>
            )}
          </div>

          <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
            <MapPin className="text-muted-foreground size-3.5 shrink-0" />
            <span className="truncate">{ride.destination}</span>
          </div>

          <p className="text-muted-foreground text-xs">
            {ride.ride_date && format(new Date(ride.ride_date), "EEE, MMM d")}
            {ride.departure_time && ` · ${ride.departure_time.slice(0, 5)}`}
            {riderCount > 0 && ` · ${riderCount} rider${riderCount === 1 ? "" : "s"} in`}
          </p>
        </div>
      </Link>

      {ride.organizer && (
        <div className="border-border/60 flex items-center justify-between gap-2 border-t px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <Avatar size="sm">
              <AvatarImage
                src={ride.organizer.profile_image_url ?? undefined}
                alt={ride.organizer.name}
              />
              <AvatarFallback>{ride.organizer.name?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <p className="text-muted-foreground truncate text-xs">{ride.organizer.name}</p>
          </div>
          <Button
            nativeButton={false}
            size="sm"
            variant={cta.variant}
            className="shrink-0"
            render={
              <Link href={cta.href}>
                {isJoined && <Check className="size-3.5" />}
                {cta.label}
              </Link>
            }
          />
        </div>
      )}
    </motion.div>
  );
}
