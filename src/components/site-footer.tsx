import Link from "next/link";
import { Logo } from "@/components/logo";
import { APP_DESCRIPTION } from "@/constants/site";

export function SiteFooter() {
  return (
    <footer className="bg-secondary text-secondary-foreground border-t border-white/10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <Logo />
          <p className="text-secondary-foreground/60 max-w-sm text-sm">{APP_DESCRIPTION}</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link
            href="/rides"
            className="text-secondary-foreground/70 hover:text-secondary-foreground transition-colors"
          >
            Discover rides
          </Link>
          <Link
            href="/rides/create"
            className="text-secondary-foreground/70 hover:text-secondary-foreground transition-colors"
          >
            Create a ride
          </Link>
          <Link
            href="/profile"
            className="text-secondary-foreground/70 hover:text-secondary-foreground transition-colors"
          >
            Profile
          </Link>
        </nav>
      </div>
    </footer>
  );
}
