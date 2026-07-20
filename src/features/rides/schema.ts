import * as Yup from "yup";
import { RIDE_TYPES } from "@/constants/ride-type";
import { SPEED_LEVELS } from "@/constants/speed-level";
import { RIDER_LEVELS } from "@/constants/rider-level";

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export interface ItineraryItem {
  time?: string;
  label: string;
}

export interface ItineraryDay {
  day: number;
  items: ItineraryItem[];
}

export const rideSchema = Yup.object({
  title: Yup.string().trim().min(3, "Give your ride a title").required("Title is required"),
  description: Yup.string().trim().max(2000, "Keep it under 2000 characters").optional(),
  rideDate: Yup.string()
    .required("Ride date is required")
    .test("not-past", "Pick a date in the future", (value) => !value || value >= todayIsoDate()),
  departureTime: Yup.string().required("Departure time is required"),
  meetingPoint: Yup.string().trim().required("Set a meeting point on the map"),
  meetingLat: Yup.number().typeError("Set a meeting point on the map").required(),
  meetingLng: Yup.number().typeError("Set a meeting point on the map").required(),
  destination: Yup.string().trim().required("Set a destination on the map"),
  destinationLat: Yup.number().typeError("Set a destination on the map").required(),
  destinationLng: Yup.number().typeError("Set a destination on the map").required(),
  destinationMapUrl: Yup.string().trim().url("Enter a valid URL").optional(),
  city: Yup.string().trim().required("City is required"),
  maxRiders: Yup.number()
    .typeError("Enter a number")
    .integer("Enter a whole number")
    .min(1, "At least 1 rider")
    .when("pricingModel", {
      is: "organized",
      then: (schema) => schema.max(150, "150 riders max"),
      otherwise: (schema) => schema.max(20, "20 riders max"),
    })
    .required("Maximum riders is required"),
  rideType: Yup.string()
    .oneOf(
      RIDE_TYPES.map((type) => type.value),
      "Select a ride type",
    )
    .required("Select a ride type"),
  speed: Yup.string()
    .oneOf(
      SPEED_LEVELS.map((level) => level.value),
      "Select a speed",
    )
    .required("Select a speed"),
  difficulty: Yup.string()
    .oneOf(
      RIDER_LEVELS.map((level) => level.value),
      "Select a difficulty",
    )
    .required("Select a difficulty"),
  breakfastStop: Yup.boolean().required(),
  fuelStop: Yup.boolean().required(),
  helmetRequired: Yup.boolean().required(),
  pillionAllowed: Yup.boolean().required(),
  estimatedDistanceKm: Yup.number()
    .typeError("Enter a number")
    .min(0, "Can't be negative")
    .optional(),
  estimatedDurationDays: Yup.number()
    .typeError("Enter a number")
    .integer("Enter a whole number")
    .min(1, "At least 1 day")
    .when("pricingModel", {
      is: "organized",
      then: (schema) => schema.max(21, "21 days max"),
      otherwise: (schema) => schema.max(4, "4 days max"),
    })
    .optional(),
  estimatedDurationHours: Yup.number()
    .typeError("Enter a number")
    .integer("Enter a whole number")
    .min(0, "Can't be negative")
    .max(23, "23 hours max")
    .optional(),
  pricingModel: Yup.string()
    .oneOf(["community", "organized"], "Select a ride type")
    .required("Select a ride type"),
  rideFee: Yup.number()
    .typeError("Enter a number")
    .min(1, "Enter a fee")
    .when("pricingModel", {
      is: "organized",
      then: (schema) => schema.required("Ride fee is required"),
      otherwise: (schema) => schema.optional(),
    }),
  bookingDeadline: Yup.string().when("pricingModel", {
    is: "organized",
    then: (schema) => schema.required("Booking deadline is required"),
    otherwise: (schema) => schema.optional(),
  }),
  minimumRiders: Yup.number()
    .typeError("Enter a number")
    .integer("Enter a whole number")
    .min(1, "At least 1 rider")
    .optional(),
  cancellationPolicy: Yup.string().trim().max(1000, "Keep it under 1000 characters").optional(),
  inclusions: Yup.array(Yup.string().required()).optional(),
  exclusions: Yup.array(Yup.string().required()).optional(),
  itinerary: Yup.array(
    Yup.object({
      day: Yup.number().required(),
      items: Yup.array(
        Yup.object({
          time: Yup.string().optional(),
          label: Yup.string().required(),
        }),
      ).required(),
    }),
  ).optional(),
});

// rideType/speed/difficulty are widened to `string` (rather than Yup's
// inferred literal unions) so they can hold "" before a selection is made;
// the *Lat/*Lng fields allow `null` for "no point picked on the map yet" —
// rideSchema's `.required()` checks still enforce both at validation time.
export type RideFormValues = Omit<
  Yup.InferType<typeof rideSchema>,
  | "rideType"
  | "speed"
  | "difficulty"
  | "meetingLat"
  | "meetingLng"
  | "destinationLat"
  | "destinationLng"
  | "pricingModel"
  | "itinerary"
> & {
  rideType: string;
  speed: string;
  difficulty: string;
  meetingLat: number | null;
  meetingLng: number | null;
  destinationLat: number | null;
  destinationLng: number | null;
  pricingModel: string;
  itinerary: ItineraryDay[];
};
