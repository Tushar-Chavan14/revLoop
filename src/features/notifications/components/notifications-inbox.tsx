"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { formatDistanceToNow, isThisWeek, isToday, isYesterday } from "date-fns";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationCard } from "@/components/design-system/notification-card";
import { EmptyState } from "@/components/design-system/state-panel";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/features/notifications/actions/notification-actions";
import type { Notification } from "@/services/notifications";

function notificationHref(notification: Notification) {
  if (notification.type === "ride_join_request") {
    return "/profile";
  }
  return notification.ride_id ? `/rides/${notification.ride_id}` : "/profile";
}

const GROUP_ORDER = ["Today", "Yesterday", "This Week", "Earlier"] as const;

function groupLabel(createdAt: string): (typeof GROUP_ORDER)[number] {
  const date = new Date(createdAt);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  if (isThisWeek(date)) return "This Week";
  return "Earlier";
}

export function NotificationsInbox({
  initialNotifications,
}: {
  initialNotifications: Notification[];
}) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [, startTransition] = useTransition();

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const groups = GROUP_ORDER.map((label) => ({
    label,
    items: notifications.filter((n) => groupLabel(n.created_at) === label),
  })).filter((group) => group.items.length > 0);

  function handleOpen(notification: Notification) {
    if (!notification.read_at) {
      const readAt = new Date().toISOString();
      setNotifications((current) =>
        current.map((item) => (item.id === notification.id ? { ...item, read_at: readAt } : item)),
      );
      startTransition(() => {
        void markNotificationRead(notification.id);
      });
    }
  }

  function handleMarkAllRead() {
    const readAt = new Date().toISOString();
    setNotifications((current) =>
      current.map((item) => ({ ...item, read_at: item.read_at ?? readAt })),
    );
    startTransition(() => {
      void markAllNotificationsRead();
    });
  }

  if (notifications.length === 0) {
    return (
      <EmptyState
        icon={Bell}
        title="You're All Caught Up"
        description="Join requests, ride updates, and reminders will show up here."
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {unreadCount > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">{unreadCount} unread</p>
          <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
            Mark All Read
          </Button>
        </div>
      )}
      {groups.map((group) => (
        <section key={group.label} className="flex flex-col gap-2">
          <h2 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {group.label}
          </h2>
          <div className="flex flex-col gap-2">
            {group.items.map((notification) => (
              <Link
                key={notification.id}
                href={notificationHref(notification)}
                onClick={() => handleOpen(notification)}
              >
                <NotificationCard
                  type={notification.type}
                  message={notification.message}
                  timeAgo={formatDistanceToNow(new Date(notification.created_at), {
                    addSuffix: true,
                  })}
                  read={Boolean(notification.read_at)}
                />
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
