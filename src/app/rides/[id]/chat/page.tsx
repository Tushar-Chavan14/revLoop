import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { RideChat } from "@/features/rides/components/ride-chat";
import { getAuthUser } from "@/services/profiles";
import { getRideMembers } from "@/services/ride-participation";
import { getRideMessages } from "@/services/ride-chat";
import { getRideById } from "@/services/rides";

export const metadata = {
  title: "Ride chat",
};

type RideChatPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RideChatPage({ params }: RideChatPageProps) {
  const { id } = await params;

  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }

  const ride = await getRideById(id);
  if (!ride) {
    notFound();
  }

  const members = await getRideMembers(id);
  const isMember = members.some((member) => member.user_id === user.id);
  if (!isMember) {
    redirect(`/rides/${id}`);
  }

  const messages = await getRideMessages(id);
  const senderProfiles = Object.fromEntries(
    members.filter((member) => member.profile).map((member) => [member.user_id, member.profile!]),
  );

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-8">
        <Link
          href={`/rides/${id}`}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm"
        >
          <ArrowLeft className="size-4" />
          {ride.title}
        </Link>
        <RideChat
          rideId={id}
          currentUserId={user.id}
          initialMessages={messages}
          senderProfiles={senderProfiles}
          ride={{
            title: ride.title,
            destination: ride.destination,
            coverImageUrl: ride.cover_image_url,
            meetingPoint: ride.meeting_point,
          }}
          participants={members.filter((member) => member.profile).map((member) => member.profile!)}
        />
      </div>
    </div>
  );
}
