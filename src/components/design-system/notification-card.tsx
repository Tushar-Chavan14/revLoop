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
        "bg-card hover:bg-muted/60 flex items-start gap-3 rounded-md p-4 transition-colors",
        className,
      )}
    >
      <Icon
        className={cn(
          "mt-0.5 size-4.5 shrink-0",
          read ? "text-muted-foreground" : "text-foreground",
        )}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm text-pretty", !read && "font-semibold")}>{message}</p>
        <p className="text-muted-foreground mt-0.5 text-sm">{timeAgo}</p>
      </div>
      {!read && <span className="bg-primary mt-1.5 size-2 shrink-0 rounded-full" aria-hidden />}
    </div>
  );
}
