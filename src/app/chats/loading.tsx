import { RouteLoader } from "@/components/design-system/route-loader";

// Switching between crew chats keeps the chat list (from the layout) on
// screen and only swaps the conversation pane for the bike.
export default function Loading() {
  return <RouteLoader message="Catching up with the crew…" className="min-h-80" />;
}
