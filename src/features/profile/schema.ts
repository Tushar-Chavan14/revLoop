import * as Yup from "yup";
import { RIDER_LEVELS } from "@/constants/rider-level";

export { RIDER_LEVELS as EXPERIENCE_LEVELS } from "@/constants/rider-level";

export const profileSchema = Yup.object({
  name: Yup.string().trim().min(2, "Enter your full name").required("Name is required"),
  username: Yup.string()
    .trim()
    .lowercase()
    .matches(/^[a-z0-9_.]{3,30}$/, "3-30 characters: lowercase letters, numbers, . or _")
    .required("Username is required"),
  city: Yup.string().trim().required("City is required"),
  country: Yup.string().trim().required("Country is required"),
  bikeBrand: Yup.string().trim().required("Bike brand is required"),
  bikeModel: Yup.string().trim().required("Bike model is required"),
  experienceLevel: Yup.string()
    .oneOf(
      RIDER_LEVELS.map((level) => level.value),
      "Select your experience level",
    )
    .required("Select your experience level"),
  yearsRiding: Yup.number()
    .typeError("Enter a number")
    .min(0, "Can't be negative")
    .max(100, "Enter a realistic number")
    .required("Years riding is required"),
  bio: Yup.string().trim().max(280, "Keep it under 280 characters").optional(),
  instagramHandle: Yup.string()
    .trim()
    .matches(/^[a-zA-Z0-9_.]{1,30}$/, "Enter a valid handle, without @")
    .optional(),
});

// experienceLevel is widened to `string` (rather than Yup's inferred literal
// union) so it can hold "" before a selection is made or an unvalidated value
// loaded from the database; profileSchema.oneOf(...) still enforces the union
// at validation time.
export type ProfileFormValues = Omit<Yup.InferType<typeof profileSchema>, "experienceLevel"> & {
  experienceLevel: string;
};
