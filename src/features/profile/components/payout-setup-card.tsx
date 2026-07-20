"use client";

import { useState, useTransition } from "react";
import { CircleCheck, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { savePayoutDetails } from "@/features/profile/actions/payout-actions";
import type { OrganizerPayoutDetails } from "@/services/organizer-payout";

interface PayoutSetupCardProps {
  payoutDetails: OrganizerPayoutDetails | null;
}

export function PayoutSetupCard({ payoutDetails }: PayoutSetupCardProps) {
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(!payoutDetails);
  const [error, setError] = useState<string | null>(null);
  const [payoutMethod, setPayoutMethod] = useState(payoutDetails?.payout_method ?? "upi");

  function handleSave(formData: FormData) {
    setError(null);
    formData.set("payoutMethod", payoutMethod);
    startTransition(async () => {
      const result = await savePayoutDetails(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setEditing(false);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Landmark className="text-primary size-4" />
          <CardTitle>Payouts for Organized Rides</CardTitle>
        </div>
        <CardDescription>
          Required before you can create a paid, hosted ride. Riders pay through Razorpay; the
          platform settles your share (minus a 3% fee) to these details manually.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {!editing && payoutDetails && (
          <>
            <p className="flex items-center gap-2 text-sm font-medium">
              <CircleCheck className="text-primary size-4" />
              {payoutDetails.payout_method === "upi"
                ? `UPI: ${payoutDetails.upi_id}`
                : `Bank: ${payoutDetails.bank_account_name} · ${payoutDetails.bank_account_number}`}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="self-start"
              onClick={() => setEditing(true)}
            >
              Edit
            </Button>
          </>
        )}

        {editing && (
          <form action={handleSave} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Payout method</Label>
              <ToggleGroup
                variant="outline"
                spacing={0}
                value={[payoutMethod]}
                onValueChange={(value) => {
                  const next = value[value.length - 1];
                  if (next) setPayoutMethod(next as "upi" | "bank");
                }}
              >
                <ToggleGroupItem value="upi">UPI</ToggleGroupItem>
                <ToggleGroupItem value="bank">Bank account</ToggleGroupItem>
              </ToggleGroup>
            </div>

            {payoutMethod === "upi" ? (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="upiId">UPI ID</Label>
                <Input
                  id="upiId"
                  name="upiId"
                  placeholder="yourname@upi"
                  defaultValue={payoutDetails?.upi_id ?? ""}
                  required
                />
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="bankAccountName">Account holder name</Label>
                  <Input
                    id="bankAccountName"
                    name="bankAccountName"
                    defaultValue={payoutDetails?.bank_account_name ?? ""}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="bankAccountNumber">Account number</Label>
                  <Input
                    id="bankAccountNumber"
                    name="bankAccountNumber"
                    defaultValue={payoutDetails?.bank_account_number ?? ""}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="bankIfsc">IFSC code</Label>
                  <Input
                    id="bankIfsc"
                    name="bankIfsc"
                    defaultValue={payoutDetails?.bank_ifsc ?? ""}
                    required
                  />
                </div>
              </>
            )}

            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={isPending}>
                {isPending ? "Saving..." : "Save"}
              </Button>
              {payoutDetails && (
                <Button type="button" variant="outline" size="sm" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        )}

        {error && <p className="text-destructive text-sm">{error}</p>}
      </CardContent>
    </Card>
  );
}
