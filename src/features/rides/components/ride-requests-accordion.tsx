"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { UserRound } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { respondToJoinRequest } from "@/features/rides/actions/ride-request-actions";
import type { RideRequestWithRequester } from "@/services/ride-participation";
import type { RideWithOrganizer } from "@/services/rides";

interface RideRequestsAccordionProps {
  rides: RideWithOrganizer[];
  requests: RideRequestWithRequester[];
}

export function RideRequestsAccordion({ rides, requests }: RideRequestsAccordionProps) {
  const pendingByRide = new Map<string, RideRequestWithRequester[]>();
  for (const request of requests) {
    if (request.status !== "pending") {
      continue;
    }
    const list = pendingByRide.get(request.ride_id) ?? [];
    list.push(request);
    pendingByRide.set(request.ride_id, list);
  }

  const entries = rides
    .filter((ride) => ride.id && pendingByRide.has(ride.id))
    .map((ride) => ({ ride, requests: pendingByRide.get(ride.id as string) ?? [] }));

  return (
    <Card className="border-border border">
      <CardHeader>
        <CardTitle>Join Requests</CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-muted-foreground text-sm">No pending requests right now.</p>
        ) : (
          <Accordion
            key={entries.map((entry) => entry.ride.id).join(",")}
            multiple
            defaultValue={entries.map((entry) => entry.ride.id ?? "")}
          >
            {entries.map(({ ride, requests: rideRequests }) => {
              const isRideFull = ride.seats_available !== null && ride.seats_available <= 0;
              return (
                <AccordionItem key={ride.id} value={ride.id ?? ""}>
                  <AccordionTrigger>
                    <span className="flex items-center gap-2">
                      {ride.title}
                      <Badge>{rideRequests.length}</Badge>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-4">
                    {rideRequests.map((request) => (
                      <RequestRow key={request.id} request={request} isRideFull={isRideFull} />
                    ))}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
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
          {request.requester?.username ? (
            <Link
              href={`/riders/${request.requester.username}`}
              className="truncate text-sm font-medium hover:underline"
            >
              {request.requester.name ?? "Rider"}
            </Link>
          ) : (
            <span className="truncate text-sm font-medium">
              {request.requester?.name ?? "Rider"}
            </span>
          )}
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
