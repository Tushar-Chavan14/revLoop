import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface TimelineItemData {
  icon: LucideIcon;
  title: string;
  time?: string;
  description?: string;
  active?: boolean;
  href?: string;
  badge?: React.ReactNode;
  /** Community (blue) vs Organized (orange) — same accent language as RideCard. */
  accent?: "community" | "organized";
}

const ACCENT_TEXT: Record<NonNullable<TimelineItemData["accent"]>, string> = {
  community: "text-ride-community",
  organized: "text-primary-ink",
};

/** A vertical route/journey timeline — ride detail stops, My Rides history. */
export function Timeline({ items, className }: { items: TimelineItemData[]; className?: string }) {
  return (
    <div className={cn("flex flex-col", className)}>
      {items.map((item, index) => {
        const content = (
          <div className={cn("min-w-0 flex-1", index < items.length - 1 ? "pb-8" : "pb-1")}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">{item.title}</p>
              {item.badge}
            </div>
            {item.time && <p className="text-muted-foreground text-sm tabular-nums">{item.time}</p>}
            {item.description && (
              <p className="text-muted-foreground mt-1 text-sm text-pretty">{item.description}</p>
            )}
          </div>
        );

        return (
          <div key={index} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center",
                  item.active
                    ? (item.accent && ACCENT_TEXT[item.accent]) || "text-foreground"
                    : "text-muted-foreground",
                )}
              >
                <item.icon className="size-5" />
              </span>
              {index < items.length - 1 && <span className="bg-border my-1 w-px flex-1" />}
            </div>
            {item.href ? (
              <Link
                href={item.href}
                className="hover:bg-muted -mx-2 min-w-0 flex-1 rounded-md px-2"
              >
                {content}
              </Link>
            ) : (
              content
            )}
          </div>
        );
      })}
    </div>
  );
}
