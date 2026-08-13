import * as Yup from "yup";
import { RIDER_LEVELS } from "@/constants/rider-level";

export { RIDER_LEVELS as EXPERIENCE_LEVELS } from "@/constants/rider-level";

export const profileSchema = Yup.object({
  accountType: Yup.string().oneOf(["rider", "organizer"], "Select an account type").required(),
  name: Yup.string().trim().min(2, "Enter your full name").required("Name is required"),
  username: Yup.string()
    .trim()
    .lowercase()
    .matches(/^[a-z0-9_.]{3,30}$/, "3-30 characters: lowercase letters, numbers, . or _")
    .required("Username is required"),
  city: Yup.string().trim().required("City is required"),
  country: Yup.string().trim().required("Country is required"),
  bikeBrand: Yup.string()
    .trim()
    .when("accountType", {
      is: "rider",
      then: (schema) => schema.required("Bike brand is required"),
      otherwise: (schema) => schema.optional(),
    }),
  bikeModel: Yup.string()
    .trim()
    .when("accountType", {
      is: "rider",
      then: (schema) => schema.required("Bike model is required"),
      otherwise: (schema) => schema.optional(),
    }),
  experienceLevel: Yup.string()
    .oneOf(RIDER_LEVELS.map((level) => level.value))
    .when("accountType", {
      is: "rider",
      then: (schema) => schema.required("Select your experience level"),
      otherwise: (schema) => schema.optional(),
    }),
  yearsRiding: Yup.number()
    .typeError("Enter a number")
    .min(0, "Can't be negative")
    .max(100, "Enter a realistic number")
    .when("accountType", {
      is: "rider",
      then: (schema) => schema.required("Years riding is required"),
      otherwise: (schema) => schema.optional(),
    }),
  businessName: Yup.string()
    .trim()
    .when("accountType", {
      is: "organizer",
      then: (schema) => schema.required("Business name is required"),
      otherwise: (schema) => schema.optional(),
    }),
  primaryDestination: Yup.string()
    .trim()
    .when("accountType", {
      is: "organizer",
      then: (schema) => schema.required("Your signature destination is required"),
      otherwise: (schema) => schema.optional(),
    }),
  businessEmail: Yup.string()
    .trim()
    .email("Enter a valid email")
    .when("accountType", {
      is: "organizer",
      then: (schema) => schema.required("Business email is required"),
      otherwise: (schema) => schema.optional(),
    }),
  businessPhone: Yup.string()
    .trim()
    .when("accountType", {
      is: "organizer",
      then: (schema) => schema.required("Business phone is required"),
      otherwise: (schema) => schema.optional(),
    }),
  eventsOrganisedCount: Yup.number()
    .typeError("Enter a number")
    .integer("Enter a whole number")
    .min(0, "Can't be negative")
    .when("accountType", {
      is: "organizer",
      then: (schema) => schema.required("Enter a number (0 if you're just starting out)"),
      otherwise: (schema) => schema.optional(),
    }),
  bio: Yup.string().trim().max(280, "Keep it under 280 characters").optional(),
  instagramHandle: Yup.string()
    .trim()
    .matches(/^[a-zA-Z0-9_.]{1,30}$/, "Enter a valid handle, without @")
    .optional(),
});

// experienceLevel/accountType are widened to `string` (rather than Yup's
// inferred literal unions) so they can hold "" before a selection is made or
// an unvalidated value loaded from the database; profileSchema.oneOf(...)
// still enforces the union at validation time.
export type ProfileFormValues = Omit<
  Yup.InferType<typeof profileSchema>,
  "experienceLevel" | "accountType"
> & {
  experienceLevel: string;
  accountType: string;
};
