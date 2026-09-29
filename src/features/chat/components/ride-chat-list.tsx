"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import { format, isThisWeek, isToday, isYesterday } from "date-fns";
import { Bike } from "lucide-react";
import { useChatActivity } from "@/features/chat/components/chat-activity-provider";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { RideChatSummary } from "@/services/ride-chat";

interface RideChatListProps {
  initialChats: RideChatSummary[];
  currentUserId: string;
}

function activityLabel(iso: string) {
  const date = new Date(iso);
  if (isToday(date)) {
    return format(date, "HH:mm");
  }
  if (isYesterday(date)) {
    return "Yesterday";
  }
  if (isThisWeek(date)) {
    return format(date, "EEE");
  }
  return format(date, "d MMM");
}

const STATUS_LABEL: Partial<Record<RideChatSummary["status"], string>> = {
  ongoing: "Rolling now",
  completed: "Ride done",
  cancelled: "Called off",
};

/**
 * Every crew chat the rider is part of, newest activity first — previews,
 * unread counts and ordering all update live as messages land.
 */
export function RideChatList({ initialChats, currentUserId }: RideChatListProps) {
  const router = useRouter();
  const selectedRideId = useSelectedLayoutSegment();
  const { unreadRideIds, subscribeToMessages } = useChatActivity();
  const [supabase] = useState(() => createClient());
  const [chats, setChats] = useState(initialChats);

  useEffect(() => {
    return subscribeToMessages(async (message) => {
      const known = chats.find((chat) => chat.ride_id === message.ride_id);
      if (!known) {
        // A chat from a ride they only just joined — pull the fresh list.
        router.refresh();
        return;
      }

      let senderName =
        chats.find((chat) => chat.last_sender_id === message.sender_id)?.last_sender_name ?? null;
      if (!senderName && message.sender_id !== currentUserId) {
        const { data } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", message.sender_id)
          .maybeSingle();
        senderName = data?.name ?? null;
      }

      setChats((current) =>
        current
          .map((chat) =>
            chat.ride_id === message.ride_id
              ? {
                  ...chat,
                  last_message_body: message.body,
                  last_message_at: message.created_at,
                  last_sender_id: message.sender_id,
                  last_sender_name: senderName,
                  // Restart from zero if the chat was seen since its last count,
                  // and never count your own messages or the chat you're reading.
                  unread_count:
                    (unreadRideIds.has(chat.ride_id) ? chat.unread_count : 0) +
                    (message.sender_id === currentUserId || message.ride_id === selectedRideId
                      ? 0
                      : 1),
                }
              : chat,
          )
          .sort((a, b) => (b.last_message_at ?? "").localeCompare(a.last_message_at ?? "")),
      );
    });
  }, [subscribeToMessages, chats, unreadRideIds, selectedRideId, currentUserId, supabase, router]);

  return (
    <ul className="border-border bg-card divide-border/60 flex flex-col divide-y overflow-hidden rounded-2xl border">
      {chats.map((chat) => {
        // The provider is the source of truth for "seen" — once it clears a
        // chat (opened here, on the ride page, or on another tab) the count goes.
        const unread = unreadRideIds.has(chat.ride_id) ? Math.max(chat.unread_count, 1) : 0;
        const isSelected = selectedRideId === chat.ride_id;
        const statusLabel = STATUS_LABEL[chat.status];
        const preview = chat.last_message_body
          ? `${chat.last_sender_id === currentUserId ? "You" : (chat.last_sender_name ?? "Rider")}: ${chat.last_message_body}`
          : "No messages yet — say hello to your crew.";

        return (
          <li key={chat.ride_id}>
            <Link
              href={`/chats/${chat.ride_id}`}
              aria-current={isSelected ? "page" : undefined}
              className={cn(
                "hover:bg-muted/60 flex items-center gap-3 px-3 py-3 transition-colors",
                isSelected && "bg-muted",
              )}
            >
              <div className="bg-secondary relative size-12 shrink-0 overflow-hidden rounded-xl">
                {chat.cover_image_url ? (
                  <Image
                    src={chat.cover_image_url}
                    alt=""
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <Bike
                    className="text-muted-foreground absolute inset-0 m-auto size-5"
                    aria-hidden
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className={cn("truncate text-sm", unread ? "font-bold" : "font-semibold")}>
                    {chat.title}
                  </p>
                  {chat.last_message_at && (
                    <span
                      className={cn(
                        "shrink-0 text-[11px] tabular-nums",
                        unread ? "text-primary font-semibold" : "text-muted-foreground",
                      )}
                    >
                      {activityLabel(chat.last_message_at)}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 flex items-center justify-between gap-2">
                  <p
                    className={cn(
                      "truncate text-xs",
                      unread ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {preview}
                  </p>
                  {unread > 0 && (
                    <span className="bg-primary text-primary-foreground flex h-4.5 min-w-4.5 shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold tabular-nums">
                      {unread > 99 ? "99+" : unread}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground mt-1 truncate text-[11px]">
                  {format(new Date(`${chat.ride_date}T00:00:00`), "EEE, d MMM")} ·{" "}
                  {chat.destination} · {chat.member_count}{" "}
                  {chat.member_count === 1 ? "rider" : "riders"}
                  {statusLabel && <> · {statusLabel}</>}
                </p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
