import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { createProfile } from "@/features/profile/actions/profile-actions";
import { ProfileForm } from "@/features/profile/components/profile-form";
import { getAuthUser, getProfileByUserId } from "@/services/profiles";

export default async function ProfileSetupPage() {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }

  const profile = await getProfileByUserId(user.id);
  if (profile) {
    redirect("/profile");
  }

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Complete your profile</h1>
          <p className="text-muted-foreground">
            Tell other riders who you are before you create or join a ride.
          </p>
        </div>
        <ProfileForm
          mode="create"
          action={createProfile}
          initialValues={{
            name:
              typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "",
            username: "",
            city: "",
            country: "",
            bikeBrand: "",
            bikeModel: "",
            experienceLevel: "",
            yearsRiding: 0,
            bio: "",
            instagramHandle: "",
          }}
        />
      </div>
    </div>
  );
}
