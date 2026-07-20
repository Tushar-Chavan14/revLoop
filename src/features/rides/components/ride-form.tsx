"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useFormik } from "formik";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  Bike,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  ImageIcon,
  IndianRupee,
  ListChecks,
  MapPin,
  Plus,
  Settings2,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { LocationAutocomplete } from "@/components/location-autocomplete";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { StepIndicator } from "@/components/design-system/step-indicator";
import { RIDE_TYPE_ICONS, RIDE_TYPES } from "@/constants/ride-type";
import { SPEED_LEVELS } from "@/constants/speed-level";
import { RIDER_LEVELS } from "@/constants/rider-level";
import { RIDE_INCLUSIONS } from "@/constants/ride-inclusions";
import { CoverImageUpload } from "@/features/rides/components/cover-image-upload";
import { RideMap, type ActiveMarker } from "@/features/rides/components/ride-map";
import { rideSchema, type RideFormValues } from "@/features/rides/schema";
import { reverseGeocode } from "@/utils/reverse-geocode";
import { fadeInUp } from "@/lib/motion";

interface RideFormProps {
  mode: "create" | "edit";
  initialValues: RideFormValues;
  initialCoverImageUrl?: string | null;
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  hasPayoutDetails?: boolean;
}

type StepDef = { label: string; fields: (keyof RideFormValues)[] };

const BASE_STEPS: StepDef[] = [
  { label: "Ride type", fields: ["pricingModel"] },
  { label: "Basics", fields: ["title", "description"] },
  {
    label: "When & where",
    fields: ["rideDate", "departureTime", "meetingPoint", "destination", "city"],
  },
  { label: "Details", fields: ["maxRiders", "rideType", "speed", "difficulty"] },
];

const ORGANIZED_STEPS: StepDef[] = [
  { label: "Pricing & booking", fields: ["rideFee", "bookingDeadline", "minimumRiders"] },
  { label: "Inclusions", fields: [] },
  { label: "Itinerary", fields: [] },
];

const FINAL_STEP: StepDef = { label: "Rules & review", fields: [] };

function getSteps(pricingModel: string): StepDef[] {
  return pricingModel === "organized"
    ? [...BASE_STEPS, ...ORGANIZED_STEPS, FINAL_STEP]
    : [...BASE_STEPS, FINAL_STEP];
}

export function RideForm({
  mode,
  initialValues,
  initialCoverImageUrl,
  action,
  hasPayoutDetails,
}: RideFormProps) {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    initialCoverImageUrl ?? null,
  );
  const [activeMarker, setActiveMarker] = useState<ActiveMarker>("meeting");
  const [step, setStep] = useState(0);
  const [exclusionDraft, setExclusionDraft] = useState("");

  const formik = useFormik<RideFormValues>({
    initialValues,
    validationSchema: rideSchema,
    onSubmit: (values) => {
      setFormError(null);

      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (key === "inclusions" || key === "exclusions") {
          (value as string[] | undefined)?.forEach((item) => formData.append(key, item));
          return;
        }
        if (key === "itinerary") {
          formData.set("itinerary", JSON.stringify(value ?? []));
          return;
        }
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

  const steps = getSteps(formik.values.pricingModel);
  const currentStep = steps[step];
  const isLastStep = step === steps.length - 1;
  const isOrganized = formik.values.pricingModel === "organized";
  const canCreateOrganized = hasPayoutDetails ?? false;

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

  async function goToStep(next: number) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setStep(next);
  }

  async function handleNext() {
    const stepFields = currentStep.fields;
    if (stepFields.length === 0) {
      await goToStep(step + 1);
      return;
    }
    formik.setTouched(
      { ...formik.touched, ...Object.fromEntries(stepFields.map((field) => [field, true])) },
      false,
    );
    const errors = await formik.validateForm();
    const hasStepError = stepFields.some((field) => errors[field]);
    if (!hasStepError) {
      await goToStep(step + 1);
    }
  }

  function addItineraryDay() {
    const itinerary = formik.values.itinerary ?? [];
    formik.setFieldValue("itinerary", [...itinerary, { day: itinerary.length + 1, items: [] }]);
  }

  function removeItineraryDay(dayIndex: number) {
    const itinerary = (formik.values.itinerary ?? []).filter((_, i) => i !== dayIndex);
    formik.setFieldValue(
      "itinerary",
      itinerary.map((day, i) => ({ ...day, day: i + 1 })),
    );
  }

  function addItineraryItem(dayIndex: number) {
    const itinerary = [...(formik.values.itinerary ?? [])];
    itinerary[dayIndex] = { ...itinerary[dayIndex], items: [...itinerary[dayIndex].items, { label: "", time: "" }] };
    formik.setFieldValue("itinerary", itinerary);
  }

  function updateItineraryItem(
    dayIndex: number,
    itemIndex: number,
    field: "label" | "time",
    value: string,
  ) {
    const itinerary = [...(formik.values.itinerary ?? [])];
    const items = [...itinerary[dayIndex].items];
    items[itemIndex] = { ...items[itemIndex], [field]: value };
    itinerary[dayIndex] = { ...itinerary[dayIndex], items };
    formik.setFieldValue("itinerary", itinerary);
  }

  function removeItineraryItem(dayIndex: number, itemIndex: number) {
    const itinerary = [...(formik.values.itinerary ?? [])];
    itinerary[dayIndex] = {
      ...itinerary[dayIndex],
      items: itinerary[dayIndex].items.filter((_, i) => i !== itemIndex),
    };
    formik.setFieldValue("itinerary", itinerary);
  }

  function toggleInclusion(value: string, checked: boolean) {
    const inclusions = formik.values.inclusions ?? [];
    formik.setFieldValue(
      "inclusions",
      checked ? [...inclusions, value] : inclusions.filter((v) => v !== value),
    );
  }

  function addExclusion() {
    const trimmed = exclusionDraft.trim();
    if (!trimmed) return;
    const exclusions = formik.values.exclusions ?? [];
    if (!exclusions.includes(trimmed)) {
      formik.setFieldValue("exclusions", [...exclusions, trimmed]);
    }
    setExclusionDraft("");
  }

  function removeExclusion(value: string) {
    formik.setFieldValue(
      "exclusions",
      (formik.values.exclusions ?? []).filter((v) => v !== value),
    );
  }

  return (
    <form onSubmit={formik.handleSubmit} noValidate className="flex flex-col gap-8">
      <StepIndicator steps={steps.map((s) => s.label)} currentStep={step} />

      {currentStep.label === "Ride type" && (
        <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <IndianRupee className="text-primary size-4" />
                <CardTitle>Ride type</CardTitle>
              </div>
              <CardDescription>
                Community rides are free to join. Organized rides are paid — riders reserve a
                seat by paying you directly through the app.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <ToggleGroup
                variant="outline"
                spacing={0}
                value={[formik.values.pricingModel]}
                onValueChange={(value) => {
                  const next = value[value.length - 1];
                  if (!next) return;
                  formik.setFieldValue("pricingModel", next);
                }}
                className="flex-wrap"
              >
                <ToggleGroupItem value="community">Community ride</ToggleGroupItem>
                <ToggleGroupItem value="organized" disabled={!canCreateOrganized}>
                  Organized ride
                </ToggleGroupItem>
              </ToggleGroup>
              {!canCreateOrganized && (
                <p className="text-muted-foreground text-xs">
                  Complete payout setup in your profile before you can create an Organized Ride.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {currentStep.label === "Basics" && (
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
      )}

      {currentStep.label === "When & where" && (
        <>
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
              <Field
                label="Departure time"
                htmlFor="departureTime"
                error={fieldError("departureTime")}
              >
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
              <Field
                label="Meeting point"
                htmlFor="meetingPoint"
                error={fieldError("meetingPoint")}
              >
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
                {fieldError("city") && (
                  <p className="text-destructive text-sm">{fieldError("city")}</p>
                )}
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
                Click or drag on the map to fine-tune whichever pin is selected above — the field
                and city above update to match.
              </p>
              <RideMap
                meeting={meetingLocation}
                destination={destinationLocation}
                activeMarker={activeMarker}
                onMeetingChange={handleMeetingChange}
                onDestinationChange={handleDestinationChange}
                className="h-96"
              />
            </CardContent>
          </Card>
        </>
      )}

      {currentStep.label === "Details" && (
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
                max={isOrganized ? 150 : 20}
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
              label="Estimated duration"
              htmlFor="estimatedDurationDays"
              error={fieldError("estimatedDurationDays") ?? fieldError("estimatedDurationHours")}
            >
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="estimatedDurationDays"
                    name="estimatedDurationDays"
                    type="number"
                    min={1}
                    max={isOrganized ? 21 : 4}
                    placeholder="1"
                    value={formik.values.estimatedDurationDays ?? ""}
                    onChange={(event) => {
                      formik.handleChange(event);
                      // Hour precision only applies to a same-day ride (Days = 1) —
                      // for a 2+ day tour the estimate is just a day count, so clear
                      // any leftover hours value once it's no longer 1.
                      if (Number(event.target.value) !== 1) {
                        formik.setFieldValue("estimatedDurationHours", undefined);
                      }
                    }}
                    onBlur={formik.handleBlur}
                    className="pr-12"
                  />
                  <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs">
                    days
                  </span>
                </div>
                {formik.values.estimatedDurationDays === 1 && (
                  <div className="relative flex-1">
                    <Input
                      id="estimatedDurationHours"
                      name="estimatedDurationHours"
                      type="number"
                      min={0}
                      max={23}
                      placeholder="0"
                      value={formik.values.estimatedDurationHours ?? ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="pr-12"
                    />
                    <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs">
                      hrs
                    </span>
                  </div>
                )}
              </div>
              <p className="text-muted-foreground text-xs">
                For a same-day ride, set Days to 1 and estimate the hours.
              </p>
            </Field>
          </CardContent>
        </Card>
      )}

      {currentStep.label === "Pricing & booking" && (
        <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <IndianRupee className="text-primary size-4" />
                <CardTitle>Pricing & booking</CardTitle>
              </div>
              <CardDescription>Razorpay settles in INR only, so the fee is in ₹.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Ride fee" htmlFor="rideFee" error={fieldError("rideFee")}>
                <div className="relative">
                  <IndianRupee className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <Input
                    id="rideFee"
                    name="rideFee"
                    type="number"
                    min={1}
                    step="0.01"
                    className="pl-9"
                    value={formik.values.rideFee ?? ""}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
              </Field>
              <Field
                label="Booking deadline"
                htmlFor="bookingDeadline"
                error={fieldError("bookingDeadline")}
              >
                <Input
                  id="bookingDeadline"
                  name="bookingDeadline"
                  type="datetime-local"
                  value={formik.values.bookingDeadline ?? ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </Field>
              <Field
                label="Minimum riders (optional)"
                htmlFor="minimumRiders"
                error={fieldError("minimumRiders")}
              >
                <Input
                  id="minimumRiders"
                  name="minimumRiders"
                  type="number"
                  min={1}
                  value={formik.values.minimumRiders ?? ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </Field>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {currentStep.label === "Inclusions" && (
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ListChecks className="text-primary size-4" />
                <CardTitle>What&apos;s included</CardTitle>
              </div>
              <CardDescription>Select everything covered by the ride fee.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {RIDE_INCLUSIONS.map((item) => (
                <label
                  key={item.value}
                  className="flex items-center gap-2 text-sm"
                  htmlFor={`inclusion-${item.value}`}
                >
                  <Checkbox
                    id={`inclusion-${item.value}`}
                    checked={(formik.values.inclusions ?? []).includes(item.value)}
                    onCheckedChange={(checked) => toggleInclusion(item.value, checked === true)}
                  />
                  {item.label}
                </label>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What&apos;s not included</CardTitle>
              <CardDescription>Optional — call out costs riders should expect to cover.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. Personal expenses"
                  value={exclusionDraft}
                  onChange={(event) => setExclusionDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addExclusion();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addExclusion}>
                  <Plus className="size-4" />
                  Add
                </Button>
              </div>
              {(formik.values.exclusions ?? []).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {(formik.values.exclusions ?? []).map((exclusion) => (
                    <Badge key={exclusion} variant="outline" className="gap-1">
                      {exclusion}
                      <button
                        type="button"
                        onClick={() => removeExclusion(exclusion)}
                        aria-label={`Remove ${exclusion}`}
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {currentStep.label === "Itinerary" && (
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="text-primary size-4" />
                <CardTitle>Trip itinerary</CardTitle>
              </div>
              <CardDescription>
                Optional — sketch out the plan for each day. You can always fill this in later.
              </CardDescription>
            </CardHeader>
          </Card>

          {(formik.values.itinerary ?? []).map((day, dayIndex) => (
            <Card key={dayIndex}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Day {day.day}</CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItineraryDay(dayIndex)}
                  >
                    <Trash2 className="size-4" />
                    Remove day
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {day.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex gap-2">
                    <Input
                      placeholder="Time (optional)"
                      className="w-32 shrink-0"
                      value={item.time ?? ""}
                      onChange={(event) =>
                        updateItineraryItem(dayIndex, itemIndex, "time", event.target.value)
                      }
                    />
                    <Input
                      placeholder="e.g. Breakfast at CCD"
                      value={item.label}
                      onChange={(event) =>
                        updateItineraryItem(dayIndex, itemIndex, "label", event.target.value)
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItineraryItem(dayIndex, itemIndex)}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="self-start"
                  onClick={() => addItineraryItem(dayIndex)}
                >
                  <Plus className="size-4" />
                  Add stop
                </Button>
              </CardContent>
            </Card>
          ))}

          <Button type="button" variant="outline" onClick={addItineraryDay} className="self-start">
            <Plus className="size-4" />
            Add day
          </Button>
        </motion.div>
      )}

      {isLastStep && (
        <>
          {isOrganized && (
            <Card>
              <CardHeader>
                <CardTitle>Cancellation policy</CardTitle>
                <CardDescription>Optional — shown to riders before they book.</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  rows={3}
                  placeholder="e.g. Full refund up to 7 days before the ride."
                  value={formik.values.cancellationPolicy ?? ""}
                  onChange={(event) => formik.setFieldValue("cancellationPolicy", event.target.value)}
                />
              </CardContent>
            </Card>
          )}

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

          <RidePreviewCard values={formik.values} coverImagePreview={coverImagePreview} />
        </>
      )}

      {isLastStep && (
        <p className="text-muted-foreground text-xs">
          {isOrganized
            ? "Anything not listed under “What's included” is the rider's own responsibility."
            : "Riders who join are responsible for their own expenses — fuel, food, accommodation, and any other costs. You're not expected to cover these as the organizer."}
        </p>
      )}

      {formError && <p className="text-destructive text-sm">{formError}</p>}

      <div className="flex items-center justify-between gap-3">
        {step > 0 ? (
          <Button type="button" variant="outline" onClick={() => goToStep(step - 1)}>
            <ChevronLeft className="size-4" />
            Back
          </Button>
        ) : (
          <span />
        )}
        {isLastStep ? (
          <Button key="submit" type="submit" disabled={isPending} size="lg">
            {isPending ? "Saving..." : mode === "create" ? "Create ride" : "Save changes"}
          </Button>
        ) : (
          <Button key="next" type="button" size="lg" onClick={handleNext}>
            Next
            <ChevronRight className="size-4" />
          </Button>
        )}
      </div>
    </form>
  );
}

function RidePreviewCard({
  values,
  coverImagePreview,
}: {
  values: RideFormValues;
  coverImagePreview: string | null;
}) {
  const rideType = RIDE_TYPES.find((type) => type.value === values.rideType);
  const RideTypeIcon = rideType ? RIDE_TYPE_ICONS[rideType.value] : ImageIcon;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-muted-foreground text-sm font-medium">Preview</p>
      <div className="bg-card ring-foreground/10 flex flex-col overflow-hidden rounded-2xl ring-1 sm:flex-row">
        <div className="from-secondary via-secondary/60 to-primary/30 relative aspect-4/3 w-full overflow-hidden bg-linear-to-br sm:w-56 sm:shrink-0">
          {coverImagePreview ? (
            // eslint-disable-next-line @next/next/no-img-element -- local object URL preview, not a next/image candidate
            <img src={coverImagePreview} alt="" className="h-full w-full object-cover" />
          ) : (
            <RideTypeIcon className="text-secondary-foreground/20 absolute -right-4 -bottom-4 size-24" />
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <p className="font-heading text-lg font-semibold">{values.title || "Untitled ride"}</p>
          <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            {values.rideDate && (
              <span className="flex items-center gap-1.5">
                <Calendar className="text-primary size-3.5" />
                {format(new Date(values.rideDate), "EEE, MMM d")}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Users className="text-primary size-3.5" />
              Up to {values.maxRiders} riders
            </span>
            {values.pricingModel === "organized" && values.rideFee && (
              <span className="flex items-center gap-1.5">
                <IndianRupee className="text-primary size-3.5" />₹{values.rideFee}
              </span>
            )}
          </div>
          {values.pricingModel === "organized" && values.bookingDeadline && (
            <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
              <Clock className="text-primary size-3.5 shrink-0" />
              Book by {format(new Date(values.bookingDeadline), "MMM d, h:mm a")}
            </p>
          )}
          {values.destination && (
            <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
              <MapPin className="text-primary size-3.5 shrink-0" />
              {values.destination}
            </p>
          )}
        </div>
      </div>
    </div>
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
