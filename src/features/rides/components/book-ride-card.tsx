"use client";

import { useState, useTransition } from "react";
import Script from "next/script";
import { IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FullscreenLoader } from "@/components/design-system/fullscreen-loader";
import {
  createBookingOrder,
  getBookingStatus,
} from "@/features/rides/actions/ride-booking-actions";
import {
  BookingFailureAnimation,
  BookingSuccessAnimation,
} from "@/features/rides/components/booking-status-animation";
import type { RideBooking } from "@/services/ride-participation";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

interface BookRideCardProps {
  rideId: string;
  myBooking: RideBooking | null;
  isRideFull: boolean;
  rideFee: number;
  currency: string;
  bookingClosed: boolean;
  organizerReady: boolean;
}

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 20;

export function BookRideCard({
  rideId,
  myBooking,
  isRideFull,
  rideFee,
  currency,
  bookingClosed,
  organizerReady,
}: BookRideCardProps) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [status, setStatus] = useState(myBooking?.status ?? null);
  const [error, setError] = useState<string | null>(null);

  function pollForConfirmation(bookingId: string, attempt = 0) {
    if (attempt >= MAX_POLLS) {
      setConfirming(false);
      return;
    }
    setTimeout(async () => {
      const next = await getBookingStatus(bookingId);
      if (next === "paid") {
        setStatus("paid");
        setConfirming(false);
        return;
      }
      if (next === "failed") {
        setStatus("failed");
        setConfirming(false);
        return;
      }
      pollForConfirmation(bookingId, attempt + 1);
    }, POLL_INTERVAL_MS);
  }

  function handleReserve() {
    setError(null);
    startTransition(async () => {
      const result = await createBookingOrder(rideId);
      if ("error" in result) {
        setError(result.error);
        return;
      }

      const razorpay = new window.Razorpay({
        key: result.keyId,
        amount: result.amount,
        currency: result.currency,
        order_id: result.orderId,
        name: "RevLoop",
        description: "Ride booking",
        handler: () => {
          setConfirming(true);
          pollForConfirmation(result.bookingId);
        },
      });
      razorpay.open();
    });
  }

  return (
    <>
      {confirming && <FullscreenLoader message="Confirming your booking..." />}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <IndianRupee className="text-primary size-4" />
            <CardTitle>Reserve your spot</CardTitle>
          </div>
          <CardDescription>
            {status === "paid"
              ? "You're booked for this ride."
              : "Pay the organizer directly through Razorpay to reserve a seat."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {status === "paid" ? (
            <BookingSuccessAnimation />
          ) : !organizerReady ? (
            <p className="text-muted-foreground text-sm">
              This organizer hasn&apos;t completed payout setup yet.
            </p>
          ) : isRideFull ? (
            <p className="text-muted-foreground text-sm">This ride is full.</p>
          ) : bookingClosed ? (
            <p className="text-muted-foreground text-sm">
              The booking deadline for this ride has passed.
            </p>
          ) : (
            <>
              {status === "failed" && <BookingFailureAnimation />}
              <Button
                type="button"
                disabled={isPending || confirming}
                className="self-start"
                onClick={handleReserve}
              >
                {isPending
                  ? "Starting payment..."
                  : status === "failed"
                    ? "Try again"
                    : status === "created"
                      ? "Resume payment"
                      : `Reserve spot — ${currency === "INR" ? "₹" : `${currency} `}${rideFee}`}
              </Button>
            </>
          )}
          {error && <p className="text-destructive text-sm">{error}</p>}
        </CardContent>
      </Card>
    </>
  );
}
