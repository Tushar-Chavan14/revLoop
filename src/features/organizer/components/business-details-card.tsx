"use client";

import { useState, useTransition } from "react";
import { Building2 } from "lucide-react";
import { LocationAutocomplete } from "@/components/location-autocomplete";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveOrganizerDetails } from "@/features/organizer/actions/organizer-details-actions";
import type { OrganizerDetails } from "@/services/organizer-details";

export function BusinessDetailsCard({ details }: { details: OrganizerDetails | null }) {
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(!details);
  const [error, setError] = useState<string | null>(null);
  const [destination, setDestination] = useState(details?.primary_destination ?? "");

  function handleSave(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await saveOrganizerDetails(formData);
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
          <Building2 className="text-muted-foreground size-4" />
          <CardTitle>Business Details</CardTitle>
        </div>
        <CardDescription>Shown on your public profile and to riders once they join.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {!editing && details && (
          <>
            <div className="flex flex-col gap-1 text-sm">
              <p className="font-medium">{details.business_name}</p>
              <p className="text-muted-foreground">
                {details.events_organised_count} events organised · {details.primary_destination}
              </p>
              <p className="text-muted-foreground">
                {details.business_email} · {details.business_phone}
              </p>
              {details.instagram_handle && (
                <p className="text-muted-foreground">@{details.instagram_handle}</p>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="self-start"
              onClick={() => {
                setDestination(details.primary_destination);
                setEditing(true);
              }}
            >
              Edit
            </Button>
          </>
        )}

        {editing && (
          <form action={handleSave} className="flex flex-col gap-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  name="businessName"
                  defaultValue={details?.business_name ?? ""}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="primaryDestination">Signature Destination</Label>
                <LocationAutocomplete
                  id="primaryDestination"
                  name="primaryDestination"
                  types="place"
                  placeholder="e.g. Leh, Ladakh"
                  value={destination}
                  onChange={setDestination}
                  onSelectLocation={(location) => {
                    const combined = [location.city ?? location.name, location.country]
                      .filter(Boolean)
                      .join(", ");
                    setDestination(combined);
                  }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="businessEmail">Business Email</Label>
                <Input
                  id="businessEmail"
                  name="businessEmail"
                  type="email"
                  defaultValue={details?.business_email ?? ""}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="businessPhone">Business Phone</Label>
                <Input
                  id="businessPhone"
                  name="businessPhone"
                  type="tel"
                  defaultValue={details?.business_phone ?? ""}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="eventsOrganisedCount">Events Organised</Label>
                <Input
                  id="eventsOrganisedCount"
                  name="eventsOrganisedCount"
                  type="number"
                  min={0}
                  defaultValue={details?.events_organised_count ?? 0}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="instagramHandle">Instagram</Label>
                <Input
                  id="instagramHandle"
                  name="instagramHandle"
                  defaultValue={details?.instagram_handle ?? ""}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={isPending}>
                {isPending ? "Saving..." : "Save"}
              </Button>
              {details && (
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
