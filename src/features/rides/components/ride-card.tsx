import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { MapPin, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DEFAULT_RIDE_TYPE_ICON, RIDE_TYPE_ICONS, RIDE_TYPES } from "@/constants/ride-type";
import { SPEED_LEVELS } from "@/constants/speed-level";
import type { RideWithOrganizer } from "@/services/rides";
import { formatRideDuration } from "@/utils/ride-duration";

function rideTypeLabel(value: string | null) {
  return RIDE_TYPES.find((type) => type.value === value)?.label ?? value;
}

function speedLabel(value: string | null) {
  return SPEED_LEVELS.find((level) => level.value === value)?.label ?? value;
}

export function RideCard({ ride }: { ride: RideWithOrganizer }) {
  const lowSeats =
    ride.seats_available !== null && ride.seats_available !== 0 && ride.seats_available <= 2;
  const CoverIcon = (ride.ride_type && RIDE_TYPE_ICONS[ride.ride_type]) || DEFAULT_RIDE_TYPE_ICON;
  const duration = formatRideDuration(ride.estimated_duration_minutes);

  return (
    <Link
      href={`/rides/${ride.id}`}
      className="group bg-card ring-foreground/10 hover:ring-primary/50 focus-visible:ring-primary flex flex-col overflow-hidden rounded-2xl ring-1 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:ring-2 focus-visible:outline-none"
    >
      <div className="from-secondary via-secondary/60 to-primary/30 relative aspect-4/3 w-full overflow-hidden bg-linear-to-br">
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
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent" />

        <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
          <Badge variant="secondary" className="bg-white/15 text-white backdrop-blur-sm">
            {rideTypeLabel(ride.ride_type)}
          </Badge>
          {ride.seats_available !== null && (
            <Badge
              variant={lowSeats ? "default" : "secondary"}
              className={lowSeats ? undefined : "bg-white/15 text-white backdrop-blur-sm"}
            >
              <Users className="size-3" />
              {ride.seats_available} left
            </Badge>
          )}
        </div>

        <div className="absolute inset-x-3 bottom-3">
          <p className="font-heading truncate text-lg font-semibold text-balance text-white">
            {ride.title}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {ride.speed && (
            <Badge variant="outline" className="text-muted-foreground">
              {speedLabel(ride.speed)}
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
          <MapPin className="text-primary size-3.5 shrink-0" />
          <span className="truncate">{ride.destination}</span>
        </div>

        <p className="text-muted-foreground text-xs">
          {ride.ride_date && format(new Date(ride.ride_date), "EEE, MMM d")}
          {ride.departure_time && ` · ${ride.departure_time.slice(0, 5)}`}
        </p>

        {ride.organizer && (
          <div className="mt-auto flex items-center gap-2 pt-1">
            <Avatar size="sm">
              <AvatarImage
                src={ride.organizer.profile_image_url ?? undefined}
                alt={ride.organizer.name}
              />
              <AvatarFallback>{ride.organizer.name?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <p className="text-muted-foreground text-xs">By {ride.organizer.name}</p>
          </div>
        )}
      </div>
    </Link>
  );
}
