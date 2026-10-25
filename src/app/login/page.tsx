import Image from "next/image";
import { Logo } from "@/components/logo";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata = {
  title: "Sign in",
};

type LoginPageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

// The cruising-community group shot — belonging, the feeling a rider signs in
// for. Keyless LoremFlickr, the frame the brand already reads well with.
// A real Royal Enfield on a Himalayan road ("Royalenfield Himalaya" by Gopal
// Vijayaraghavan, CC BY 3.0, via Wikimedia Commons — credited on the panel).
const LOGIN_IMAGE = "/road/royalenfield-himalaya.jpg";

const HIGHLIGHTS = [
  "Find your weekend crew",
  "Claim your seat in a tap",
  "Roll out with your road family",
];

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, message } = await searchParams;

  return (
    <div className="flex min-h-svh flex-col lg:flex-row">
      {/* Immersive photography panel — the emotional half. */}
      <div className="bg-secondary relative hidden overflow-hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        {/* No preload: this panel is desktop-only, and a preloaded image is
            fetched even while display:none — lazy lets phones skip it. */}
        <Image
          src={LOGIN_IMAGE}
          alt="A Royal Enfield parked beside a mountain road in the Himalaya"
          fill
          sizes="50vw"
          className="object-cover"
        />
        {/* Neutral black scrim so the white type reads on the photograph. */}
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/45 to-black/40" />

        <Logo className="relative text-white" />

        <div className="relative flex flex-col gap-6">
          <p className="font-display text-6xl leading-[0.9] text-white xl:text-7xl">
            Your road family
            <br />
            is waiting
          </p>
          <ul className="flex flex-col gap-2.5 text-base text-white/75">
            {HIGHLIGHTS.map((highlight) => (
              <li key={highlight} className="flex items-center gap-2.5">
                <span className="size-1.5 rounded-full bg-white/60" />
                {highlight}
              </li>
            ))}
          </ul>
          <p className="text-[13px] text-white/60">
            Photo: “Royalenfield Himalaya” by Gopal Vijayaraghavan, CC BY 3.0, via Wikimedia
            Commons
          </p>
        </div>
      </div>

      {/* Minimal form panel — the calm, welcoming half. */}
      <div className="flex flex-1 flex-col justify-center px-6 py-16 sm:px-12 lg:w-1/2 lg:px-20">
        <div className="mx-auto flex w-full max-w-sm flex-col gap-10">
          <Logo className="lg:hidden" />

          <div className="flex flex-col gap-2">
            <h1 className="font-display text-5xl">Roll on in, rider</h1>
            <p className="text-muted-foreground">
              Sign in and find your crew for this weekend&apos;s ride.
            </p>
          </div>

          <LoginForm error={error} message={message} />
        </div>
      </div>
    </div>
  );
}
