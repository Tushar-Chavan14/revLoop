import type { Profile } from "@/services/profiles";
import type { OrganizerDetails } from "@/services/organizer-details";
import type { AppRole } from "@/services/roles";

const RIDER_REQUIRED_FIELDS: (keyof Profile)[] = [
  "name",
  "username",
  "city",
  "country",
  "bike_brand",
  "bike_model",
  "experience_level",
  "years_riding",
];

const ORGANIZER_REQUIRED_PROFILE_FIELDS: (keyof Profile)[] = ["name", "username", "city", "country"];

// role is a separate lookup now (user_roles), not a profiles column — pass
// whatever getMyRole()/getUserRole() returned for this profile's owner.
export function isProfileComplete(profile: Profile | null, role: AppRole): boolean {
  if (!profile) {
    return false;
  }
  const fields = role === "organizer" ? ORGANIZER_REQUIRED_PROFILE_FIELDS : RIDER_REQUIRED_FIELDS;
  return fields.every((field) => profile[field] !== null && profile[field] !== "");
}

// A profile row can exist for an organizer without its organizer_details row
// (rare partial-failure edge case in createProfile) — this catches that.
export function isOrganizerDetailsComplete(details: OrganizerDetails | null): boolean {
  return details !== null;
}
