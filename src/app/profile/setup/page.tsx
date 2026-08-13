import Image from "next/image";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { createProfile } from "@/features/profile/actions/profile-actions";
import { ProfileForm } from "@/features/profile/components/profile-form";
import { getAuthUser, getProfileByUserId } from "@/services/profiles";
import { toTitleCase } from "@/utils/capitalize";
import { getOAuthAvatarUrl } from "@/utils/oauth-metadata";

export const metadata = {
  title: "Set Up Your Profile",
};

// A wide mountain valley — the open road ahead of a new rider. Curated,
// reliable Unsplash frame (keyless), unlike a random keyword match.
const SETUP_IMAGE =
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=2000&q=80&auto=format&fit=crop";

const STEPS = ["Basics", "Riding Details", "Location", "About You"];

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
        <Image src={SETUP_IMAGE} alt="" fill priority unoptimized className="object-cover" />
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-t from-black via-black/70 to-black/50"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(100%_80%_at_85%_10%,rgba(231,111,36,0.25),transparent_55%)]"
        />
        <div
          aria-hidden
          className="bg-road-dashes absolute inset-x-0 bottom-0 h-px text-white/25"
        />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-5 px-6 py-16 sm:py-20">
          <div className="flex items-center justify-between">
            <Logo className="text-white" />
            <ThemeToggle className="text-white" />
          </div>

          <div className="mt-4 flex flex-col gap-4">
            <p className="text-telemetry text-[11px] text-white/70">Welcome Aboard</p>
            <h1 className="font-display text-5xl leading-[0.9] text-white uppercase sm:text-7xl">
              Welcome to the crew
            </h1>
            <p className="max-w-md text-lg text-pretty text-white/75">
              Tell your road family who you are before you post or claim a ride. Two minutes, and
              you&apos;re in.
            </p>
          </div>

          <ol className="flex flex-wrap gap-2 pt-2">
            {STEPS.map((step, index) => (
              <li
                key={step}
                className="text-telemetry flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[10px] text-white/80 ring-1 ring-white/15"
              >
                <span className="text-primary">{String(index + 1).padStart(2, "0")}</span>
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
            accountType: "rider",
            name:
              typeof user.user_metadata?.full_name === "string"
                ? toTitleCase(user.user_metadata.full_name)
                : "",
            username: "",
            city: "",
            country: "",
            bikeBrand: "",
            bikeModel: "",
            experienceLevel: "",
            yearsRiding: 0,
            businessName: "",
            primaryDestination: "",
            businessEmail: "",
            businessPhone: "",
            eventsOrganisedCount: 0,
            bio: "",
            instagramHandle: "",
          }}
        />
      </div>
    </div>
  );
}
