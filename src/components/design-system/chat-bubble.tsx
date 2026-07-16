import { UserRound } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ChatBubbleProps {
  body: string;
  timestamp: string;
  isOwn?: boolean;
  senderName?: string;
  senderImageUrl?: string | null;
}

/** One message in a ride chat thread — organizer-orange for your own messages, muted for others. */
export function ChatBubble({
  body,
  timestamp,
  isOwn = false,
  senderName,
  senderImageUrl,
}: ChatBubbleProps) {
  return (
    <div className={cn("flex items-end gap-2", isOwn && "flex-row-reverse")}>
      <Avatar size="sm">
        <AvatarImage src={senderImageUrl ?? undefined} alt={senderName ?? "Rider"} />
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
        {!isOwn && senderName && <p className="text-xs font-medium opacity-70">{senderName}</p>}
        <p className="text-pretty">{body}</p>
        <p className="mt-1 text-[10px] opacity-60">{timestamp}</p>
      </div>
    </div>
  );
}
