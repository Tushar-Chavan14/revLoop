import Link from "next/link";
import { Logo } from "@/components/logo";
import { NotificationBell } from "@/components/notification-bell";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";
import { getAuthUser, getProfileByUserId } from "@/services/profiles";
import { getRecentNotifications, getUnreadNotificationCount } from "@/services/notifications";
import { getCommunityActivity } from "@/services/rides";
import { toTitleCase } from "@/utils/capitalize";
import { getOAuthAvatarUrl } from "@/utils/oauth-metadata";

export async function SiteHeader() {
  const user = await getAuthUser();
  const [notifications, unreadCount, communityActivity, profile] = user
    ? await Promise.all([
        getRecentNotifications(user.id),
        getUnreadNotificationCount(user.id),
        getCommunityActivity(8),
        getProfileByUserId(user.id),
      ])
    : [[], 0, [], null];

  return (
    <header className="border-border/60 bg-background/80 sticky top-0 z-40 border-b backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium sm:flex">
          <Link
            href="/rides"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Discover Rides
          </Link>
          {user && (
            <Link
              href="/profile/rides"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              My Rides
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user && (
            <NotificationBell
              currentUserId={user.id}
              initialNotifications={notifications}
              initialUnreadCount={unreadCount}
              communityActivity={communityActivity}
            />
          )}
          <Button
            nativeButton={false}
            render={
              <Link href={user ? "/rides/create" : "/login"}>
                {user ? "Create A Ride" : "Get Started"}
              </Link>
            }
            size="sm"
          />
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
            />
          ) : (
            <Button
              nativeButton={false}
              render={<Link href="/login">Sign In</Link>}
              variant="ghost"
              size="sm"
            />
          )}
        </div>
      </div>
    </header>
  );
}
