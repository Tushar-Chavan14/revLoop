import { Suspense } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { APP_DESCRIPTION } from "@/constants/site";
import { getAuthUser } from "@/services/profiles";
import { getMyRole } from "@/services/roles";

const FOOTER_LINK_CLASS =
  "text-secondary-foreground/70 hover:text-secondary-foreground text-telemetry text-[11px] transition-colors";

// Only the role-dependent links wait on the session, behind Suspense — the
// footer is below the fold and must never hold up the page's own content.
export function SiteFooter() {
  return (
    <footer className="bg-secondary text-secondary-foreground border-t border-white/10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <Logo />
          <p className="text-secondary-foreground/60 max-w-sm text-sm">{APP_DESCRIPTION}</p>
        </div>
        <Suspense fallback={<FooterNav role={null} />}>
          <RoleAwareFooterNav />
        </Suspense>
      </div>
      <div className="border-secondary-foreground/10 mx-auto flex w-full max-w-6xl flex-wrap gap-x-6 gap-y-2 border-t px-6 py-5">
        <Link
          href="/privacy"
          className="text-secondary-foreground/50 hover:text-secondary-foreground/80 text-xs transition-colors"
        >
          Privacy Policy
        </Link>
        <Link
          href="/terms"
          className="text-secondary-foreground/50 hover:text-secondary-foreground/80 text-xs transition-colors"
        >
          Terms & Conditions
        </Link>
      </div>
    </footer>
  );
}

async function RoleAwareFooterNav() {
  const user = await getAuthUser();
  const role = user ? await getMyRole() : null;
  return <FooterNav role={role} />;
}

function FooterNav({ role }: { role: string | null }) {
  const isOrganizer = role === "organizer";
  const isAdmin = role === "admin";

  return (
    <nav className="flex flex-wrap gap-x-7 gap-y-2">
      <Link href="/rides" className={FOOTER_LINK_CLASS}>
        Discover Rides
      </Link>
      {!isAdmin && (
        <Link href="/rides/create" className={FOOTER_LINK_CLASS}>
          {isOrganizer ? "Host a Ride" : "Post a Ride"}
        </Link>
      )}
      <Link href="/profile" className={FOOTER_LINK_CLASS}>
        {isOrganizer ? "Organizer Home" : "Rider Home"}
      </Link>
      <Link href="/notifications" className={FOOTER_LINK_CLASS}>
        Notifications
      </Link>
    </nav>
  );
}
