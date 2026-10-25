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

/**
 * One message in a ride chat thread — your own in ink, others on the inset
 * tone (the thread itself sits on a white sheet). The corner on the sender's
 * side is squared off, pointing at the avatar.
 */
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
          "max-w-[75%] rounded-md px-3 py-2 text-sm",
          isOwn ? "bg-foreground text-background rounded-br-none" : "bg-muted rounded-bl-none",
        )}
      >
        {!isOwn && senderName && <p className="text-xs font-semibold opacity-70">{senderName}</p>}
        <p className="text-pretty">{body}</p>
        <p className="mt-1 text-xs tabular-nums opacity-60">{timestamp}</p>
      </div>
    </div>
  );
}
