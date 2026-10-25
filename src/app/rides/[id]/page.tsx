import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import {
  AtSign,
  Building2,
  Check,
  Coffee,
  ExternalLink,
  Flag,
  Fuel,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Milestone } from "@/components/design-system/milestone";
import { ImageGallery } from "@/components/design-system/image-gallery";
import { MapContainer } from "@/components/design-system/map-container";
import { Timeline, type TimelineItemData } from "@/components/design-system/timeline";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { BookRideCard } from "@/features/rides/components/book-ride-card";
import { JoinRequestCard } from "@/features/rides/components/join-request-card";
import { ParticipantsList } from "@/features/rides/components/participants-list";
import { RideChatWidget } from "@/features/rides/components/ride-chat-widget";
import { LazyRideMap } from "@/features/rides/components/lazy-ride-map";
import { ShareRideButton } from "@/features/rides/components/share-ride-button";
import { DEFAULT_RIDE_TYPE_ICON, RIDE_TYPE_ICONS, RIDE_TYPES } from "@/constants/ride-type";
import { SPEED_LEVELS } from "@/constants/speed-level";
import { RIDE_INCLUSIONS } from "@/constants/ride-inclusions";
import { cn } from "@/lib/utils";
import { getAuthUser } from "@/services/profiles";
import { organizerHasPayoutDetails } from "@/services/organizer-payout";
import { getMyRole } from "@/services/roles";
import { getOrganizerDetails } from "@/services/organizer-details";
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

  const [ride, user] = await Promise.all([getRideById(id), getAuthUser()]);
  if (!ride) {
    notFound();
  }

  const isOrganizer = user?.id === ride.organizer_id;

  const isOrganizedRide = ride.pricing_model === "organized";

  const [viewerRole, members, images, organizerReady, organizerDetails] = await Promise.all([
    user ? getMyRole() : "user",
    getRideMembers(id),
    getRideImages(id),
    isOrganizedRide && ride.organizer_id ? organizerHasPayoutDetails(ride.organizer_id) : false,
    isOrganizedRide && ride.organizer_id ? getOrganizerDetails(ride.organizer_id) : null,
  ]);
  const isOrganizerViewer = viewerRole === "organizer";
  const isMember = user ? members.some((member) => member.user_id === user.id) : false;
  // Each of these only depends on membership, so they go out together.
  const [chatMessages, myRequest, myBooking] = await Promise.all([
    isMember ? getRideMessages(id) : [],
    user && !isOrganizedRide && !isOrganizer && !isMember ? getMyRideRequest(id, user.id) : null,
    user && isOrganizedRide && !isOrganizer && !isMember ? getMyRideBooking(id, user.id) : null,
  ]);
  const chatSenderProfiles = isMember
    ? Object.fromEntries(
        members
          .filter((member) => member.profile)
          .map((member) => [member.user_id, member.profile!]),
      )
    : {};
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

  const specs: { label: string; value: string; tone?: "low" | "full" }[] = [
    ride.ride_date && { label: "Date", value: format(new Date(ride.ride_date), "EEE d MMM yyyy") },
    ride.departure_time && { label: "Departs", value: ride.departure_time.slice(0, 5) },
    ride.estimated_distance_km && {
      label: "Distance",
      value: `${ride.estimated_distance_km.toLocaleString("en-IN")} km`,
    },
    formatRideDuration(ride.estimated_duration_minutes) && {
      label: "Duration",
      value: formatRideDuration(ride.estimated_duration_minutes)!,
    },
    ride.seats_available !== null &&
      ride.max_riders !== null && {
        label: "Seats",
        value: isRideFull ? `Full, ${ride.max_riders} riders` : `${ride.seats_available} of ${ride.max_riders} left`,
        tone: isRideFull ? ("full" as const) : lowSeats ? ("low" as const) : undefined,
      },
    isOrganizedRide &&
      ride.ride_fee && { label: "Ride fee", value: `₹${Number(ride.ride_fee).toLocaleString("en-IN")}` },
    isOrganizedRide &&
      ride.booking_deadline && {
        label: "Book by",
        value: format(new Date(ride.booking_deadline), "d MMM, h:mm a"),
      },
  ].filter((spec): spec is { label: string; value: string; tone?: "low" | "full" } => Boolean(spec));

  const joinSlot = (
    <div id="join" className="scroll-mt-24">
      {!isOrganizer && !isMember && user && isOrganizerViewer && (
        <Card>
          <CardContent className="flex flex-col gap-1">
            <p className="text-sm font-medium">Organizer accounts can&apos;t join rides.</p>
            <p className="text-muted-foreground text-sm">
              Host your own from your{" "}
              <Link href="/profile" className="text-primary-ink underline">
                organizer home
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      )}

      {!isOrganizer && !isMember && user && !isOrganizerViewer && isOrganizedRide && (
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

      {!isOrganizer && !isMember && user && !isOrganizerViewer && !isOrganizedRide && (
        <JoinRequestCard rideId={id} myRequest={myRequest} isRideFull={isRideFull} />
      )}

      {!isOrganizer && !isMember && !user && (
        <Card>
          <CardContent className="flex flex-col gap-3">
            <p className="text-muted-foreground text-sm">Sign in to claim your seat.</p>
            <Button nativeButton={false} render={<Link href="/login">Sign in</Link>} />
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

      {/* Full-bleed cover — the trip's postcard, with its milestone on the roadside. */}
      <section className="bg-secondary relative h-[52svh] min-h-96 w-full overflow-hidden sm:h-[62svh]">
        {ride.cover_image_url ? (
          <Image
            src={ride.cover_image_url}
            alt={ride.title ?? "Ride cover"}
            fill
            preload
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <CoverIcon
            className="text-secondary-foreground/10 absolute -right-8 -bottom-8 size-72"
            aria-hidden
          />
        )}
        {/* Neutral scrim so the white title holds on any photo. */}
        <div aria-hidden className="absolute inset-0 bg-linear-to-t from-black/85 via-black/35 to-black/0" /> {/* taste-skill-ignore */}
        {ride.destination && (
          <Milestone
            place={ride.destination}
            km={ride.estimated_distance_km}
            size="md"
            className="absolute top-4 right-4 max-w-[45%] md:hidden"
          />
        )}

        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto flex w-full max-w-[90rem] items-end justify-between gap-6 px-4 pb-8 sm:px-8 sm:pb-12">
            <div className="flex min-w-0 flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "inline-flex h-7 items-center rounded-sm px-2.5 text-[13px] font-bold",
                    isOrganizedRide ? "bg-primary text-primary-foreground" : "bg-white text-[#111]",
                  )}
                >
                  {isOrganizedRide ? "Organized tour" : "Community ride"}
                </span>
                {badges.map((badge) => (
                  <span
                    key={badge}
                    className="inline-flex h-7 items-center rounded-sm bg-black/55 px-2.5 text-[13px] font-semibold text-white"
                  >
                    {badge}
                  </span>
                ))}
              </div>
              <h1 className="font-display max-w-5xl text-[clamp(48px,7vw,112px)] text-balance text-white">
                {ride.title}
              </h1>
              {ride.organizer && (
                <div className="flex items-center gap-2.5 text-[15px] text-white/85">
                  <Avatar size="sm">
                    <AvatarImage
                      src={ride.organizer.profile_image_url ?? undefined}
                      alt={ride.organizer.name}
                    />
                    <AvatarFallback>
                      <UserRound className="size-3.5" />
                    </AvatarFallback>
                  </Avatar>
                  <span>
                    {isOrganizedRide ? "Captained by" : "Led by"}{" "}
                    <span className="font-bold text-white">{ride.organizer.name}</span>
                    {ride.city && <> · rolling out from {ride.city}</>}
                  </span>
                </div>
              )}
            </div>
            {ride.destination && (
              <Milestone
                place={ride.destination}
                km={ride.estimated_distance_km}
                size="lg"
                className="hidden max-w-[16rem] shrink-0 md:inline-flex"
              />
            )}
          </div>
        </div>
      </section>

      {/* The spec plate: every figure a rider checks before claiming a seat. */}
      <section aria-label="Trip details" className="bg-card">
        <dl className="mx-auto grid w-full max-w-[90rem] grid-cols-2 gap-x-6 gap-y-5 px-4 py-6 sm:grid-cols-3 sm:px-8 lg:flex lg:flex-wrap lg:justify-between lg:gap-x-10">
          {specs.map((spec) => (
            <div key={spec.label} className="flex flex-col gap-1">
              <dt className="text-muted-foreground text-sm font-medium">{spec.label}</dt>
              <dd
                className={cn(
                  "text-xl font-bold tabular-nums sm:text-2xl",
                  spec.tone === "low" && "text-primary-ink",
                  spec.tone === "full" && "text-muted-foreground",
                )}
              >
                {spec.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <main className="mx-auto flex w-full max-w-[90rem] flex-1 flex-col gap-12 px-4 py-12 sm:px-8 lg:flex-row lg:items-start lg:gap-16">
        {/* The journey — main column */}
        <div className="flex min-w-0 flex-1 flex-col gap-10">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap gap-2">
              {isOrganizer && (
                <Button
                  nativeButton={false}
                  render={<Link href={`/rides/${id}/edit`}>Edit ride</Link>}
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
              <Link href="/profile" className="text-muted-foreground text-sm hover:underline">
                Manage join requests from your {isOrganizerViewer ? "Organizer home" : "Ride home"}{" "}
                →
              </Link>
            )}
          </div>

          {ride.description && (
            <p className="max-w-[65ch] text-lg leading-relaxed text-pretty">
              {ride.description}
            </p>
          )}

          {isOrganizedRide && organizerDetails && (
            <Card>
              <CardContent className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Building2 className="text-muted-foreground size-4" />
                  <h2 className="font-heading text-lg font-bold">
                    {organizerDetails.business_name}
                  </h2>
                </div>
                <div className="text-muted-foreground flex flex-wrap gap-x-5 gap-y-2 text-sm">
                  <span>{organizerDetails.events_organised_count} events organised</span>
                  <span>Signature trip: {organizerDetails.primary_destination}</span>
                  {organizerDetails.instagram_handle && (
                    <span className="flex items-center gap-1">
                      <AtSign className="size-3.5" />
                      {organizerDetails.instagram_handle}
                    </span>
                  )}
                </div>
                {isMember ? (
                  <div className="flex flex-col gap-1.5 text-sm">
                    <span className="flex items-center gap-2">
                      <Mail className="text-muted-foreground size-3.5" />
                      {organizerDetails.business_email}
                    </span>
                    <span className="flex items-center gap-2">
                      <Phone className="text-muted-foreground size-3.5" />
                      {organizerDetails.business_phone}
                    </span>
                  </div>
                ) : (
                  <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
                    <Lock className="size-3.5" />
                    Contact details are shared once you&apos;ve joined this ride.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-bold">The route</h2>
            <Card>
              <CardContent className="flex flex-col gap-6">
                <Timeline items={timelineItems} />
                {directionsUrl && canSeeMeetingPoint && (
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-ink -mt-4 ml-13 flex items-center gap-1.5 text-sm font-semibold hover:underline"
                  >
                    <ExternalLink className="size-3.5" />
                    Directions to the meeting point
                  </a>
                )}
                {ride.destination_map_url && (
                  <a
                    href={ride.destination_map_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-ink -mt-4 ml-13 flex items-center gap-1.5 text-sm font-semibold hover:underline"
                  >
                    <ExternalLink className="size-3.5" />
                    Destination on Google Maps
                  </a>
                )}
                <MapContainer>
                  <LazyRideMap
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
                <h2 className="text-lg font-bold">What&apos;s included</h2>
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
                <h2 className="text-lg font-bold">Not included</h2>
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
              <h2 className="text-xl font-bold">The itinerary</h2>
              <Card>
                <CardContent className="flex flex-col gap-5">
                  {(ride.ride_itinerary as unknown as ItineraryDay[]).map((day) => (
                    <div key={day.day} className="flex flex-col gap-2">
                      <p className="text-[15px] font-bold">Day {day.day}</p>
                      <ul className="text-muted-foreground flex flex-col gap-1 text-sm">
                        {day.items.map((item, index) => (
                          <li key={index} className="flex gap-2">
                            {item.time && (
                              <span className="text-foreground font-semibold tabular-nums">
                                {item.time}
                              </span>
                            )}
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
                <h2 className="mb-2 text-lg font-bold">Cancellation policy</h2>
                <p className="text-muted-foreground text-sm">{ride.cancellation_policy}</p>
              </CardContent>
            </Card>
          )}

          {images.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className="text-xl font-bold">From the ride</h2>
              <ImageGallery images={images.map((image) => ({ url: image.image_url }))} />
            </section>
          )}

          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-bold">Who&apos;s riding</h2>
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
        <aside className="hidden w-full flex-col gap-5 lg:sticky lg:top-24 lg:flex lg:w-96 lg:shrink-0">
          {joinSlot}
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
