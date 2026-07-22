"use client";

import { useState, useTransition } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  cancelJoinRequest,
  requestToJoinRide,
} from "@/features/rides/actions/ride-request-actions";
import type { RideRequest } from "@/services/ride-participation";

interface JoinRequestCardProps {
  rideId: string;
  myRequest: RideRequest | null;
  isRideFull: boolean;
}

export function JoinRequestCard({ rideId, myRequest, isRideFull }: JoinRequestCardProps) {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (myRequest?.status === "pending") {
    return (
      <Card>
        <CardContent className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Your Request Is Pending</p>
            <p className="text-muted-foreground text-xs">
              The organizer hasn&apos;t responded yet.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => {
              setError(null);
              startTransition(async () => {
                const result = await cancelJoinRequest(myRequest.id);
                if (result?.error) {
                  setError(result.error);
                }
              });
            }}
          >
            {isPending ? "Cancelling..." : "Cancel Request"}
          </Button>
          {error && <p className="text-destructive text-sm">{error}</p>}
        </CardContent>
      </Card>
    );
  }

  const previousOutcome =
    myRequest?.status === "rejected"
      ? "Your last request to join this ride was declined. You can send another one."
      : myRequest?.status === "cancelled"
        ? "You cancelled your last request to join this ride. You can send another one."
        : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <UserPlus className="text-primary size-4" />
          <CardTitle>Want To Ride Along?</CardTitle>
        </div>
        <CardDescription>
          {previousOutcome ?? "Send a request and the organizer will review it."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {isRideFull ? (
          <p className="text-muted-foreground text-sm">This ride is full.</p>
        ) : (
          <>
            <Textarea
              placeholder="Add a message for the organizer (optional)"
              rows={2}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
            <p className="text-muted-foreground text-xs">
              The organizer doesn&apos;t cover your expenses. Fuel, food, accommodation, and any
              other costs on the ride are your own responsibility.
            </p>
            <Button
              type="button"
              disabled={isPending}
              className="self-start"
              onClick={() => {
                setError(null);
                startTransition(async () => {
                  const result = await requestToJoinRide(rideId, message);
                  if (result?.error) {
                    setError(result.error);
                  }
                });
              }}
            >
              {isPending ? "Sending..." : "Request To Join"}
            </Button>
            {error && <p className="text-destructive text-sm">{error}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
}
