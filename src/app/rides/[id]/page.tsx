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
import { cn } from "@/lib/utils";
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

  const joinSlot = (
    <div id="join" className="scroll-mt-24">
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
          <CardContent className="flex flex-col gap-3">
            <p className="text-muted-foreground text-sm">Sign in to claim your seat.</p>
            <Button nativeButton={false} render={<Link href="/login">Sign In</Link>} />
          </CardContent>
        </Card>
      )}

      {isMember && (
        <Card className="border-success/30 bg-success/5">
          <CardContent className="flex items-center gap-2.5">
            <Check className="text-success size-4 shrink-0" />
            <p className="text-sm font-medium">You&apos;re in — see you on the road.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />

      {/* Full-bleed cover — the trip's postcard. */}
      <section className="bg-secondary relative h-[42vh] min-h-85 w-full overflow-hidden sm:h-[54vh]">
        {ride.cover_image_url ? (
          <Image
            src={ride.cover_image_url}
            alt={ride.title ?? "Ride cover"}
            fill
            priority
            unoptimized
            className="object-cover"
          />
        ) : (
          <div className="from-secondary via-secondary/70 to-secondary/30 absolute inset-0 bg-linear-to-br">
            <CoverIcon className="text-secondary-foreground/15 absolute -right-8 -bottom-8 size-64" />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-black/10" />
        <div
          aria-hidden
          className="bg-road-dashes absolute inset-x-0 bottom-0 h-px text-white/25"
        />

        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 pb-8 sm:pb-10">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="secondary"
                className={cn(
                  "border-0 text-white",
                  isOrganizedRide ? "bg-primary" : "bg-ride-community",
                )}
              >
                {isOrganizedRide ? "Organized Ride" : "Community Ride"}
              </Badge>
              {badges.map((badge) => (
                <Badge key={badge} variant="secondary" className="bg-white/15 text-white backdrop-blur-sm">
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
            <h1 className="font-display max-w-4xl text-4xl text-balance text-white uppercase sm:text-6xl">
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
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    isOrganizedRide ? "bg-primary" : "bg-ride-community",
                  )}
                />
                {isOrganizedRide ? "Captained by" : "Led by"} {ride.organizer.name}
              </div>
            )}
          </div>
        </div>
      </section>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-6 py-10 lg:flex-row lg:items-start lg:gap-12">
        {/* The journey — main column */}
        <div className="flex min-w-0 flex-1 flex-col gap-10">
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
                Manage join requests from your Rider Home →
              </Link>
            )}
          </div>

          {ride.description && (
            <p className="text-muted-foreground text-lg leading-relaxed text-pretty">
              {ride.description}
            </p>
          )}

          <section className="flex flex-col gap-4">
            <p className="text-telemetry text-primary text-[11px]">The Route</p>
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
          </section>

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
                <h2 className="font-heading text-lg font-bold">What&apos;s Included</h2>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {ride.ride_inclusions?.map((value) => (
                    <span key={value} className="flex items-center gap-2 text-sm">
                      <Check className="text-success size-3.5" />
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
                <h2 className="font-heading text-lg font-bold">What&apos;s Not Included</h2>
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
            <section className="flex flex-col gap-4">
              <p className="text-telemetry text-primary text-[11px]">The Itinerary</p>
              <Card>
                <CardContent className="flex flex-col gap-5">
                  {(ride.ride_itinerary as unknown as ItineraryDay[]).map((day) => (
                    <div key={day.day} className="flex flex-col gap-2">
                      <p className="font-heading text-sm font-bold">Day {day.day}</p>
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
            </section>
          ) : null}

          {isOrganizedRide && ride.cancellation_policy && (
            <Card>
              <CardContent>
                <h2 className="font-heading mb-2 text-lg font-bold">Cancellation Policy</h2>
                <p className="text-muted-foreground text-sm">{ride.cancellation_policy}</p>
              </CardContent>
            </Card>
          )}

          {images.length > 0 && (
            <section className="flex flex-col gap-4">
              <p className="text-telemetry text-primary text-[11px]">Ride Gallery</p>
              <ImageGallery images={images.map((image) => ({ url: image.image_url }))} />
            </section>
          )}

          <section className="flex flex-col gap-4">
            <p className="text-telemetry text-primary text-[11px]">Your Road Family Here</p>
            <ParticipantsList
              members={members}
              currentUserId={user?.id ?? null}
              isOrganizer={isOrganizer}
              rideStarted={rideStarted}
              isOrganizedRide={isOrganizedRide}
            />
          </section>

          {/* CTA repeats inline on mobile, where the sidebar has stacked below the fold. */}
          <div className="lg:hidden">{joinSlot}</div>
        </div>

        {/* Trip dossier — sticky sidebar */}
        <aside className="flex w-full flex-col gap-5 lg:sticky lg:top-24 lg:w-80 lg:shrink-0">
          <Card>
            <CardContent className="flex flex-col gap-4">
              <p className="text-telemetry text-muted-foreground text-[10px]">Trip Details</p>
              <div className="flex flex-col gap-3">
                <TripRow
                  icon={Calendar}
                  label="Date"
                  value={ride.ride_date && format(new Date(ride.ride_date), "EEE, MMM d, yyyy")}
                />
                <TripRow icon={Clock} label="Departs" value={ride.departure_time?.slice(0, 5)} />
                <TripRow
                  icon={Users}
                  label="Seats"
                  value={
                    ride.seats_available !== null && ride.max_riders !== null
                      ? `${ride.seats_available} of ${ride.max_riders} left`
                      : undefined
                  }
                />
                <TripRow
                  icon={Bike}
                  label="Distance"
                  value={ride.estimated_distance_km ? `${ride.estimated_distance_km} km` : undefined}
                />
                <TripRow
                  icon={Hourglass}
                  label="Duration"
                  value={formatRideDuration(ride.estimated_duration_minutes)}
                />
                {isOrganizedRide && (
                  <TripRow
                    icon={IndianRupee}
                    label="Ride Fee"
                    value={ride.ride_fee ? `₹${ride.ride_fee}` : undefined}
                  />
                )}
                {isOrganizedRide && ride.booking_deadline && (
                  <TripRow
                    icon={Clock}
                    label="Book By"
                    value={format(new Date(ride.booking_deadline), "MMM d, h:mm a")}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          <div className="hidden lg:block">{joinSlot}</div>
        </aside>
      </main>

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

function TripRow({
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
    <div className="border-border/60 flex items-center justify-between gap-3 border-t pt-3 first:border-t-0 first:pt-0">
      <span className="text-muted-foreground flex items-center gap-2 text-sm">
        <Icon className="size-3.5 shrink-0" />
        {label}
      </span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
