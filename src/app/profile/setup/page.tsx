import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { createProfile } from "@/features/profile/actions/profile-actions";
import { ProfileForm } from "@/features/profile/components/profile-form";
import { getAuthUser, getProfileByUserId } from "@/services/profiles";
import { getOAuthAvatarUrl } from "@/utils/oauth-metadata";

export const metadata = {
  title: "Set up your profile",
};

const STEPS = ["Basics", "Riding details", "Location", "About you"];

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
      <section className="bg-secondary text-secondary-foreground relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,oklch(0.705_0.191_41.6/30%),transparent_55%)]"
        />
        <div
          aria-hidden
          className="bg-primary/20 pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full blur-3xl"
        />
        <div
          aria-hidden
          className="bg-road-dashes text-primary/50 absolute top-0 right-0 left-0 h-1"
        />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-14 sm:py-16">
          <div className="flex items-center justify-between">
            <Logo className="text-white" />
            <ThemeToggle className="text-white" />
          </div>

          <h1 className="font-display mt-2 text-4xl text-white uppercase sm:text-5xl">
            Welcome to the crew
          </h1>
          <p className="max-w-md text-white/70">
            Tell other riders who you are before you create or join a ride. It only takes a couple
            of minutes.
          </p>
          <ol className="flex flex-wrap gap-2 pt-1">
            {STEPS.map((step, index) => (
              <li
                key={step}
                className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80"
              >
                <span className="text-primary font-bold">{index + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-10">
        <ProfileForm
          mode="create"
          action={createProfile}
          initialAvatarUrl={getOAuthAvatarUrl(user.user_metadata)}
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
