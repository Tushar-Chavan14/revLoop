import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeading } from "@/components/design-system/page-heading";
import { EmptyState } from "@/components/design-system/state-panel";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { ChatsShell } from "@/features/chat/components/chats-shell";
import { RideAlertsCard } from "@/features/chat/components/ride-alerts-card";
import { RideChatList } from "@/features/chat/components/ride-chat-list";
import { getAuthUser } from "@/services/profiles";
import { getMyRideChats } from "@/services/ride-chat";

export default async function ChatsLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }

  const chats = await getMyRideChats();

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      {chats.length === 0 ? (
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
          <PageHeading eyebrow="Crew Chats" title="Your ride crews" />
          <EmptyState
            title="No Crew Chats Yet"
            description="Claim your seat on a ride and its crew chat lands here — plan the meetup, share the route, sort the fuel stops."
            action={
              <Button nativeButton={false} render={<Link href="/rides">Discover Rides</Link>} />
            }
          />
        </div>
      ) : (
        <ChatsShell
          heading={
            <PageHeading
              eyebrow="Crew Chats"
              title="Your ride crews"
              description="Every ride you're part of has its own chat."
            />
          }
          list={
            <>
              <RideAlertsCard />
              <RideChatList initialChats={chats} currentUserId={user.id} />
            </>
          }
        >
          {children}
        </ChatsShell>
      )}
    </div>
  );
}
