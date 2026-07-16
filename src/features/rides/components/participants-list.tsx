"use client";

import { useState, useTransition } from "react";
import { UserRound, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { removeRideMember } from "@/features/rides/actions/ride-request-actions";
import type { RideMemberWithProfile } from "@/services/ride-participation";

interface ParticipantsListProps {
  members: RideMemberWithProfile[];
  currentUserId: string | null;
  isOrganizer: boolean;
}

export function ParticipantsList({ members, currentUserId, isOrganizer }: ParticipantsListProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="text-primary size-4" />
          <CardTitle>Riders ({members.length})</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {members.map((member) => (
          <ParticipantRow
            key={member.id}
            member={member}
            canRemove={
              member.role !== "organizer" &&
              (isOrganizer || (currentUserId !== null && member.user_id === currentUserId))
            }
            isSelf={currentUserId !== null && member.user_id === currentUserId}
          />
        ))}
      </CardContent>
    </Card>
  );
}

function ParticipantRow({
  member,
  canRemove,
  isSelf,
}: {
  member: RideMemberWithProfile;
  canRemove: boolean;
  isSelf: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <Avatar size="sm">
          <AvatarImage
            src={member.profile?.profile_image_url ?? undefined}
            alt={member.profile?.name ?? "Rider"}
          />
          <AvatarFallback>
            <UserRound className="size-3.5" />
          </AvatarFallback>
        </Avatar>
        <span className="truncate text-sm font-medium">{member.profile?.name ?? "Rider"}</span>
        {member.role === "organizer" && <Badge variant="secondary">Organizer</Badge>}
        {error && <p className="text-destructive text-xs">{error}</p>}
      </div>
      {canRemove && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isPending}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              const result = await removeRideMember(member.ride_id, member.user_id);
              if (result?.error) {
                setError(result.error);
              }
            });
          }}
        >
          {isPending ? "..." : isSelf ? "Leave" : "Remove"}
        </Button>
      )}
    </div>
  );
}
