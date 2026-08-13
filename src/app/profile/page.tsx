import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { RiderHomeView } from "@/features/profile/components/rider-home-view";
import { OrganizerHomeView } from "@/features/organizer/components/organizer-home-view";
import { getAuthUser, getProfileByUserId } from "@/services/profiles";
import { getMyRole } from "@/services/roles";

export async function generateMetadata() {
  const role = await getMyRole();
  return { title: role === "organizer" ? "Organizer Home" : "Rider Home" };
}

export default async function ProfilePage() {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }

  const role = await getMyRole();
  if (role === "admin") {
    redirect("/admin/settlements");
  }

  const profile = await getProfileByUserId(user.id);
  if (!profile) {
    redirect("/profile/setup");
  }

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-6 py-10">
        {role === "organizer" ? (
          <OrganizerHomeView profile={profile} />
        ) : (
          <RiderHomeView profile={profile} />
        )}
      </div>
    </div>
  );
}
