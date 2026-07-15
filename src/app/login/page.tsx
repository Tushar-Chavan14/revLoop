import { Logo } from "@/components/logo";
import { LoginForm } from "@/features/auth/components/login-form";
import { APP_DESCRIPTION, APP_TAGLINE } from "@/constants/site";

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
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,oklch(0.705_0.191_41.6/30%),transparent_55%)]"
        />
        <div
          aria-hidden
          className="bg-primary/20 pointer-events-none absolute -right-24 -bottom-24 h-96 w-96 rounded-full blur-3xl"
        />

        <Logo className="text-secondary-foreground relative" />

        <div className="relative flex flex-col gap-6">
          <h1 className="text-secondary-foreground text-5xl font-semibold tracking-tight text-balance">
            {APP_TAGLINE}
          </h1>
          <p className="text-secondary-foreground/70 max-w-sm text-lg">{APP_DESCRIPTION}</p>
        </div>

        <ul className="text-secondary-foreground/70 relative flex flex-col gap-3 text-sm">
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
            <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground">Sign in to plan your next ride.</p>
          </div>

          <LoginForm error={error} message={message} />
        </div>
      </div>
    </div>
  );
}
