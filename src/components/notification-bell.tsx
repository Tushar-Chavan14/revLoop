"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/features/notifications/actions/notification-actions";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Notification } from "@/services/notifications";

// Keep in sync with RECENT_LIMIT in services/notifications.ts — this just
// caps the list after a live realtime insert is prepended client-side.
const NOTIFICATION_LIST_LIMIT = 10;

interface NotificationBellProps {
  currentUserId: string;
  initialNotifications: Notification[];
  initialUnreadCount: number;
}

function notificationHref(notification: Notification) {
  if (notification.type === "ride_join_request") {
    return "/profile";
  }
  return notification.ride_id ? `/rides/${notification.ride_id}` : "/profile";
}

export function NotificationBell({
  currentUserId,
  initialNotifications,
  initialUnreadCount,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    const channel = supabase
      .channel(`notifications-${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${currentUserId}`,
        },
        (payload) => {
          const row = payload.new as Notification;
          setNotifications((current) => [row, ...current].slice(0, NOTIFICATION_LIST_LIMIT));
          setUnreadCount((count) => count + 1);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, currentUserId]);

  function handleNotificationClick(notification: Notification) {
    if (!notification.read_at) {
      const readAt = new Date().toISOString();
      setNotifications((current) =>
        current.map((item) => (item.id === notification.id ? { ...item, read_at: readAt } : item)),
      );
      setUnreadCount((count) => Math.max(0, count - 1));
      void markNotificationRead(notification.id);
    }
    setOpen(false);
  }

  function handleMarkAllRead() {
    const readAt = new Date().toISOString();
    setNotifications((current) =>
      current.map((item) => ({ ...item, read_at: item.read_at ?? readAt })),
    );
    setUnreadCount(0);
    void markAllNotificationsRead();
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : "Notifications"}
        className="hover:bg-muted relative inline-flex size-8 items-center justify-center rounded-lg transition-colors"
      >
        <Bell className="size-4.5" aria-hidden />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-4 min-w-4 justify-center px-1 text-[10px]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-3 py-2.5">
          <p className="text-sm font-medium">Notifications</p>
          {unreadCount > 0 && (
            <Button type="button" variant="ghost" size="sm" onClick={handleMarkAllRead}>
              Mark all read
            </Button>
          )}
        </div>
        <div className="border-border max-h-96 overflow-y-auto border-t">
          {notifications.length === 0 ? (
            <p className="text-muted-foreground px-3 py-6 text-center text-sm">
              You&apos;re all caught up.
            </p>
          ) : (
            notifications.map((notification) => (
              <Link
                key={notification.id}
                href={notificationHref(notification)}
                onClick={() => handleNotificationClick(notification)}
                className={cn(
                  "hover:bg-muted flex flex-col gap-1 border-b px-3 py-2.5 text-sm last:border-b-0",
                  !notification.read_at && "bg-primary/5",
                )}
              >
                <span className="flex items-start gap-2">
                  <span
                    className={cn(
                      "mt-1.5 size-1.5 shrink-0 rounded-full",
                      notification.read_at ? "bg-transparent" : "bg-primary",
                    )}
                  />
                  <span className="flex-1">{notification.message}</span>
                </span>
                <span className="text-muted-foreground pl-3.5 text-xs">
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </span>
              </Link>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
