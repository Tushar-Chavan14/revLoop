import Image from "next/image";
import { Logo } from "@/components/logo";
import { LoginForm } from "@/features/auth/components/login-form";
import { themedPhoto } from "@/lib/placeholder-image";
import { APP_DESCRIPTION } from "@/constants/site";

export const metadata = {
  title: "Sign in",
};

type LoginPageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

const HIGHLIGHTS = [
  "Plan and post your next ride",
  "Join riders headed your way",
  "Chat and coordinate in-app",
];

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, message } = await searchParams;

  return (
    <div className="flex min-h-svh flex-col lg:flex-row">
      <div className="bg-secondary relative hidden overflow-hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <Image
          src={themedPhoto("motorcycle,group,riders", 401, 1200, 1600)}
          alt=""
          fill
          unoptimized
          className="object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-black/60" />

        <Logo className="relative text-white" />

        <div className="relative flex flex-col gap-6">
          <h1 className="font-display text-6xl text-white uppercase xl:text-7xl">
            Your next ride is waiting.
          </h1>
          <p className="max-w-sm text-lg text-white/70">{APP_DESCRIPTION}</p>
        </div>

        <ul className="relative flex flex-col gap-3 text-sm text-white/70">
          {HIGHLIGHTS.map((highlight) => (
            <li key={highlight} className="flex items-center gap-2">
              <span className="bg-primary h-1.5 w-1.5 rounded-full" />
              {highlight}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-1 flex-col justify-center px-6 py-16 sm:px-12 lg:w-1/2 lg:px-20">
        <div className="mx-auto flex w-full max-w-sm flex-col gap-10">
          <Logo className="lg:hidden" />

          <div className="flex flex-col gap-2">
            <h2 className="font-heading text-2xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground">Sign in to plan your next ride.</p>
          </div>

          <LoginForm error={error} message={message} />
        </div>
      </div>
    </div>
  );
}
