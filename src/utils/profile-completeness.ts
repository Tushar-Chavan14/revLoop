import type { Profile } from "@/services/profiles";

const REQUIRED_FIELDS: (keyof Profile)[] = [
  "name",
  "username",
  "city",
  "country",
  "bike_brand",
  "bike_model",
  "experience_level",
  "years_riding",
];

export function isProfileComplete(profile: Profile | null): boolean {
  if (!profile) {
    return false;
  }
  return REQUIRED_FIELDS.every((field) => profile[field] !== null && profile[field] !== "");
}
