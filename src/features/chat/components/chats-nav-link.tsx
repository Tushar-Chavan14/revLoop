"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useChatActivity } from "@/features/chat/components/chat-activity-provider";

/** Unread badge text — the number of ride chats with new messages, not messages. */
export function unreadChatsLabel(count: number) {
  return count > 9 ? "9+" : String(count);
}

/** Desktop navbar entry for Crew Chats, with a live count of chats that have new messages. */
export function ChatsNavLink() {
  const pathname = usePathname();
  const { unreadRideIds } = useChatActivity();
  const count = unreadRideIds.size;
  const active = pathname.startsWith("/chats");

  return (
    <Link
      href="/chats"
      aria-label={count > 0 ? `Chats, ${count} with new messages` : "Chats"}
      // Plain string, not cn(): tailwind-merge reads the custom `text-telemetry`
      // utility as a text color and drops it next to text-primary/muted.
      className={`text-telemetry relative text-[11px] transition-colors ${
        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      Chats
      {count > 0 && (
        <span className="bg-primary text-primary-foreground absolute -top-2.5 -right-4 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold tracking-normal tabular-nums">
          {unreadChatsLabel(count)}
        </span>
      )}
    </Link>
  );
}
