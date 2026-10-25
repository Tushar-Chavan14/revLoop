import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Milestone } from "@/components/design-system/milestone";
import { DEFAULT_RIDE_TYPE_ICON, RIDE_TYPE_ICONS, RIDE_TYPES } from "@/constants/ride-type";
import { RIDER_LEVELS } from "@/constants/rider-level";
import { SPEED_LEVELS } from "@/constants/speed-level";
import { cn } from "@/lib/utils";
import type { RideCardData } from "@/services/rides";
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

// Difficulty is a coloured dot beside an ink label — coloured text on white
// fails contrast, and the dot is enough to read pace at a glance.
const DIFFICULTY_DOT: Record<string, string> = {
  beginner: "bg-level-beginner",
  intermediate: "bg-level-intermediate",
  experienced: "bg-level-experienced",
};

/**
 * The photograph is the card (no box, no shadow): the ride's cover with its
 * milestone — destination and distance — on the roadside corner, then the
 * facts set flat underneath like a catalogue entry.
 */
export function RideCard({ ride, isJoined = false }: { ride: RideCardData; isJoined?: boolean }) {
  const isFull = ride.seats_available !== null && ride.seats_available <= 0;
  const lowSeats = !isFull && ride.seats_available !== null && ride.seats_available <= 2;
  const CoverIcon = (ride.ride_type && RIDE_TYPE_ICONS[ride.ride_type]) || DEFAULT_RIDE_TYPE_ICON;
  const duration = formatRideDuration(ride.estimated_duration_minutes);
  const riderCount = ride.member_count ?? 0;
  const isOrganized = ride.pricing_model === "organized";

  const cta = isJoined
    ? { label: "You're in", href: `/rides/${ride.id}` }
    : isFull
      ? { label: "View ride", href: `/rides/${ride.id}` }
      : { label: "Claim your seat", href: `/rides/${ride.id}#join` };

  const facts = [
    ride.ride_date && format(new Date(ride.ride_date), "EEE, d MMM"),
    ride.departure_time?.slice(0, 5),
    ride.city && `from ${ride.city}`,
  ].filter(Boolean);

  return (
    <article className="group flex flex-col gap-3">
      <Link
        href={`/rides/${ride.id}`}
        className="focus-visible:ring-ring bg-surface relative block aspect-4/3 w-full overflow-hidden rounded-md outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        {ride.cover_image_url ? (
          <Image
            src={ride.cover_image_url}
            alt={ride.title ?? "Ride cover"}
            fill
            sizes="(min-width: 1024px) 368px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <span className="bg-secondary absolute inset-0 flex items-center justify-center">
            <CoverIcon className="size-20 text-white/15" aria-hidden />
          </span>
        )}

        <span className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <span
            className={cn(
              "inline-flex h-6 items-center rounded-sm px-2 text-xs font-bold",
              isOrganized ? "bg-primary text-[#111]" : "bg-white text-[#111]",
            )}
          >
            {isOrganized ? "Organized tour" : rideTypeLabel(ride.ride_type)}
          </span>
          {ride.seats_available !== null && (
            <span
              className={cn(
                "inline-flex h-6 items-center gap-1.5 rounded-sm px-2 text-xs font-bold tabular-nums",
                isFull ? "bg-[#111] text-white" : "bg-white text-[#111]",
              )}
            >
              {!isFull && (
                <span
                  className={cn("size-1.5 rounded-full", lowSeats ? "bg-primary" : "bg-[#1f7a45]")}
                />
              )}
              {isFull
                ? "Full"
                : `${ride.seats_available} seat${ride.seats_available === 1 ? "" : "s"} left`}
            </span>
          )}
        </span>

        {ride.destination && (
          <Milestone
            place={ride.destination}
            km={ride.estimated_distance_km}
            className="absolute bottom-3 left-3 max-w-[70%]"
          />
        )}
      </Link>

      <div className="flex flex-col gap-1">
        <h3 className="text-base leading-snug font-bold">
          <Link href={`/rides/${ride.id}`} className="decoration-2 underline-offset-4 hover:underline">
            {ride.title}
          </Link>
        </h3>
        <p className="text-muted-foreground text-sm tabular-nums">{facts.join(" · ")}</p>
        <p className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          {ride.difficulty && (
            <span className="text-foreground inline-flex items-center gap-1.5">
              <span
                className={cn(
                  "size-2 rounded-full",
                  DIFFICULTY_DOT[ride.difficulty] ?? "bg-muted-foreground",
                )}
              />
              {difficultyLabel(ride.difficulty)}
            </span>
          )}
          {ride.speed && <span>{speedLabel(ride.speed)} pace</span>}
          {duration && <span>{duration}</span>}
          {riderCount > 0 && (
            <span className="tabular-nums">
              {riderCount} rider{riderCount === 1 ? "" : "s"} in
            </span>
          )}
        </p>
      </div>

      {ride.organizer && (
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Avatar size="sm">
              <AvatarImage
                src={ride.organizer.profile_image_url ?? undefined}
                alt={ride.organizer.name}
              />
              <AvatarFallback>{ride.organizer.name?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <p className="text-muted-foreground truncate text-sm">
              {isOrganized ? "Captain" : "Led by"}{" "}
              <span className="text-foreground font-semibold">{ride.organizer.name}</span>
            </p>
          </div>
          <Link
            href={cta.href}
            className={cn(
              "inline-flex shrink-0 items-center gap-1 text-sm font-bold underline-offset-4 hover:underline",
              isJoined || isFull ? "text-foreground" : "text-primary-ink",
            )}
          >
            {isJoined && <Check className="size-3.5" aria-hidden />}
            {cta.label}
            {!isJoined && (
              <ArrowRight
                className="size-3.5 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            )}
          </Link>
        </div>
      )}
    </article>
  );
}
