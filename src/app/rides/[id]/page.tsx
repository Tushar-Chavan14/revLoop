import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import {
  Bike,
  Calendar,
  Check,
  Clock,
  Coffee,
  ExternalLink,
  Flag,
  Fuel,
  Hourglass,
  IndianRupee,
  MapPin,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusChip } from "@/components/ui/status-chip";
import { ImageGallery } from "@/components/design-system/image-gallery";
import { MapContainer } from "@/components/design-system/map-container";
import { Timeline, type TimelineItemData } from "@/components/design-system/timeline";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { BookRideCard } from "@/features/rides/components/book-ride-card";
import { JoinRequestCard } from "@/features/rides/components/join-request-card";
import { ParticipantsList } from "@/features/rides/components/participants-list";
import { RideChatWidget } from "@/features/rides/components/ride-chat-widget";
import { RideMap } from "@/features/rides/components/ride-map";
import { ShareRideButton } from "@/features/rides/components/share-ride-button";
import { DEFAULT_RIDE_TYPE_ICON, RIDE_TYPE_ICONS, RIDE_TYPES } from "@/constants/ride-type";
import { SPEED_LEVELS } from "@/constants/speed-level";
import { RIDE_INCLUSIONS } from "@/constants/ride-inclusions";
import { getAuthUser } from "@/services/profiles";
import { organizerHasPayoutDetails } from "@/services/organizer-payout";
import { getMyRideBooking, getMyRideRequest, getRideMembers } from "@/services/ride-participation";
import { getRideMessages } from "@/services/ride-chat";
import { getRideById, getRideImages } from "@/services/rides";
import { capitalize } from "@/utils/capitalize";
import { formatRideDuration } from "@/utils/ride-duration";
import type { ItineraryDay } from "@/features/rides/schema";

type RideDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: RideDetailPageProps) {
  const { id } = await params;
  const ride = await getRideById(id);
  if (!ride) {
    return { title: "Ride Not Found" };
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

  const isOrganizedRide = ride.pricing_model === "organized";

  const [members, images, organizerReady] = await Promise.all([
    getRideMembers(id),
    getRideImages(id),
    isOrganizedRide && ride.organizer_id ? organizerHasPayoutDetails(ride.organizer_id) : false,
  ]);
  const isMember = user ? members.some((member) => member.user_id === user.id) : false;
  const chatMessages = isMember ? await getRideMessages(id) : [];
  const chatSenderProfiles = isMember
    ? Object.fromEntries(
        members
          .filter((member) => member.profile)
          .map((member) => [member.user_id, member.profile!]),
      )
    : {};
  const myRequest =
    user && !isOrganizedRide && !isOrganizer && !isMember
      ? await getMyRideRequest(id, user.id)
      : null;
  const myBooking =
    user && isOrganizedRide && !isOrganizer && !isMember
      ? await getMyRideBooking(id, user.id)
      : null;
  const isRideFull = ride.seats_available !== null && ride.seats_available <= 0;
  const lowSeats =
    !isRideFull &&
    ride.seats_available !== null &&
    ride.seats_available > 0 &&
    ride.seats_available <= 2;
  // Gated on departure time, not just the date, so attendance can be marked
  // as soon as the ride actually starts rather than waiting for midnight.
  const rideStarted =
    ride.ride_date !== null && ride.departure_time !== null
      ? new Date(`${ride.ride_date}T${ride.departure_time}`) < new Date()
      : false;

  const meeting =
    ride.meeting_lat !== null && ride.meeting_lng !== null
      ? { lat: ride.meeting_lat, lng: ride.meeting_lng }
      : null;
  const directionsUrl = meeting
    ? `https://www.google.com/maps/dir/?api=1&destination=${meeting.lat},${meeting.lng}`
    : null;
  // Organizers know the meeting point they set (they aren't in ride_members),
  // so this can't just be `isMember` — otherwise the organizer would lose
  // visibility into their own ride's meeting point.
  const canSeeMeetingPoint = isOrganizer || isMember;
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
    ride.breakfast_stop && "Breakfast Stop",
    ride.fuel_stop && "Fuel Stop",
    ride.helmet_required && "Helmet Required",
    ride.pillion_allowed && "Pillion Allowed",
  ].filter(Boolean) as string[];

  const CoverIcon = (ride.ride_type && RIDE_TYPE_ICONS[ride.ride_type]) || DEFAULT_RIDE_TYPE_ICON;

  // "Not included" is every catalog option the organizer didn't check off as
  // included — derived from the same list, rather than a separately
  // hand-typed exclusions field that can drift out of sync with it.
  const notIncluded = RIDE_INCLUSIONS.filter(
    (item) => !(ride.ride_inclusions ?? []).includes(item.value),
  );

  const timelineItems: TimelineItemData[] = [
    {
      icon: MapPin,
      title: canSeeMeetingPoint ? (ride.meeting_point ?? "Meeting Point") : "Meeting Point",
      time: ride.departure_time?.slice(0, 5),
      description: canSeeMeetingPoint ? undefined : "Shared once your join request is accepted",
      active: true,
    },
    ...(ride.breakfast_stop
      ? [{ icon: Coffee, title: "Breakfast Stop", description: "Along the route" }]
      : []),
    ...(ride.fuel_stop ? [{ icon: Fuel, title: "Fuel Stop", description: "Along the route" }] : []),
    {
      icon: Flag,
      title: ride.destination ?? "Destination",
      description: "Ride ends here",
    },
  ];

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12">
        <div className="from-secondary via-secondary/70 to-primary/30 relative aspect-video w-full overflow-hidden rounded-3xl bg-linear-to-br">
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
              {ride.seats_available !== null && (
                <StatusChip
                  status={isRideFull ? "full" : lowSeats ? "filling" : "open"}
                  className="border-transparent bg-white/15 text-white backdrop-blur-sm"
                >
                  {isRideFull ? "Full" : `${ride.seats_available} seats left`}
                </StatusChip>
              )}
            </div>
            <h1 className="font-heading text-2xl font-bold text-balance text-white sm:text-3xl">
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

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {isOrganizer && (
              <Button
                nativeButton={false}
                render={<Link href={`/rides/${id}/edit`}>Edit Ride</Link>}
                variant="outline"
                size="sm"
              />
            )}
            <ShareRideButton
              title={ride.title ?? "Ride"}
              text={
                ride.destination
                  ? `Join me on this ride to ${ride.destination}!`
                  : `Join me on this ride!`
              }
            />
          </div>
          {isOrganizer && (
            <Link href="/profile" className="text-muted-foreground text-xs hover:underline">
              Manage join requests from your dashboard →
            </Link>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
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
          <Stat
            icon={Hourglass}
            label="Duration"
            value={formatRideDuration(ride.estimated_duration_minutes)}
          />
          {isOrganizedRide && (
            <Stat
              icon={IndianRupee}
              label="Ride Fee"
              value={ride.ride_fee ? `₹${ride.ride_fee}` : undefined}
            />
          )}
          {isOrganizedRide && ride.booking_deadline && (
            <Stat
              icon={Clock}
              label="Book By"
              value={format(new Date(ride.booking_deadline), "MMM d, h:mm a")}
            />
          )}
        </div>

        {ride.description && (
          <Card>
            <CardContent>
              <p className="text-muted-foreground">{ride.description}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="flex flex-col gap-6">
            <Timeline items={timelineItems} />
            {directionsUrl && canSeeMeetingPoint && (
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary -mt-4 ml-13 flex items-center gap-1.5 text-xs hover:underline"
              >
                <ExternalLink className="size-3.5" />
                Get Directions To Meeting Point
              </a>
            )}
            {ride.destination_map_url && (
              <a
                href={ride.destination_map_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary -mt-4 ml-13 flex items-center gap-1.5 text-xs hover:underline"
              >
                <ExternalLink className="size-3.5" />
                View Destination On Google Maps
              </a>
            )}
            <MapContainer>
              <RideMap
                meeting={canSeeMeetingPoint ? meeting : null}
                destination={destination}
                interactive={false}
              />
            </MapContainer>
          </CardContent>
        </Card>

        {rules.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {rules.map((rule) => (
              <Badge key={rule} variant="outline" className="text-muted-foreground">
                {rule === "Fuel Stop" ? (
                  <Fuel className="size-3.5" />
                ) : (
                  <ShieldCheck className="size-3.5" />
                )}
                {rule}
              </Badge>
            ))}
          </div>
        )}

        {isOrganizedRide && (ride.ride_inclusions?.length ?? 0) > 0 && (
          <Card>
            <CardContent className="flex flex-col gap-3">
              <h2 className="font-heading text-lg font-semibold">What&apos;s Included</h2>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {ride.ride_inclusions?.map((value) => (
                  <span key={value} className="flex items-center gap-2 text-sm">
                    <Check className="text-primary size-3.5" />
                    {RIDE_INCLUSIONS.find((item) => item.value === value)?.label ?? value}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {isOrganizedRide && notIncluded.length > 0 && (
          <Card>
            <CardContent className="flex flex-col gap-3">
              <h2 className="font-heading text-lg font-semibold">What&apos;s Not Included</h2>
              <div className="flex flex-wrap gap-2">
                {notIncluded.map((item) => (
                  <Badge key={item.value} variant="outline" className="text-muted-foreground">
                    <X className="size-3.5" />
                    {item.label}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {isOrganizedRide && (ride.ride_itinerary as unknown as ItineraryDay[] | null)?.length ? (
          <Card>
            <CardContent className="flex flex-col gap-4">
              <h2 className="font-heading text-lg font-semibold">Trip Itinerary</h2>
              {(ride.ride_itinerary as unknown as ItineraryDay[]).map((day) => (
                <div key={day.day} className="flex flex-col gap-2">
                  <p className="text-sm font-medium">Day {day.day}</p>
                  <ul className="text-muted-foreground flex flex-col gap-1 text-sm">
                    {day.items.map((item, index) => (
                      <li key={index} className="flex gap-2">
                        {item.time && <span className="font-medium">{item.time}</span>}
                        <span>{item.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}

        {isOrganizedRide && ride.cancellation_policy && (
          <Card>
            <CardContent>
              <h2 className="font-heading mb-2 text-lg font-semibold">Cancellation Policy</h2>
              <p className="text-muted-foreground text-sm">{ride.cancellation_policy}</p>
            </CardContent>
          </Card>
        )}

        {images.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="font-heading text-lg font-semibold">Ride Gallery</h2>
            <ImageGallery images={images.map((image) => ({ url: image.image_url }))} />
          </div>
        )}

        <ParticipantsList
          members={members}
          currentUserId={user?.id ?? null}
          isOrganizer={isOrganizer}
          rideStarted={rideStarted}
          isOrganizedRide={isOrganizedRide}
        />

        <div id="join" className="scroll-mt-20">
          {!isOrganizer && !isMember && user && isOrganizedRide && (
            <BookRideCard
              rideId={id}
              myBooking={myBooking}
              isRideFull={isRideFull}
              rideFee={Number(ride.ride_fee ?? 0)}
              currency={ride.currency ?? "INR"}
              bookingClosed={
                ride.booking_deadline ? new Date(ride.booking_deadline) < new Date() : false
              }
              organizerReady={organizerReady}
            />
          )}

          {!isOrganizer && !isMember && user && !isOrganizedRide && (
            <JoinRequestCard rideId={id} myRequest={myRequest} isRideFull={isRideFull} />
          )}

          {!isOrganizer && !isMember && !user && (
            <Card>
              <CardContent className="flex items-center justify-between gap-3">
                <p className="text-muted-foreground text-sm">
                  Sign in to request to join this ride.
                </p>
                <Button
                  nativeButton={false}
                  size="sm"
                  render={<Link href="/login">Sign In</Link>}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <SiteFooter />

      {isMember && user && (
        <RideChatWidget
          rideId={id}
          currentUserId={user.id}
          initialMessages={chatMessages}
          senderProfiles={chatSenderProfiles}
          ride={{
            title: ride.title,
            destination: ride.destination,
            coverImageUrl: ride.cover_image_url,
            meetingPoint: ride.meeting_point,
          }}
          participants={members.filter((member) => member.profile).map((member) => member.profile!)}
        />
      )}
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
