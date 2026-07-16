import Link from "next/link";
import { Logo } from "@/components/logo";
import { NotificationBell } from "@/components/notification-bell";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { getAuthUser } from "@/services/profiles";
import { getRecentNotifications, getUnreadNotificationCount } from "@/services/notifications";

export async function SiteHeader() {
  const user = await getAuthUser();
  const [notifications, unreadCount] = user
    ? await Promise.all([getRecentNotifications(user.id), getUnreadNotificationCount(user.id)])
    : [[], 0];

  return (
    <header className="border-border/60 bg-background/80 sticky top-0 z-40 border-b backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium sm:flex">
          <Link
            href="/rides"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Discover rides
          </Link>
          {user && (
            <Link
              href="/profile/rides"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              My rides
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
            />
          )}
          <Button
            nativeButton={false}
            render={<Link href={user ? "/profile" : "/login"}>{user ? "Profile" : "Sign in"}</Link>}
            variant="ghost"
            size="sm"
          />
          <Button
            nativeButton={false}
            render={
              <Link href={user ? "/rides/create" : "/login"}>
                {user ? "Create a ride" : "Get started"}
              </Link>
            }
            size="sm"
          />
        </div>
      </div>
    </header>
  );
}
