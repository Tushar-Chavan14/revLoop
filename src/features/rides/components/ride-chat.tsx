"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
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
import { RIDE_MESSAGE_SENDER_SELECT } from "@/constants/ride-chat";
import { createClient } from "@/lib/supabase/client";
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
}

export function RideChat({
  rideId,
  currentUserId,
  initialMessages,
  senderProfiles,
  ride,
  participants,
}: RideChatProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Mark the chat read as soon as it's opened — RLS lets a member update
  // only their own ride_members row, so this is safe to fire from the client.
  useEffect(() => {
    void supabase
      .from("ride_members")
      .update({ last_read_at: new Date().toISOString() })
      .eq("ride_id", rideId)
      .eq("user_id", currentUserId);
  }, [supabase, rideId, currentUserId]);

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

    const { data, error: sendError } = await supabase
      .from("ride_messages")
      .insert({ ride_id: rideId, sender_id: currentUserId, body: trimmed })
      .select(RIDE_MESSAGE_SENDER_SELECT)
      .single();

    setIsSending(false);
    if (sendError || !data) {
      setError("Couldn't send your message, please try again");
      return;
    }

    setBody("");
    const message = data as RideMessageWithSender;
    setMessages((current) =>
      current.some((existing) => existing.id === message.id) ? current : [...current, message],
    );
  }

  const visibleParticipants = participants.slice(0, VISIBLE_AVATAR_COUNT);
  const extraParticipants = participants.length - visibleParticipants.length;

  return (
    <div className="border-border bg-card flex h-[75vh] flex-col overflow-hidden rounded-2xl border">
      <div className="border-border/60 flex items-center gap-3 border-b p-3">
        <div className="bg-secondary relative size-11 shrink-0 overflow-hidden rounded-xl">
          {ride.coverImageUrl && (
            <Image src={ride.coverImageUrl} alt="" fill unoptimized className="object-cover" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{ride.title}</p>
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
          <MapPin className="text-primary size-3.5 shrink-0" />
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
