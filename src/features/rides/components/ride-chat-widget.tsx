"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { RideChat } from "@/features/rides/components/ride-chat";
import { cn } from "@/lib/utils";
import type { RideMessageWithSender, RiderProfile } from "@/services/ride-chat";

interface RideChatWidgetProps {
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

// A floating support-widget-style entry point instead of a dedicated page —
// the ride's own chat lives right where you're already looking at the ride,
// no separate navigation required to find it. On mobile the panel takes over
// the full screen instead of floating as a small card — there's not enough
// room for a corner widget to be usable there.
//
// Open/closed state lives entirely in the `?chat=open` URL param (the same
// one the old /rides/[id]/chat route now redirects into) — no separate
// useState duplicating it. RideChat itself is always mounted (just hidden
// via CSS when closed) so toggling the widget never throws away its
// in-memory messages or realtime subscription.
export function RideChatWidget(props: RideChatWidgetProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const open = searchParams.get("chat") === "open";

  function setOpen(next: boolean) {
    const params = new URLSearchParams(searchParams.toString());
    if (next) {
      params.set("chat", "open");
    } else {
      params.delete("chat");
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <>
      <div
        aria-hidden={!open}
        className={cn(
          "fixed inset-0 z-60 flex flex-col transition-all duration-200 ease-out sm:inset-auto sm:right-6 sm:bottom-24 sm:w-104",
          open
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-4 scale-95 opacity-0",
        )}
      >
        {/* Dedicated close bar on mobile, above RideChat's own header — a
            button layered on top of it would overlap the participant
            avatars sitting in that same corner. */}
        <div className="border-border/60 bg-card flex items-center justify-end border-b p-2 sm:hidden">
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close ride chat"
            tabIndex={open ? 0 : -1}
            className="hover:bg-muted flex size-9 items-center justify-center rounded-full"
          >
            <X className="size-4" />
          </button>
        </div>
        <RideChat
          {...props}
          className="min-h-0 flex-1 rounded-none border-0 sm:h-[min(70vh,32rem)] sm:flex-none sm:rounded-2xl sm:border sm:shadow-2xl"
        />
      </div>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close ride chat" : "Open ride chat"}
        className={cn(
          "bg-primary text-primary-foreground hover:bg-primary/90 fixed right-4 bottom-20 z-60 flex size-14 items-center justify-center rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 sm:right-6 sm:bottom-6",
          open && "hidden sm:flex",
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "close" : "open"}
            initial={{ opacity: 0, rotate: -45 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 45 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-center"
          >
            {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
          </motion.span>
        </AnimatePresence>
      </button>
    </>
  );
}
