import { updateTag } from "next/cache";
import { PUBLIC_RIDES_TAG } from "@/constants/cache-tags";

/**
 * Call from a Server Action after any write that changes what visitors see
 * (rides, member counts, organizer names/photos). updateTag expires the
 * shared cache immediately, so the acting rider reads their own write on the
 * very next render instead of a stale copy.
 */
export function expirePublicRideCache() {
  updateTag(PUBLIC_RIDES_TAG);
}
