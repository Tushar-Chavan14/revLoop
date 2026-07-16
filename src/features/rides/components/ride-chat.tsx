"use client";

import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { SendHorizontal, UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RIDE_MESSAGE_SENDER_SELECT } from "@/constants/ride-chat";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { RideMessageWithSender, RiderProfile } from "@/services/ride-chat";

interface RideChatProps {
  rideId: string;
  currentUserId: string;
  initialMessages: RideMessageWithSender[];
  senderProfiles: Record<string, RiderProfile>;
}

export function RideChat({
  rideId,
  currentUserId,
  initialMessages,
  senderProfiles,
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

  return (
    <div className="border-border bg-card flex h-[70vh] flex-col rounded-2xl border">
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-muted-foreground py-8 text-center text-sm">
            No messages yet — say hello!
          </p>
        )}
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.sender_id === currentUserId}
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

function MessageBubble({ message, isOwn }: { message: RideMessageWithSender; isOwn: boolean }) {
  return (
    <div className={cn("flex items-end gap-2", isOwn && "flex-row-reverse")}>
      <Avatar size="sm">
        <AvatarImage
          src={message.sender?.profile_image_url ?? undefined}
          alt={message.sender?.name ?? "Rider"}
        />
        <AvatarFallback>
          <UserRound className="size-3.5" />
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-3 py-2 text-sm",
          isOwn ? "bg-primary text-primary-foreground" : "bg-muted",
        )}
      >
        {!isOwn && (
          <p className="text-xs font-medium opacity-70">{message.sender?.name ?? "Rider"}</p>
        )}
        <p className="text-pretty">{message.body}</p>
        <p className="mt-1 text-[10px] opacity-60">
          {format(new Date(message.created_at), "HH:mm")}
        </p>
      </div>
    </div>
  );
}
