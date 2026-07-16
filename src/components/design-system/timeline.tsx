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
}

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
            {item.time && <p className="text-muted-foreground text-xs">{item.time}</p>}
            {item.description && (
              <p className="text-muted-foreground mt-1 text-sm text-pretty">{item.description}</p>
            )}
          </div>
        );

        return (
          <div key={index} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full ring-2",
                  item.active
                    ? "bg-primary text-primary-foreground ring-primary/30"
                    : "bg-muted text-muted-foreground ring-border",
                )}
              >
                <item.icon className="size-4" />
              </span>
              {index < items.length - 1 && <span className="bg-border my-1 w-px flex-1" />}
            </div>
            {item.href ? (
              <Link
                href={item.href}
                className="hover:bg-muted -mx-2 min-w-0 flex-1 rounded-lg px-2"
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
