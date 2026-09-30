"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { MapPin, SendHorizontal } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatBubble } from "@/components/design-system/chat-bubble";
import { sendRideMessage } from "@/features/chat/actions/chat-actions";
import { useChatActivity } from "@/features/chat/components/chat-activity-provider";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { RideMessageWithSender, RiderProfile } from "@/services/ride-chat";

const VISIBLE_AVATAR_COUNT = 5;

interface RideChatProps {
  rideId: string;
  currentUserId: string;
  initialMessages: RideMessageWithSender[];
  senderProfiles: Record<string, RiderProfile>;
  ride: {
    title: string | null;
    destination: string | null;
    coverImageUrl: string | null;
    meetingPoint: string | null;
  };
  participants: RiderProfile[];
  /**
   * Whether the chat is actually on screen. The ride page keeps its widget
   * mounted while closed, so it passes `false` until opened — otherwise just
   * visiting a ride would mark its chat as read.
   */
  active?: boolean;
  /** Makes the ride title a link back to the ride (used on the Crew Chats screen). */
  rideHref?: string;
  className?: string;
}

export function RideChat({
  rideId,
  currentUserId,
  initialMessages,
  senderProfiles,
  ride,
  participants,
  active = true,
  rideHref,
  className,
}: RideChatProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [supabase] = useState(() => createClient());
  const { setActiveRideChat, markRideChatRead } = useChatActivity();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // While open, this chat is "seen": clear its unread badge, keep new
  // messages here from ever counting as unread, and move the read marker
  // forward whenever someone else's message lands.
  const lastMessage = messages[messages.length - 1];
  const lastIncomingId =
    lastMessage && lastMessage.sender_id !== currentUserId ? lastMessage.id : null;
  useEffect(() => {
    if (!active) {
      return;
    }
    setActiveRideChat(rideId);
    markRideChatRead(rideId);
    return () => setActiveRideChat(null);
  }, [active, rideId, lastIncomingId, setActiveRideChat, markRideChatRead]);

  useEffect(() => {
    const channel = supabase
      .channel(`ride-chat-${rideId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ride_messages",
          filter: `ride_id=eq.${rideId}`,
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            ride_id: string;
            sender_id: string;
            body: string | null;
            image_url: string | null;
            created_at: string;
          };
          setMessages((current) => {
            if (current.some((message) => message.id === row.id)) {
              return current;
            }
            return [...current, { ...row, sender: senderProfiles[row.sender_id] ?? null }];
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, rideId, senderProfiles]);

  async function handleSend() {
    const trimmed = body.trim();
    if (!trimmed || isSending) {
      return;
    }
    setIsSending(true);
    setError(null);

    // Sent through the server so the rest of the crew gets their ride alerts.
    const result = await sendRideMessage(rideId, trimmed);

    setIsSending(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }

    setBody("");
    const { message } = result;
    setMessages((current) =>
      current.some((existing) => existing.id === message.id) ? current : [...current, message],
    );
  }

  const visibleParticipants = participants.slice(0, VISIBLE_AVATAR_COUNT);
  const extraParticipants = participants.length - visibleParticipants.length;

  return (
    <div
      className={cn(
        "border-border bg-card flex h-[75vh] flex-col overflow-hidden rounded-2xl border",
        className,
      )}
    >
      <div className="border-border/60 flex items-center gap-3 border-b p-3">
        <div className="bg-secondary relative size-11 shrink-0 overflow-hidden rounded-xl">
          {ride.coverImageUrl && (
            <Image src={ride.coverImageUrl} alt="" fill sizes="44px" className="object-cover" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          {rideHref ? (
            <Link href={rideHref} className="block truncate text-sm font-semibold hover:underline">
              {ride.title}
            </Link>
          ) : (
            <p className="truncate text-sm font-semibold">{ride.title}</p>
          )}
          <p className="text-muted-foreground truncate text-xs">{ride.destination}</p>
        </div>
        {participants.length > 0 && (
          <AvatarGroup>
            {visibleParticipants.map((profile) => (
              <Avatar key={profile.id} size="sm">
                <AvatarImage src={profile.profile_image_url ?? undefined} alt={profile.name} />
                <AvatarFallback>{profile.name[0]}</AvatarFallback>
              </Avatar>
            ))}
            {extraParticipants > 0 && (
              <AvatarGroupCount className="size-6 text-xs">+{extraParticipants}</AvatarGroupCount>
            )}
          </AvatarGroup>
        )}
      </div>

      {ride.meetingPoint && (
        <div className="border-border/60 bg-primary/5 flex items-center gap-2 border-b px-4 py-2 text-xs">
          <MapPin className="text-muted-foreground size-3.5 shrink-0" />
          <span className="text-muted-foreground truncate">
            Meeting at <span className="text-foreground font-medium">{ride.meetingPoint}</span>
          </span>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-muted-foreground py-8 text-center text-sm">
            No messages yet — say hello!
          </p>
        )}
        {messages.map((message) => (
          <ChatBubble
            key={message.id}
            body={message.body ?? ""}
            timestamp={format(new Date(message.created_at), "HH:mm")}
            isOwn={message.sender_id === currentUserId}
            senderName={message.sender?.name}
            senderImageUrl={message.sender?.profile_image_url}
          />
        ))}
        <div ref={bottomRef} />
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void handleSend();
        }}
        className="flex items-center gap-2 border-t p-3"
      >
        <Input
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Write a message..."
          aria-label="Message"
          disabled={isSending}
        />
        <Button
          type="submit"
          size="icon"
          aria-label="Send message"
          disabled={isSending || !body.trim()}
        >
          <SendHorizontal className="size-4" aria-hidden />
        </Button>
      </form>
      {error && <p className="text-destructive px-3 pb-2 text-xs">{error}</p>}
    </div>
  );
}
