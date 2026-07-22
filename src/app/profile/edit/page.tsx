import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { updateProfile } from "@/features/profile/actions/profile-actions";
import { ProfileForm } from "@/features/profile/components/profile-form";
import { getAuthUser, getProfileByUserId } from "@/services/profiles";

export const metadata = {
  title: "Edit Profile",
};

export default async function EditProfilePage() {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }

  const profile = await getProfileByUserId(user.id);
  if (!profile) {
    redirect("/profile/setup");
  }

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-12">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-2xl font-bold tracking-tight">Edit Profile</h1>
          <p className="text-muted-foreground">Keep your rider details up to date.</p>
        </div>
        <ProfileForm
          mode="edit"
          action={updateProfile}
          initialAvatarUrl={profile.profile_image_url}
          initialValues={{
            name: profile.name,
            username: profile.username,
            city: profile.city ?? "",
            country: profile.country ?? "",
            bikeBrand: profile.bike_brand ?? "",
            bikeModel: profile.bike_model ?? "",
            experienceLevel: profile.experience_level ?? "",
            yearsRiding: profile.years_riding ?? 0,
            bio: profile.bio ?? "",
            instagramHandle: profile.instagram_handle ?? "",
          }}
        />
      </div>
    </div>
  );
}
