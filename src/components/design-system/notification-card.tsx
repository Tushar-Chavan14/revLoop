import {
  Bell,
  CalendarClock,
  ThumbsDown,
  ThumbsUp,
  UserPlus,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

const NOTIFICATION_ICONS: Record<string, LucideIcon> = {
  ride_join_request: UserPlus,
  ride_request_accepted: ThumbsUp,
  ride_request_rejected: ThumbsDown,
  ride_cancelled: XCircle,
  ride_reminder: CalendarClock,
};

interface NotificationCardProps {
  type: string;
  message: string;
  timeAgo: string;
  read?: boolean;
  className?: string;
}

/** A single notification row — used by the header popover and the full inbox page. */
export function NotificationCard({
  type,
  message,
  timeAgo,
  read = false,
  className,
}: NotificationCardProps) {
  const Icon = NOTIFICATION_ICONS[type] ?? Bell;

  return (
    <div
      data-slot="notification-card"
      className={cn(
        "flex items-start gap-3 rounded-2xl p-4 transition-colors",
        read ? "bg-card" : "bg-primary-soft",
        className,
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full",
          read ? "bg-muted text-muted-foreground" : "bg-primary/15 text-primary",
        )}
      >
        <Icon className="size-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm text-pretty", !read && "font-medium")}>{message}</p>
        <p className="text-muted-foreground mt-0.5 text-xs">{timeAgo}</p>
      </div>
      {!read && <span className="bg-primary mt-1.5 size-2 shrink-0 rounded-full" aria-hidden />}
    </div>
  );
}
