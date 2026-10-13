import { Suspense } from "react";
import Link from "next/link";
import { Coffee } from "lucide-react";
import { Logo } from "@/components/logo";
import { APP_DESCRIPTION } from "@/constants/site";
import { getAuthUser } from "@/services/profiles";
import { getMyRole } from "@/services/roles";

const SUPPORT_URL = "https://buymeachai.ezee.li/daredevil14";

const FOOTER_LINK_CLASS =
  "text-secondary-foreground/70 hover:text-secondary-foreground text-telemetry text-[11px] transition-colors";

// Only the role-dependent links wait on the session, behind Suspense — the
// footer is below the fold and must never hold up the page's own content.
export function SiteFooter() {
  return (
    <footer className="bg-secondary text-secondary-foreground border-t border-white/10">
      {/* Top-aligned two columns: brand on the left; links + the chai stop
          stacked on the right, so the nav lines up with the logo row. */}
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <Logo />
          <p className="text-secondary-foreground/60 max-w-sm text-sm">{APP_DESCRIPTION}</p>
        </div>
        <div className="flex flex-col gap-6 sm:items-end sm:pt-1.5">
          <Suspense fallback={<FooterNav role={null} />}>
            <RoleAwareFooterNav />
          </Suspense>
          <SupportLink />
        </div>
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
    <nav className="flex flex-wrap gap-x-7 gap-y-2 sm:justify-end">
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

// Buy Me A Chai, in RoadKin's voice — every long ride has a chai stop. Plain
// text link rather than the service's stock image button, so the copy is ours
// and nothing third-party loads on every page.
function SupportLink() {
  return (
    <a
      href={SUPPORT_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="group border-secondary-foreground/15 hover:border-secondary-foreground/40 flex w-fit items-center gap-3 rounded-full border py-2 pr-4 pl-2.5 transition-colors"
    >
      <span className="bg-secondary-foreground/10 flex size-8 items-center justify-center rounded-full">
        <Coffee className="size-4 transition-transform group-hover:-rotate-12" aria-hidden />
      </span>
      <span className="flex flex-col">
        <span className="text-telemetry text-[11px]">Sponsor A Chai Stop</span>
        <span className="text-secondary-foreground/60 text-xs">Keep RoadKin rolling</span>
      </span>
    </a>
  );
}
