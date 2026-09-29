"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface IncomingRideMessage {
  id: string;
  ride_id: string;
  sender_id: string;
  body: string | null;
  image_url: string | null;
  created_at: string;
}

type MessageListener = (message: IncomingRideMessage) => void;

interface ChatActivityValue {
  userId: string | null;
  /** Ride chats with messages from others the rider hasn't seen yet. */
  unreadRideIds: ReadonlySet<string>;
  /** The chat currently open on screen — new messages there never count as unread. */
  setActiveRideChat: (rideId: string | null) => void;
  markRideChatRead: (rideId: string) => void;
  /** Every new message across all of the rider's ride chats, live. */
  subscribeToMessages: (listener: MessageListener) => () => void;
}

const ChatActivityContext = createContext<ChatActivityValue | null>(null);

const EMPTY_SET: ReadonlySet<string> = new Set();

/**
 * One realtime subscription for the whole app, mounted in the root layout, so
 * the nav badge, the Crew Chats list and an open chat all agree on what's
 * unread. RLS on ride_messages means the channel only ever delivers messages
 * from rides the rider is a member of — no client-side filter needed.
 */
export function ChatActivityProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient());
  const [userId, setUserId] = useState<string | null>(null);
  const [unreadForUser, setUnreadRideIds] = useState<ReadonlySet<string>>(EMPTY_SET);
  // Signed out → nothing is unread, without an extra state reset.
  const unreadRideIds = userId ? unreadForUser : EMPTY_SET;
  const activeRideIdRef = useRef<string | null>(null);
  const listenersRef = useRef(new Set<MessageListener>());

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  const refreshUnread = useCallback(
    () =>
      supabase.rpc("get_my_unread_ride_chat_ids").then(({ data }) => {
        const ids = new Set(data ?? []);
        if (activeRideIdRef.current) {
          ids.delete(activeRideIdRef.current);
        }
        setUnreadRideIds(ids);
      }),
    [supabase],
  );

  useEffect(() => {
    if (!userId) {
      return;
    }

    void refreshUnread();

    const channel = supabase
      .channel(`chat-activity-${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "ride_messages" },
        (payload) => {
          const message = payload.new as IncomingRideMessage;
          for (const listener of listenersRef.current) {
            listener(message);
          }
          if (message.sender_id !== userId && message.ride_id !== activeRideIdRef.current) {
            setUnreadRideIds((current) => new Set(current).add(message.ride_id));
          }
        },
      )
      .subscribe();

    // Realtime can drop while a phone is locked or the tab sleeps — catch up
    // on anything missed as soon as the rider is back.
    function handleVisibility() {
      if (document.visibilityState === "visible") {
        void refreshUnread();
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      void supabase.removeChannel(channel);
    };
  }, [supabase, userId, refreshUnread]);

  // Installed-app icon badge (Android/desktop PWAs, iOS home screen apps).
  useEffect(() => {
    if (!("setAppBadge" in navigator)) {
      return;
    }
    if (unreadRideIds.size > 0) {
      void navigator.setAppBadge(unreadRideIds.size).catch(() => {});
    } else {
      void navigator.clearAppBadge().catch(() => {});
    }
  }, [unreadRideIds]);

  const markRideChatRead = useCallback(
    (rideId: string) => {
      setUnreadRideIds((current) => {
        if (!current.has(rideId)) {
          return current;
        }
        const next = new Set(current);
        next.delete(rideId);
        return next;
      });
      if (!userId) {
        return;
      }
      // enforce_ride_member_update lets a member touch only their own last_read_at.
      // Supabase queries are lazy — nothing is sent until the builder is
      // awaited/then'd, so a bare `void supabase.from(...)` never runs.
      void supabase
        .from("ride_members")
        .update({ last_read_at: new Date().toISOString() })
        .eq("ride_id", rideId)
        .eq("user_id", userId)
        .then(({ error }) => {
          if (error) {
            console.error("Couldn't save ride chat read marker", error.message);
          }
        });
    },
    [supabase, userId],
  );

  const setActiveRideChat = useCallback((rideId: string | null) => {
    activeRideIdRef.current = rideId;
  }, []);

  const subscribeToMessages = useCallback((listener: MessageListener) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  return (
    <ChatActivityContext
      value={{ userId, unreadRideIds, setActiveRideChat, markRideChatRead, subscribeToMessages }}
    >
      {children}
    </ChatActivityContext>
  );
}

export function useChatActivity(): ChatActivityValue {
  const value = useContext(ChatActivityContext);
  if (!value) {
    throw new Error("useChatActivity must be used inside <ChatActivityProvider>");
  }
  return value;
}
