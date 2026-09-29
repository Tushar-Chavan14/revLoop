import { redirect } from "next/navigation";

// Ride chats live on the Crew Chats screen (/chats) — this route only exists
// so older links/bookmarks and the "Recent messages" list on the dashboard
// still land in the right chat.
type RideChatPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RideChatPage({ params }: RideChatPageProps) {
  const { id } = await params;
  redirect(`/chats/${id}`);
}
