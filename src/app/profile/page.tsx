import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AtSign, Bike, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";
import { signOut } from "@/features/auth/actions/auth-actions";
import { getAuthUser, getProfileByUserId } from "@/services/profiles";
import { capitalize } from "@/utils/capitalize";

export default async function ProfilePage() {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }

  const profile = await getProfileByUserId(user.id);
  if (!profile) {
    redirect("/profile/setup");
  }

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
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-12">
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
            <div className="flex flex-col gap-3">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">{profile.name}</h1>
                <p className="text-muted-foreground">@{profile.username}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  nativeButton={false}
                  render={<Link href="/profile/edit">Edit profile</Link>}
                  variant="outline"
                  size="sm"
                />
                <form action={signOut}>
                  <Button type="submit" variant="ghost" size="sm">
                    Sign out
                  </Button>
                </form>
              </div>
            </div>
          </CardContent>
        </Card>

        {stats.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
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
        )}

        {profile.bio && (
          <Card>
            <CardContent>
              <p className="text-muted-foreground">{profile.bio}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
