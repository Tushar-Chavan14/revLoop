import Image from "next/image";
import { Logo } from "@/components/logo";
import { LoginForm } from "@/features/auth/components/login-form";
import { themedPhoto } from "@/lib/placeholder-image";

export const metadata = {
  title: "Sign In",
};

type LoginPageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

// The cruising-community group shot — belonging, the feeling a rider signs in
// for. Keyless LoremFlickr, the frame the brand already reads well with.
const LOGIN_IMAGE = themedPhoto("motorcycle,group,riders", 401, 1200, 1600);

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
        <Image src={LOGIN_IMAGE} alt="" fill priority unoptimized className="object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/45 to-black/40" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(110%_80%_at_80%_10%,rgba(231,111,36,0.28),transparent_55%)]"
        />

        <Logo className="relative text-white" />

        <div className="relative flex flex-col gap-6">
          <p className="text-telemetry text-[11px] text-white/70">The Home Of Weekend Riders</p>
          <h1 className="font-display text-6xl leading-[0.9] text-white uppercase xl:text-7xl">
            Your road family
            <br />
            is waiting
          </h1>
          <ul className="flex flex-col gap-2.5 text-white/75">
            {HIGHLIGHTS.map((highlight) => (
              <li key={highlight} className="flex items-center gap-2.5">
                <span className="bg-primary size-1.5 rounded-full" />
                {highlight}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Minimal form panel — the calm, welcoming half. */}
      <div className="flex flex-1 flex-col justify-center px-6 py-16 sm:px-12 lg:w-1/2 lg:px-20">
        <div className="mx-auto flex w-full max-w-sm flex-col gap-10">
          <Logo className="lg:hidden" />

          <div className="flex flex-col gap-2">
            <p className="text-telemetry text-primary text-[11px]">Welcome Back</p>
            <h2 className="font-heading text-3xl font-extrabold tracking-tight">
              Roll on in, rider
            </h2>
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
