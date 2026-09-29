"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Home,
  MessagesSquare,
  PlusCircle,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import { useChatActivity } from "@/features/chat/components/chat-activity-provider";
import { unreadChatsLabel } from "@/features/chat/components/chats-nav-link";
import { cn } from "@/lib/utils";

interface BottomNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Shown to signed-out visitors too — everything else needs an account. */
  public?: boolean;
}

const ITEMS: BottomNavItem[] = [
  { href: "/", label: "Home", icon: Home, public: true },
  { href: "/rides", label: "Discover", icon: Compass, public: true },
  { href: "/rides/create", label: "Create", icon: PlusCircle },
  { href: "/chats", label: "Chats", icon: MessagesSquare },
  { href: "/profile", label: "Profile", icon: UserRound },
];

/** Fixed mobile tab bar — hidden at `sm:` and above where the navbar takes over. */
export function BottomNav() {
  const pathname = usePathname();
  const { userId, unreadRideIds } = useChatActivity();

  // Nowhere to navigate away to until the profile setup flow is complete.
  if (pathname === "/profile/setup") {
    return null;
  }

  const items = userId && pathname !== "/login" ? ITEMS : ITEMS.filter((item) => item.public);

  return (
    <nav
      aria-label="Primary"
      className="border-border/60 bg-background/85 fixed inset-x-0 bottom-0 z-50 border-t backdrop-blur-md sm:hidden"
    >
      <div className="flex items-stretch justify-around px-2 pt-1 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
        {items.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const isCreate = item.href === "/rides/create";
          const badge = item.href === "/chats" ? unreadRideIds.size : 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              aria-label={badge > 0 ? `${item.label}, ${badge} with new messages` : undefined}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-0.5 rounded-lg py-2 text-[11px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon
                className={cn(isCreate ? "text-primary size-7" : "size-5")}
                fill={isCreate ? "currentColor" : "none"}
                aria-hidden
              />
              {badge > 0 && (
                <span className="bg-primary text-primary-foreground absolute top-1 left-1/2 ml-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold tabular-nums">
                  {unreadChatsLabel(badge)}
                </span>
              )}
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
