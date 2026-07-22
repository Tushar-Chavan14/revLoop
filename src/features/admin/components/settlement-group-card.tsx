"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { markBookingsSettled } from "@/features/admin/actions/settlement-actions";
import type { OrganizerSettlementGroup } from "@/services/settlements";

export function SettlementGroupCard({ group }: { group: OrganizerSettlementGroup }) {
  const [isPending, startTransition] = useTransition();
  const [settledIds, setSettledIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const remaining = group.bookings.filter((b) => !settledIds.has(b.id));
  const remainingTotal = remaining.reduce((sum, b) => sum + b.organizer_amount, 0);

  function settle(bookingIds: string[]) {
    setError(null);
    startTransition(async () => {
      const result = await markBookingsSettled(bookingIds);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setSettledIds((prev) => new Set([...prev, ...bookingIds]));
    });
  }

  if (remaining.length === 0) {
    return null;
  }

  const payout = group.payoutDetails;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{group.organizerName}</CardTitle>
          <Button
            type="button"
            size="sm"
            disabled={isPending}
            onClick={() => settle(remaining.map((b) => b.id))}
          >
            Mark All Settled — ₹{remainingTotal.toFixed(2)}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {payout ? (
          <p className="text-muted-foreground text-sm">
            {payout.payout_method === "upi"
              ? `UPI: ${payout.upi_id}`
              : `Bank: ${payout.bank_account_name} · ${payout.bank_account_number} · ${payout.bank_ifsc}`}
          </p>
        ) : (
          <p className="text-destructive text-sm">No payout details on file.</p>
        )}

        <div className="flex flex-col gap-2">
          {remaining.map((booking) => (
            <div
              key={booking.id}
              className="flex items-center justify-between gap-3 border-b pb-2 text-sm last:border-b-0 last:pb-0"
            >
              <div>
                <p className="font-medium">{booking.rideTitle}</p>
                <p className="text-muted-foreground text-xs">
                  {booking.riderName} · ₹{booking.organizer_amount.toFixed(2)} owed (of ₹
                  {booking.amount.toFixed(2)}, {booking.currency}) ·{" "}
                  {booking.paid_at ? format(new Date(booking.paid_at), "MMM d, yyyy") : ""}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() => settle([booking.id])}
              >
                Mark Settled
              </Button>
            </div>
          ))}
        </div>

        {error && <p className="text-destructive text-sm">{error}</p>}
      </CardContent>
    </Card>
  );
}
