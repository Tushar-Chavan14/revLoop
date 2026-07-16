import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import {
  Bike,
  Calendar,
  Clock,
  ExternalLink,
  Fuel,
  MapPin,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { JoinRequestCard } from "@/features/rides/components/join-request-card";
import { ParticipantsList } from "@/features/rides/components/participants-list";
import { RideMap } from "@/features/rides/components/ride-map";
import { DEFAULT_RIDE_TYPE_ICON, RIDE_TYPE_ICONS, RIDE_TYPES } from "@/constants/ride-type";
import { SPEED_LEVELS } from "@/constants/speed-level";
import { getAuthUser } from "@/services/profiles";
import { getMyRideRequest, getRideMembers } from "@/services/ride-participation";
import { getRideById } from "@/services/rides";
import { capitalize } from "@/utils/capitalize";

type RideDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: RideDetailPageProps) {
  const { id } = await params;
  const ride = await getRideById(id);
  if (!ride) {
    return { title: "Ride not found" };
  }

  const parts = [
    ride.destination && `to ${ride.destination}`,
    ride.ride_date && format(new Date(ride.ride_date), "MMM d, yyyy"),
    ride.city && `from ${ride.city}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    title: ride.title ?? "Ride",
    description: ride.description?.slice(0, 160) || `Group motorcycle ride ${parts}`.trim(),
    openGraph: ride.cover_image_url ? { images: [{ url: ride.cover_image_url }] } : undefined,
  };
}

function optionLabel(options: readonly { value: string; label: string }[], value: string | null) {
  return options.find((option) => option.value === value)?.label ?? value;
}

export default async function RideDetailPage({ params }: RideDetailPageProps) {
  const { id } = await params;

  const ride = await getRideById(id);
  if (!ride) {
    notFound();
  }

  const user = await getAuthUser();
  const isOrganizer = user?.id === ride.organizer_id;

  const members = await getRideMembers(id);
  const isMember = user ? members.some((member) => member.user_id === user.id) : false;
  const myRequest = user && !isOrganizer && !isMember ? await getMyRideRequest(id, user.id) : null;
  const isRideFull = ride.seats_available !== null && ride.seats_available <= 0;

  const meeting =
    ride.meeting_lat !== null && ride.meeting_lng !== null
      ? { lat: ride.meeting_lat, lng: ride.meeting_lng }
      : null;
  const destination =
    ride.destination_lat !== null && ride.destination_lng !== null
      ? { lat: ride.destination_lat, lng: ride.destination_lng }
      : null;

  const badges = [
    ride.ride_type && optionLabel(RIDE_TYPES, ride.ride_type),
    ride.speed && optionLabel(SPEED_LEVELS, ride.speed),
    ride.difficulty && capitalize(ride.difficulty),
  ].filter(Boolean);

  const rules = [
    ride.breakfast_stop && "Breakfast stop",
    ride.fuel_stop && "Fuel stop",
    ride.helmet_required && "Helmet required",
    ride.pillion_allowed && "Pillion allowed",
  ].filter(Boolean) as string[];

  const CoverIcon = (ride.ride_type && RIDE_TYPE_ICONS[ride.ride_type]) || DEFAULT_RIDE_TYPE_ICON;

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-12">
        <div className="from-secondary via-secondary/70 to-primary/30 relative aspect-video w-full overflow-hidden rounded-2xl bg-linear-to-br">
          {ride.cover_image_url ? (
            <Image
              src={ride.cover_image_url}
              alt={ride.title ?? "Ride cover"}
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <CoverIcon className="text-secondary-foreground/20 absolute -right-6 -bottom-6 size-48" />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent" />

          <div className="absolute inset-x-4 bottom-4 flex flex-col gap-2 sm:inset-x-6 sm:bottom-6">
            <div className="flex flex-wrap gap-2">
              {badges.map((badge) => (
                <Badge
                  key={badge}
                  variant="secondary"
                  className="bg-white/15 text-white backdrop-blur-sm"
                >
                  {badge}
                </Badge>
              ))}
            </div>
            <h1 className="font-heading text-2xl font-semibold text-balance text-white sm:text-3xl">
              {ride.title}
            </h1>
            {ride.organizer && (
              <div className="flex items-center gap-2 text-sm text-white/80">
                <Avatar size="sm">
                  <AvatarImage
                    src={ride.organizer.profile_image_url ?? undefined}
                    alt={ride.organizer.name}
                  />
                  <AvatarFallback>
                    <UserRound className="size-3.5" />
                  </AvatarFallback>
                </Avatar>
                Organized by {ride.organizer.name}
              </div>
            )}
          </div>
        </div>

        {(isOrganizer || isMember) && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-2">
              {isOrganizer && (
                <Button
                  nativeButton={false}
                  render={<Link href={`/rides/${id}/edit`}>Edit ride</Link>}
                  variant="outline"
                  size="sm"
                />
              )}
              {isMember && (
                <Button
                  nativeButton={false}
                  render={<Link href={`/rides/${id}/chat`}>Ride chat</Link>}
                  variant="outline"
                  size="sm"
                />
              )}
            </div>
            {isOrganizer && (
              <Link href="/profile" className="text-muted-foreground text-xs hover:underline">
                Manage join requests from your profile →
              </Link>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat
            icon={Calendar}
            label="Date"
            value={ride.ride_date && format(new Date(ride.ride_date), "MMM d, yyyy")}
          />
          <Stat icon={Clock} label="Departs" value={ride.departure_time?.slice(0, 5)} />
          <Stat
            icon={Users}
            label="Seats"
            value={
              ride.seats_available !== null && ride.max_riders !== null
                ? `${ride.seats_available} of ${ride.max_riders} left`
                : undefined
            }
          />
          <Stat
            icon={Bike}
            label="Distance"
            value={ride.estimated_distance_km ? `${ride.estimated_distance_km} km` : undefined}
          />
        </div>

        {ride.description && (
          <Card>
            <CardContent>
              <p className="text-muted-foreground">{ride.description}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <MapPin className="text-primary mt-0.5 size-4 shrink-0" />
              <div>
                <p className="text-sm font-medium">{ride.meeting_point}</p>
                <p className="text-muted-foreground text-xs">Meeting point</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="text-foreground mt-0.5 size-4 shrink-0" />
              <div>
                <p className="text-sm font-medium">{ride.destination}</p>
                <p className="text-muted-foreground text-xs">Destination</p>
                {ride.destination_map_url && (
                  <a
                    href={ride.destination_map_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary mt-1 flex items-center gap-1.5 text-xs hover:underline"
                  >
                    <ExternalLink className="size-3.5" />
                    View on Google Maps
                  </a>
                )}
              </div>
            </div>
            <RideMap meeting={meeting} destination={destination} interactive={false} />
          </CardContent>
        </Card>

        {rules.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {rules.map((rule) => (
              <Badge key={rule} variant="outline" className="text-muted-foreground">
                {rule === "Fuel stop" ? (
                  <Fuel className="size-3.5" />
                ) : (
                  <ShieldCheck className="size-3.5" />
                )}
                {rule}
              </Badge>
            ))}
          </div>
        )}

        <ParticipantsList
          members={members}
          currentUserId={user?.id ?? null}
          isOrganizer={isOrganizer}
        />

        {!isOrganizer && !isMember && user && (
          <JoinRequestCard rideId={id} myRequest={myRequest} isRideFull={isRideFull} />
        )}

        {!isOrganizer && !isMember && !user && (
          <Card>
            <CardContent className="flex items-center justify-between gap-3">
              <p className="text-muted-foreground text-sm">Sign in to request to join this ride.</p>
              <Button nativeButton={false} size="sm" render={<Link href="/login">Sign in</Link>} />
            </CardContent>
          </Card>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Calendar;
  label: string;
  value?: string | null;
}) {
  if (!value) {
    return null;
  }
  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-1.5">
        <Icon className="text-primary size-4" />
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </CardContent>
    </Card>
  );
}
