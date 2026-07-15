"use client";

import { useState, useTransition } from "react";
import { UserRound, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { respondToJoinRequest } from "@/features/rides/actions/ride-request-actions";
import type { RideRequestWithRequester } from "@/services/ride-participation";

interface ManageRequestsPanelProps {
  requests: RideRequestWithRequester[];
  isRideFull: boolean;
}

export function ManageRequestsPanel({ requests, isRideFull }: ManageRequestsPanelProps) {
  const pending = requests.filter((request) => request.status === "pending");
  const resolved = requests.filter((request) => request.status !== "pending");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="text-primary size-4" />
          <CardTitle>Join requests {pending.length > 0 && `(${pending.length})`}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {pending.length === 0 && (
          <p className="text-muted-foreground text-sm">No pending requests.</p>
        )}
        {pending.map((request) => (
          <RequestRow key={request.id} request={request} isRideFull={isRideFull} />
        ))}

        {resolved.length > 0 && (
          <div className="flex flex-col gap-2 border-t pt-3">
            {resolved.map((request) => (
              <div key={request.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="text-muted-foreground truncate">
                  {request.requester?.name ?? "Rider"}
                </span>
                <Badge variant="outline" className="text-muted-foreground capitalize">
                  {request.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RequestRow({
  request,
  isRideFull,
}: {
  request: RideRequestWithRequester;
  isRideFull: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function respond(action: "accept" | "reject") {
    setError(null);
    startTransition(async () => {
      const result = await respondToJoinRequest(request.id, action);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar size="sm">
            <AvatarImage
              src={request.requester?.profile_image_url ?? undefined}
              alt={request.requester?.name ?? "Rider"}
            />
            <AvatarFallback>
              <UserRound className="size-3.5" />
            </AvatarFallback>
          </Avatar>
          <span className="truncate text-sm font-medium">{request.requester?.name ?? "Rider"}</span>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() => respond("reject")}
          >
            Decline
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isPending || isRideFull}
            onClick={() => respond("accept")}
          >
            Accept
          </Button>
        </div>
      </div>
      {request.message && (
        <p className="text-muted-foreground bg-muted rounded-md px-2.5 py-1.5 text-xs">
          {request.message}
        </p>
      )}
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
