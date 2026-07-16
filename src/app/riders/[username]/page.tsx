import Image from "next/image";
import { notFound } from "next/navigation";
import { AtSign, Bike, Check, MapPin, Sparkles, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getAttendanceStats } from "@/services/ride-participation";
import { getProfileByUsername } from "@/services/profiles";
import { capitalize } from "@/utils/capitalize";

type RiderProfilePageProps = {
  params: Promise<{ username: string }>;
};

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

  const attendance = await getAttendanceStats(profile.id);

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

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12">
        <Card>
          <CardContent className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="bg-secondary ring-primary/10 h-24 w-24 shrink-0 overflow-hidden rounded-full ring-4">
              {profile.profile_image_url ? (
                <Image
                  src={profile.profile_image_url}
                  alt={profile.name}
                  width={96}
                  height={96}
                  unoptimized
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{profile.name}</h1>
              <p className="text-muted-foreground">@{profile.username}</p>
            </div>
          </CardContent>
        </Card>

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

        <p className="text-muted-foreground text-xs">
          Attendance is marked by ride organizers after each ride.
        </p>
      </div>
      <SiteFooter />
    </div>
  );
}
