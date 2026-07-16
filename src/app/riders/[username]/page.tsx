import Image from "next/image";
import { notFound } from "next/navigation";
import { AtSign, Award, Bike, Check, Flame, MapPin, Medal, Sparkles, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/design-system/state-panel";
import { ImageGallery } from "@/components/design-system/image-gallery";
import { Timeline } from "@/components/design-system/timeline";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { rideToTimelineItem } from "@/features/rides/ride-timeline-item";
import { cn } from "@/lib/utils";
import { getAttendanceStats } from "@/services/ride-participation";
import { getProfileByUsername } from "@/services/profiles";
import { getMyRides, getRiderGalleryImages } from "@/services/rides";
import { capitalize } from "@/utils/capitalize";

type RiderProfilePageProps = {
  params: Promise<{ username: string }>;
};

function hashSeed(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

// No per-rider photo — a hero-style gradient in the app's own brand colors,
// varied by position so profiles don't all look identical.
const COVER_GRADIENTS = [
  { radialPosition: "20% 20%", blobClassName: "-top-12 -right-12" },
  { radialPosition: "80% 20%", blobClassName: "-top-12 -left-12" },
  { radialPosition: "20% 80%", blobClassName: "-bottom-12 -right-12" },
  { radialPosition: "80% 80%", blobClassName: "-bottom-12 -left-12" },
  { radialPosition: "50% 50%", blobClassName: "-top-12 -right-12" },
] as const;

function coverGradient(username: string) {
  return COVER_GRADIENTS[hashSeed(username) % COVER_GRADIENTS.length];
}

export async function generateMetadata({ params }: RiderProfilePageProps) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) {
    return { title: "Rider not found" };
  }

  return {
    title: profile.name,
    description: profile.bio?.slice(0, 160) || `${profile.name}'s rider profile on RevLoop`,
  };
}

export default async function RiderProfilePage({ params }: RiderProfilePageProps) {
  const { username } = await params;

  const profile = await getProfileByUsername(username);
  if (!profile) {
    notFound();
  }

  const [attendance, gallery, myRides] = await Promise.all([
    getAttendanceStats(profile.id),
    getRiderGalleryImages(profile.id, 12),
    getMyRides(profile.id),
  ]);

  const stats = [
    {
      icon: MapPin,
      label: "Based in",
      value: [profile.city, profile.country].filter(Boolean).join(", "),
    },
    {
      icon: Bike,
      label: "Rides a",
      value: [profile.bike_brand, profile.bike_model].filter(Boolean).join(" "),
    },
    {
      icon: Sparkles,
      label: "Experience",
      value: profile.experience_level
        ? `${capitalize(profile.experience_level)} · ${profile.years_riding ?? 0} yrs`
        : undefined,
    },
    {
      icon: AtSign,
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
      <div className="bg-secondary relative h-56 w-full overflow-hidden sm:h-72">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at ${coverGradient(profile.username).radialPosition}, oklch(0.705 0.191 41.6 / 30%), transparent 55%)`,
          }}
        />
        <div
          aria-hidden
          className={cn(
            "bg-primary/25 pointer-events-none absolute h-64 w-64 rounded-full blur-3xl",
            coverGradient(profile.username).blobClassName,
          )}
        />
        <div
          aria-hidden
          className="bg-road-dashes text-primary/40 absolute top-0 right-0 left-0 h-1"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 pb-12">
        <div className="-mt-16 flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="bg-secondary ring-background z-50 h-32 w-32 shrink-0 overflow-hidden rounded-full ring-4">
            {profile.profile_image_url ? (
              <Image
                src={profile.profile_image_url}
                alt={profile.name}
                width={128}
                height={128}
                unoptimized
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          <div className="pb-1">
            <h1 className="font-heading text-2xl font-bold tracking-tight">{profile.name}</h1>
            <p className="text-muted-foreground">@{profile.username}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card size="sm">
            <CardContent className="flex flex-col gap-1.5">
              <Check className="text-primary size-4" />
              <p className="text-muted-foreground text-xs">Rides completed</p>
              <p className="text-sm font-medium">{attendance.attended}</p>
            </CardContent>
          </Card>
          <Card size="sm">
            <CardContent className="flex flex-col gap-1.5">
              <X className="text-primary size-4" />
              <p className="text-muted-foreground text-xs">No-shows</p>
              <p className="text-sm font-medium">{attendance.noShow}</p>
            </CardContent>
          </Card>
          {stats.map((stat) => (
            <Card key={stat.label} size="sm">
              <CardContent className="flex flex-col gap-1.5">
                <stat.icon className="text-primary size-4" />
                <p className="text-muted-foreground text-xs">{stat.label}</p>
                <p className="text-sm font-medium">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {profile.bio && (
          <Card>
            <CardContent>
              <p className="text-muted-foreground">{profile.bio}</p>
            </CardContent>
          </Card>
        )}

        <section className="flex flex-col gap-3">
          <h2 className="font-heading text-lg font-bold tracking-tight">Badges</h2>
          <div className="flex flex-wrap gap-3">
            {badges.map((badge) => (
              <div
                key={badge.label}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-2xl px-5 py-4 text-center ring-1",
                  badge.earned
                    ? "bg-primary-soft ring-primary/20 text-primary-soft-foreground"
                    : "bg-muted ring-border text-muted-foreground opacity-50",
                )}
              >
                <badge.icon className="size-6" />
                <p className="text-xs font-medium">{badge.label}</p>
              </div>
            ))}
          </div>
        </section>

        {myRides.completed.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="font-heading text-lg font-bold tracking-tight">Ride history</h2>
            <Timeline
              items={myRides.completed
                .slice(0, 8)
                .map((ride) => rideToTimelineItem(ride, false, "completed"))}
            />
          </section>
        )}

        <section className="flex flex-col gap-3">
          <h2 className="font-heading text-lg font-bold tracking-tight">Ride gallery</h2>
          {gallery.length > 0 ? (
            <ImageGallery images={gallery.map((image) => ({ url: image.image_url }))} />
          ) : (
            <EmptyState
              title="No photos yet"
              description="Ride photos posted to shared rides will show up here."
            />
          )}
        </section>

        <p className="text-muted-foreground text-xs">
          Attendance is marked by ride organizers after each ride.
        </p>
      </div>
      <SiteFooter />
    </div>
  );
}
