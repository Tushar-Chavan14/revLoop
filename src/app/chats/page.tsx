import { MessagesSquare } from "lucide-react";
import { EmptyState } from "@/components/design-system/state-panel";

export const metadata = {
  title: "Crew Chats",
};

// Desktop only — the right-hand pane before a chat is picked. On mobile the
// Crew Chats screen is just the list (see ChatsShell).
export default function ChatsIndexPage() {
  return (
    <EmptyState
      icon={MessagesSquare}
      title="Pick a crew to catch up"
      description="Choose a ride on the left to see what your crew is saying."
      className="flex-1 justify-center"
    />
  );
}
