"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, UserRound, Users, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { removeRideMember, setAttendance } from "@/features/rides/actions/ride-request-actions";
import type { RideMemberWithProfile } from "@/services/ride-participation";

interface ParticipantsListProps {
  members: RideMemberWithProfile[];
  currentUserId: string | null;
  isOrganizer: boolean;
  /** True once the ride's departure time has passed — gates attendance marking and hides "Remove". */
  rideStarted: boolean;
}

export function ParticipantsList({
  members,
  currentUserId,
  isOrganizer,
  rideStarted,
}: ParticipantsListProps) {
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
              !rideStarted &&
              member.role !== "organizer" &&
              (isOrganizer || (currentUserId !== null && member.user_id === currentUserId))
            }
            canMarkAttendance={rideStarted && isOrganizer && member.role !== "organizer"}
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
  canMarkAttendance,
  isSelf,
}: {
  member: RideMemberWithProfile;
  canRemove: boolean;
  canMarkAttendance: boolean;
  isSelf: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [attendance, setAttendanceState] = useState(member.attendance_status);

  function updateAttendance(next: "attended" | "no_show") {
    setError(null);
    const nextStatus = attendance === next ? "pending" : next;
    setAttendanceState(nextStatus);
    startTransition(async () => {
      const result = await setAttendance(member.ride_id, member.user_id, nextStatus);
      if (result?.error) {
        setError(result.error);
        setAttendanceState(member.attendance_status);
      }
    });
  }

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
        {member.profile?.username ? (
          <Link
            href={`/riders/${member.profile.username}`}
            className="truncate text-sm font-medium hover:underline"
          >
            {member.profile?.name ?? "Rider"}
          </Link>
        ) : (
          <span className="truncate text-sm font-medium">{member.profile?.name ?? "Rider"}</span>
        )}
        {member.role === "organizer" && <Badge variant="secondary">Organizer</Badge>}
        {!canMarkAttendance && attendance === "attended" && (
          <Badge variant="secondary">Attended</Badge>
        )}
        {!canMarkAttendance && attendance === "no_show" && (
          <Badge variant="destructive">No-show</Badge>
        )}
        {error && <p className="text-destructive text-xs">{error}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {canMarkAttendance && (
          <>
            <Button
              type="button"
              variant={attendance === "attended" ? "default" : "outline"}
              size="sm"
              disabled={isPending}
              onClick={() => updateAttendance("attended")}
              aria-pressed={attendance === "attended"}
            >
              <Check className="size-3.5" />
              Attended
            </Button>
            <Button
              type="button"
              variant={attendance === "no_show" ? "destructive" : "outline"}
              size="sm"
              disabled={isPending}
              onClick={() => updateAttendance("no_show")}
              aria-pressed={attendance === "no_show"}
            >
              <X className="size-3.5" />
              No-show
            </Button>
          </>
        )}
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
    </div>
  );
}
