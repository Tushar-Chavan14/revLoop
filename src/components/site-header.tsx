import { Suspense } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { NotificationBell } from "@/components/notification-bell";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserMenu } from "@/components/user-menu";
import { ChatsNavLink } from "@/features/chat/components/chats-nav-link";
import { getAuthUser, getProfileByUserId } from "@/services/profiles";
import { getRecentNotifications, getUnreadNotificationCount } from "@/services/notifications";
import { getCommunityActivity } from "@/services/rides";
import { getMyRole } from "@/services/roles";
import { toTitleCase } from "@/utils/capitalize";
import { getOAuthAvatarUrl } from "@/utils/oauth-metadata";

const NAV_LINK_CLASS =
  "text-muted-foreground hover:text-foreground text-telemetry text-[11px] transition-colors";

// The shell (logo, public nav, theme toggle) renders immediately; everything
// that depends on who's signed in streams in behind its own Suspense
// boundary, so a page's content never waits on the header's queries.
export function SiteHeader() {
  return (
    <header className="border-border/60 bg-background/70 supports-backdrop-filter:bg-background/55 sticky top-0 z-40 border-b backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="transition-opacity hover:opacity-80">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-8 sm:flex">
          <Link href="/rides" className={NAV_LINK_CLASS}>
            Discover Rides
          </Link>
          <Suspense fallback={null}>
            <SignedInNavLinks />
          </Suspense>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Suspense fallback={<HeaderActionsSkeleton />}>
            <HeaderActions />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

async function SignedInNavLinks() {
  const user = await getAuthUser();
  if (!user) {
    return null;
  }
  return (
    <>
      <Link href="/profile/rides" className={NAV_LINK_CLASS}>
        My Rides
      </Link>
      <ChatsNavLink />
    </>
  );
}

function HeaderActionsSkeleton() {
  return (
    <div className="flex items-center gap-2" aria-hidden>
      <Skeleton className="h-8 w-24 rounded-lg" />
      <Skeleton className="size-8 rounded-full" />
    </div>
  );
}

async function HeaderActions() {
  const user = await getAuthUser();
  const [notifications, unreadCount, communityActivity, profile, role] = user
    ? await Promise.all([
        getRecentNotifications(user.id),
        getUnreadNotificationCount(user.id),
        getCommunityActivity(8),
        getProfileByUserId(user.id),
        getMyRole(),
      ])
    : [[], 0, [], null, "user" as const];
  const isOrganizer = role === "organizer";
  const isAdmin = role === "admin";

  return (
    <>
      {user && (
        <NotificationBell
          currentUserId={user.id}
          initialNotifications={notifications}
          initialUnreadCount={unreadCount}
          communityActivity={communityActivity}
        />
      )}
      {!isAdmin && (
        <Button
          nativeButton={false}
          render={
            <Link href={user ? "/rides/create" : "/login"}>
              {user ? (isOrganizer ? "Host a Ride" : "Post a Ride") : "Get Started"}
            </Link>
          }
          size="sm"
        />
      )}
      {user ? (
        <UserMenu
          name={
            profile?.name ??
            (typeof user.user_metadata?.full_name === "string"
              ? toTitleCase(user.user_metadata.full_name)
              : "Rider")
          }
          username={profile?.username}
          avatarUrl={profile?.profile_image_url ?? getOAuthAvatarUrl(user.user_metadata)}
          isOrganizer={isOrganizer}
        />
      ) : (
        <Button
          nativeButton={false}
          render={<Link href="/login">Sign In</Link>}
          variant="ghost"
          size="sm"
        />
      )}
    </>
  );
}
