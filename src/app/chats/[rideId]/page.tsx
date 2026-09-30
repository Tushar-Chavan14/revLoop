import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { RideChat } from "@/features/rides/components/ride-chat";
import { getAuthUser } from "@/services/profiles";
import { getRideMessages } from "@/services/ride-chat";
import { getRideMembers } from "@/services/ride-participation";
import { getRideById } from "@/services/rides";

type RideChatScreenProps = {
  params: Promise<{ rideId: string }>;
};

export async function generateMetadata({ params }: RideChatScreenProps): Promise<Metadata> {
  const { rideId } = await params;
  const ride = await getRideById(rideId);
  return { title: ride?.title ? `${ride.title} · Crew Chat` : "Crew Chat" };
}

export default async function RideChatScreen({ params }: RideChatScreenProps) {
  const { rideId } = await params;
  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }

  // RLS already hides messages from non-members, so all three can go out at
  // once; the membership check below still decides what gets rendered.
  const [ride, members, messages] = await Promise.all([
    getRideById(rideId),
    getRideMembers(rideId),
    getRideMessages(rideId),
  ]);
  if (!ride?.id) {
    notFound();
  }

  // Only the crew can read the chat — anyone else lands on the ride itself.
  if (!members.some((member) => member.user_id === user.id)) {
    redirect(`/rides/${rideId}`);
  }

  const profiles = members.filter((member) => member.profile).map((member) => member.profile!);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <Link
        href="/chats"
        className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-1.5 text-sm lg:hidden"
      >
        <ArrowLeft className="size-4" aria-hidden />
        All Crew Chats
      </Link>
      <RideChat
        key={rideId}
        rideId={rideId}
        currentUserId={user.id}
        initialMessages={messages}
        senderProfiles={Object.fromEntries(profiles.map((profile) => [profile.id, profile]))}
        ride={{
          title: ride.title,
          destination: ride.destination,
          coverImageUrl: ride.cover_image_url,
          meetingPoint: ride.meeting_point,
        }}
        participants={profiles}
        rideHref={`/rides/${rideId}`}
        className="h-[calc(100svh-12rem)] sm:h-[calc(100svh-11rem)] lg:h-[calc(100svh-17rem)] lg:min-h-112"
      />
    </div>
  );
}
