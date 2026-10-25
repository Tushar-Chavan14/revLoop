import { Suspense } from "react";
import Link from "next/link";
import { Coffee } from "lucide-react";
import { APP_DESCRIPTION } from "@/constants/site";
import { getAuthUser } from "@/services/profiles";
import { getMyRole } from "@/services/roles";

const SUPPORT_URL = "https://buymeachai.ezee.li/daredevil14";

const FOOTER_LINK_CLASS =
  "text-[15px] font-semibold underline-offset-4 decoration-2 hover:underline";

// The close of every page is a hi-vis field — the colour of a highway board —
// with the name across its full width. Only the role-dependent links wait on
// the session, behind Suspense, so the footer never holds up the page.
export function SiteFooter() {
  return (
    <footer className="bg-primary overflow-hidden text-[#111]">
      <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pt-12 sm:flex-row sm:items-start sm:justify-between sm:px-8">
        <p className="max-w-sm text-[15px] leading-relaxed font-medium">{APP_DESCRIPTION}</p>
        <div className="flex flex-col gap-6 sm:items-end">
          <Suspense fallback={<FooterNav role={null} />}>
            <RoleAwareFooterNav />
          </Suspense>
          <SupportLink />
        </div>
      </div>
      <div className="mx-auto w-full max-w-[90rem] px-4 sm:px-8">
        <Link
          href="/"
          aria-label="RoadKin home"
          className="font-display block pt-10 text-[33vw] leading-[0.78] select-none 2xl:text-[31rem]"
        >
          RoadKin
        </Link>
      </div>
      <div className="mx-auto flex w-full max-w-[90rem] flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 pt-6 pb-8 text-sm font-medium sm:px-8">
        <div className="flex gap-6">
          <Link href="/privacy" className="underline-offset-4 hover:underline">
            Privacy policy
          </Link>
          <Link href="/terms" className="underline-offset-4 hover:underline">
            Terms &amp; conditions
          </Link>
        </div>
        <p>Never ride alone again. Built for India&apos;s weekend riders.</p>
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
    <nav aria-label="Footer" className="flex flex-wrap gap-x-7 gap-y-2 sm:justify-end">
      <Link href="/rides" className={FOOTER_LINK_CLASS}>
        Discover rides
      </Link>
      {!isAdmin && (
        <Link href="/rides/create" className={FOOTER_LINK_CLASS}>
          {isOrganizer ? "Host a ride" : "Post a ride"}
        </Link>
      )}
      <Link href="/profile" className={FOOTER_LINK_CLASS}>
        {isOrganizer ? "Organizer home" : "Ride home"}
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
      className="group flex w-fit items-center gap-3 rounded-md bg-[#111] py-2 pr-4 pl-3 text-white transition-transform active:translate-y-px"
    >
      <Coffee className="size-4 transition-transform group-hover:-rotate-12" aria-hidden />
      <span className="flex flex-col">
        <span className="text-sm font-bold">Sponsor a chai stop</span>
        <span className="text-xs text-white/75">Keep RoadKin rolling</span>
      </span>
    </a>
  );
}
