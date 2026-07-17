"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Home, PlusCircle, UserRound, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface BottomNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const ITEMS: BottomNavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/rides", label: "Discover", icon: Compass },
  { href: "/rides/create", label: "Create", icon: PlusCircle },
  { href: "/profile", label: "Profile", icon: UserRound },
];

/** Fixed mobile tab bar — hidden at `sm:` and above where the navbar takes over. */
export function BottomNav() {
  const pathname = usePathname();

  // Nowhere to navigate away to until the profile setup flow is complete.
  if (pathname === "/profile/setup") {
    return null;
  }

  return (
    <nav
      aria-label="Primary"
      className="border-border/60 bg-background/85 fixed inset-x-0 bottom-0 z-50 border-t backdrop-blur-md sm:hidden"
    >
      <div className="flex items-stretch justify-around px-2 pt-1 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
        {ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const isCreate = item.href === "/rides/create";

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-lg py-2 text-[11px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon
                className={cn(isCreate ? "text-primary size-7" : "size-5")}
                fill={isCreate ? "currentColor" : "none"}
                aria-hidden
              />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
