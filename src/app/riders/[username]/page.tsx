import Image from "next/image";
import { notFound } from "next/navigation";
import { Award, Flame, Medal } from "lucide-react";
import { EmptyState } from "@/components/design-system/state-panel";
import { ImageGallery } from "@/components/design-system/image-gallery";
import { Timeline } from "@/components/design-system/timeline";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { rideToTimelineItem } from "@/features/rides/ride-timeline-item";
import { cn } from "@/lib/utils";
import { getAttendanceStats } from "@/services/ride-participation";
import { getProfileByUsername } from "@/services/profiles";
import { getOrganizerDetails } from "@/services/organizer-details";
import { getUserRole } from "@/services/roles";
import { getMyRides, getOrganizedRidesCount, getRiderGalleryImages } from "@/services/rides";
import { capitalize } from "@/utils/capitalize";

type RiderProfilePageProps = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: RiderProfilePageProps) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) {
    return { title: "Rider Not Found" };
  }

  const role = await getUserRole(profile.id);
  if (role === "organizer") {
    const organizerDetails = await getOrganizerDetails(profile.id);
    const name = organizerDetails?.business_name ?? profile.name;
    return {
      title: name,
      description: profile.bio?.slice(0, 160) || `${name}'s organizer profile on RoadKin`,
    };
  }

  return {
    title: profile.name,
    description: profile.bio?.slice(0, 160) || `${profile.name}'s rider profile on RoadKin`,
  };
}

export default async function RiderProfilePage({ params }: RiderProfilePageProps) {
  const { username } = await params;

  const profile = await getProfileByUsername(username);
  if (!profile) {
    notFound();
  }

  const isOrganizer = (await getUserRole(profile.id)) === "organizer";

  const [attendance, organizedCount, gallery, myRides, organizerDetails] = await Promise.all([
    getAttendanceStats(profile.id),
    getOrganizedRidesCount(profile.id),
    getRiderGalleryImages(profile.id, 12),
    getMyRides(profile.id),
    isOrganizer ? getOrganizerDetails(profile.id) : null,
  ]);

  const displayName = organizerDetails?.business_name ?? profile.name;

  const stats = isOrganizer
    ? [
        {
          label: "Based in",
          value: [profile.city, profile.country].filter(Boolean).join(", "),
        },
        {
          label: "Events organised",
          value: organizerDetails ? String(organizerDetails.events_organised_count) : undefined,
        },
        {
          label: "Signature trip",
          value: organizerDetails?.primary_destination,
        },
        {
          label: "Instagram",
          value: organizerDetails?.instagram_handle
            ? `@${organizerDetails.instagram_handle}`
            : undefined,
        },
      ].filter((stat) => stat.value)
    : [
        {
          label: "Based in",
          value: [profile.city, profile.country].filter(Boolean).join(", "),
        },
        {
          label: "Bike",
          value: [profile.bike_brand, profile.bike_model].filter(Boolean).join(" "),
        },
        {
          label: "Experience",
          value: profile.experience_level
            ? `${capitalize(profile.experience_level)} · ${profile.years_riding ?? 0} yrs`
            : undefined,
        },
        {
          label: "Instagram",
          value: profile.instagram_handle ? `@${profile.instagram_handle}` : undefined,
        },
      ].filter((stat) => stat.value);

  const badges = [
    { icon: Flame, label: "First ride", earned: attendance.attended >= 1 },
    { icon: Medal, label: "Regular rider", earned: attendance.attended >= 5 },
    { icon: Award, label: "Road veteran", earned: attendance.attended >= 10 },
  ];

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <div className="bg-secondary h-36 w-full sm:h-48" />

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 pb-12">
        <div className="-mt-16 flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="bg-secondary ring-background z-50 h-32 w-32 shrink-0 overflow-hidden rounded-full ring-4">
            {profile.profile_image_url ? (
              <Image
                src={profile.profile_image_url}
                alt={profile.name}
                width={128}
                height={128}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          <div className="pb-1">
            <h1 className="font-display text-5xl text-balance">{displayName}</h1>
            <p className="text-muted-foreground">
              @{profile.username} · {isOrganizer ? "Organizer" : "Rider"}
            </p>
          </div>
        </div>

        <dl className="bg-card grid grid-cols-2 gap-x-6 gap-y-5 rounded-md p-5 sm:grid-cols-3">
          {!isOrganizer && (
            <>
              <div className="flex flex-col gap-1">
                <dt className="text-muted-foreground text-sm">Rides completed</dt>
                <dd className="text-2xl font-bold tabular-nums">{attendance.attended}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-muted-foreground text-sm">No-shows</dt>
                <dd className="text-2xl font-bold tabular-nums">{attendance.noShow}</dd>
              </div>
            </>
          )}
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground text-sm">Rides organized</dt>
            <dd className="text-2xl font-bold tabular-nums">{organizedCount}</dd>
          </div>
          {stats.map((stat) => (
            <div key={stat.label} className="flex min-w-0 flex-col gap-1">
              <dt className="text-muted-foreground text-sm">{stat.label}</dt>
              <dd className="text-base font-semibold break-words">{stat.value}</dd>
            </div>
          ))}
        </dl>

        {profile.bio && <p className="text-muted-foreground text-base">{profile.bio}</p>}

        {myRides.ongoing.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold">Ongoing</h2>
            <Timeline
              items={myRides.ongoing.map((ride) => rideToTimelineItem(ride, true, "live"))}
            />
          </section>
        )}

        {!isOrganizer && (
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold">Badges</h2>
            <div className="flex flex-wrap gap-3">
              {badges.map((badge) => (
                <div
                  key={badge.label}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-md px-5 py-4 text-center",
                    badge.earned
                      ? "bg-card text-foreground"
                      : "bg-muted text-muted-foreground opacity-60",
                  )}
                >
                  <badge.icon
                    className={cn(
                      "size-6",
                      badge.earned ? "text-primary-ink" : "text-muted-foreground",
                    )}
                  />
                  <p className="text-sm font-semibold">{badge.label}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {myRides.completed.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold">Ride history</h2>
            <Timeline
              items={myRides.completed
                .slice(0, 8)
                .map((ride) => rideToTimelineItem(ride, false, "completed"))}
            />
          </section>
        )}

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-bold">Ride gallery</h2>
          {gallery.length > 0 ? (
            <ImageGallery images={gallery.map((image) => ({ url: image.image_url }))} />
          ) : (
            <EmptyState
              title="No photos yet"
              description="Ride photos posted to shared rides will show up here."
            />
          )}
        </section>

        {!isOrganizer && (
          <p className="text-muted-foreground text-sm">
            Attendance is marked by ride organizers after each ride.
          </p>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
