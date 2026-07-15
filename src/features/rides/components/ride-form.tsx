"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useFormik } from "formik";
import { Bike, Calendar, ImageIcon, MapPin, Settings2 } from "lucide-react";
import { LocationAutocomplete } from "@/components/location-autocomplete";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { RIDE_TYPE_ICONS, RIDE_TYPES } from "@/constants/ride-type";
import { SPEED_LEVELS } from "@/constants/speed-level";
import { RIDER_LEVELS } from "@/constants/rider-level";
import { CoverImageUpload } from "@/features/rides/components/cover-image-upload";
import { RideMap, type ActiveMarker } from "@/features/rides/components/ride-map";
import { rideSchema, type RideFormValues } from "@/features/rides/schema";
import { reverseGeocode } from "@/utils/reverse-geocode";

interface RideFormProps {
  mode: "create" | "edit";
  initialValues: RideFormValues;
  initialCoverImageUrl?: string | null;
  action: (formData: FormData) => Promise<{ error?: string } | void>;
}

export function RideForm({ mode, initialValues, initialCoverImageUrl, action }: RideFormProps) {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    initialCoverImageUrl ?? null,
  );
  const [activeMarker, setActiveMarker] = useState<ActiveMarker>("meeting");

  const formik = useFormik<RideFormValues>({
    initialValues,
    validationSchema: rideSchema,
    onSubmit: (values) => {
      setFormError(null);

      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.set(key, String(value));
        }
      });
      if (coverImageFile) {
        formData.set("coverImage", coverImageFile);
      }

      startTransition(async () => {
        const result = await action(formData);
        if (result?.error) {
          setFormError(result.error);
        }
      });
    },
  });

  const fieldError = (field: keyof RideFormValues) =>
    formik.touched[field] && formik.errors[field] ? String(formik.errors[field]) : undefined;

  const meetingLocation =
    formik.values.meetingLat !== null && formik.values.meetingLng !== null
      ? { lat: formik.values.meetingLat, lng: formik.values.meetingLng }
      : null;
  const destinationLocation =
    formik.values.destinationLat !== null && formik.values.destinationLng !== null
      ? { lat: formik.values.destinationLat, lng: formik.values.destinationLng }
      : null;

  // Map click/drag only gives coordinates — reverse-geocode so the text field
  // (and, for the meeting point, the derived city) don't go stale relative to
  // where the pin actually landed.
  const handleMeetingChange = (location: { lat: number; lng: number }) => {
    formik.setFieldValue("meetingLat", location.lat);
    formik.setFieldValue("meetingLng", location.lng);

    void reverseGeocode(location.lat, location.lng).then((result) => {
      if (!result) {
        return;
      }
      formik.setFieldValue("meetingPoint", result.name);
      formik.setFieldValue("city", result.city ?? result.name);
    });
  };

  const handleDestinationChange = (location: { lat: number; lng: number }) => {
    formik.setFieldValue("destinationLat", location.lat);
    formik.setFieldValue("destinationLng", location.lng);

    void reverseGeocode(location.lat, location.lng).then((result) => {
      if (!result) {
        return;
      }
      formik.setFieldValue("destination", result.name);
    });
  };

  return (
    <form onSubmit={formik.handleSubmit} noValidate className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ImageIcon className="text-primary size-4" />
            <CardTitle>Ride basics</CardTitle>
          </div>
          <CardDescription>What is this ride, and what does it look like?</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <CoverImageUpload
            name="coverImage"
            previewUrl={coverImagePreview}
            onFileSelect={(file, preview) => {
              setFormError(null);
              setCoverImageFile(file);
              setCoverImagePreview(preview);
            }}
            onError={setFormError}
          />
          <Field label="Title" htmlFor="title" error={fieldError("title")}>
            <Input
              id="title"
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </Field>
          <Field label="Description" htmlFor="description" error={fieldError("description")}>
            <Textarea
              id="description"
              name="description"
              rows={4}
              value={formik.values.description ?? ""}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="text-primary size-4" />
            <CardTitle>When</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Ride date" htmlFor="rideDate" error={fieldError("rideDate")}>
            <Input
              id="rideDate"
              name="rideDate"
              type="date"
              value={formik.values.rideDate}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </Field>
          <Field label="Departure time" htmlFor="departureTime" error={fieldError("departureTime")}>
            <Input
              id="departureTime"
              name="departureTime"
              type="time"
              value={formik.values.departureTime}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="text-primary size-4" />
            <CardTitle>Route</CardTitle>
          </div>
          <CardDescription>
            Search for a place, then fine-tune the exact pin on the map if needed.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Field label="Meeting point" htmlFor="meetingPoint" error={fieldError("meetingPoint")}>
            <LocationAutocomplete
              id="meetingPoint"
              name="meetingPoint"
              types="address"
              placeholder="e.g. CCD Hinjewadi, Pune"
              value={formik.values.meetingPoint}
              onChange={(value) => formik.setFieldValue("meetingPoint", value)}
              onBlur={() => formik.setFieldTouched("meetingPoint", true)}
              onSelectLocation={(location) => {
                formik.setFieldValue("meetingLat", location.lat);
                formik.setFieldValue("meetingLng", location.lng);
                formik.setFieldValue("city", location.city ?? location.name);
                setActiveMarker("destination");
              }}
            />
            {formik.values.city && (
              <p className="text-muted-foreground text-xs">
                City: <span className="text-foreground font-medium">{formik.values.city}</span>
              </p>
            )}
            {fieldError("city") && <p className="text-destructive text-sm">{fieldError("city")}</p>}
          </Field>
          <Field label="Destination" htmlFor="destination" error={fieldError("destination")}>
            <LocationAutocomplete
              id="destination"
              name="destination"
              types="address"
              placeholder="e.g. Lonavala Ghat Road"
              value={formik.values.destination}
              onChange={(value) => formik.setFieldValue("destination", value)}
              onBlur={() => formik.setFieldTouched("destination", true)}
              onSelectLocation={(location) => {
                formik.setFieldValue("destinationLat", location.lat);
                formik.setFieldValue("destinationLng", location.lng);
              }}
            />
          </Field>
          <Field
            label="Google Maps link (optional)"
            htmlFor="destinationMapUrl"
            error={fieldError("destinationMapUrl")}
          >
            <Input
              id="destinationMapUrl"
              name="destinationMapUrl"
              type="url"
              placeholder="https://maps.google.com/..."
              value={formik.values.destinationMapUrl ?? ""}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </Field>

          <div className="flex gap-2">
            <Button
              type="button"
              variant={activeMarker === "meeting" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveMarker("meeting")}
            >
              Placing: Meeting point
            </Button>
            <Button
              type="button"
              variant={activeMarker === "destination" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveMarker("destination")}
            >
              Placing: Destination
            </Button>
          </div>
          <p className="text-muted-foreground text-xs">
            Click or drag on the map to fine-tune whichever pin is selected above — the field and
            city above update to match.
          </p>
          <RideMap
            meeting={meetingLocation}
            destination={destinationLocation}
            activeMarker={activeMarker}
            onMeetingChange={handleMeetingChange}
            onDestinationChange={handleDestinationChange}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bike className="text-primary size-4" />
            <CardTitle>Ride details</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Maximum riders" htmlFor="maxRiders" error={fieldError("maxRiders")}>
            <Input
              id="maxRiders"
              name="maxRiders"
              type="number"
              min={1}
              max={50}
              value={formik.values.maxRiders}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </Field>
          <Field
            label="Ride type"
            htmlFor="rideType"
            error={fieldError("rideType")}
            className="sm:col-span-2"
          >
            <ToggleGroup
              variant="outline"
              spacing={0}
              value={formik.values.rideType ? [formik.values.rideType] : []}
              onValueChange={(value) => {
                const next = value[value.length - 1];
                if (!next) {
                  return;
                }
                formik.setFieldTouched("rideType", true, false);
                formik.setFieldValue("rideType", next);
              }}
              className="flex-wrap"
            >
              {RIDE_TYPES.map((type) => {
                const Icon = RIDE_TYPE_ICONS[type.value];
                return (
                  <ToggleGroupItem
                    key={type.value}
                    value={type.value}
                    id={`rideType-${type.value}`}
                  >
                    <Icon />
                    {type.label}
                  </ToggleGroupItem>
                );
              })}
            </ToggleGroup>
          </Field>
          <Field label="Speed" htmlFor="speed" error={fieldError("speed")}>
            <Select
              value={formik.values.speed}
              onValueChange={(value) => {
                formik.setFieldTouched("speed", true, false);
                formik.setFieldValue("speed", value);
              }}
            >
              <SelectTrigger id="speed" className="w-full">
                <SelectValue placeholder="Select speed" />
              </SelectTrigger>
              <SelectContent>
                {SPEED_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Difficulty" htmlFor="difficulty" error={fieldError("difficulty")}>
            <Select
              value={formik.values.difficulty}
              onValueChange={(value) => {
                formik.setFieldTouched("difficulty", true, false);
                formik.setFieldValue("difficulty", value);
              }}
            >
              <SelectTrigger id="difficulty" className="w-full">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                {RIDER_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field
            label="Estimated distance (km)"
            htmlFor="estimatedDistanceKm"
            error={fieldError("estimatedDistanceKm")}
          >
            <Input
              id="estimatedDistanceKm"
              name="estimatedDistanceKm"
              type="number"
              min={0}
              step="0.1"
              value={formik.values.estimatedDistanceKm ?? ""}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </Field>
          <Field
            label="Estimated duration (minutes)"
            htmlFor="estimatedDurationMinutes"
            error={fieldError("estimatedDurationMinutes")}
          >
            <Input
              id="estimatedDurationMinutes"
              name="estimatedDurationMinutes"
              type="number"
              min={0}
              value={formik.values.estimatedDurationMinutes ?? ""}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings2 className="text-primary size-4" />
            <CardTitle>Ride rules</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <ToggleField
            label="Breakfast stop"
            checked={formik.values.breakfastStop}
            onCheckedChange={(checked) => formik.setFieldValue("breakfastStop", checked)}
          />
          <ToggleField
            label="Fuel stop"
            checked={formik.values.fuelStop}
            onCheckedChange={(checked) => formik.setFieldValue("fuelStop", checked)}
          />
          <ToggleField
            label="Helmet required"
            checked={formik.values.helmetRequired}
            onCheckedChange={(checked) => formik.setFieldValue("helmetRequired", checked)}
          />
          <ToggleField
            label="Pillion allowed"
            checked={formik.values.pillionAllowed}
            onCheckedChange={(checked) => formik.setFieldValue("pillionAllowed", checked)}
          />
        </CardContent>
      </Card>

      {formError && <p className="text-destructive text-sm">{formError}</p>}

      <Button type="submit" disabled={isPending} size="lg" className="self-start">
        {isPending ? "Saving..." : mode === "create" ? "Create ride" : "Save changes"}
      </Button>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}

function ToggleField({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <Label>{label}</Label>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
