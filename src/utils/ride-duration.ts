const MINUTES_PER_DAY = 24 * 60;

interface RideTiming {
  ride_date: string | null;
  departure_time: string | null;
  estimated_duration_minutes: number | null;
}

// A ride's DB `status` is only ever flipped manually by an organizer, so a
// ride that already happened commonly still says "upcoming". This derives
// the *actual* end time from date + departure + estimated duration (falling
// back to end-of-day when no duration was set) so "My Rides" and the
// dashboard can bucket it as completed without relying on that manual flag.
export function hasRideEnded(ride: RideTiming, now = new Date()): boolean {
  if (!ride.ride_date) {
    return false;
  }
  const start = new Date(`${ride.ride_date}T${ride.departure_time ?? "00:00"}`);
  const end = ride.estimated_duration_minutes
    ? new Date(start.getTime() + ride.estimated_duration_minutes * 60_000)
    : new Date(`${ride.ride_date}T23:59:59`);
  return end < now;
}

/** Whether the ride's departure time has already passed. */
export function hasRideStarted(ride: RideTiming, now = new Date()): boolean {
  if (!ride.ride_date) {
    return false;
  }
  const start = new Date(`${ride.ride_date}T${ride.departure_time ?? "00:00"}`);
  return start <= now;
}

export type RideLifecycleStatus = "upcoming" | "ongoing" | "completed" | "cancelled";

interface RideLifecycleInput extends RideTiming {
  status: string | null;
}

/**
 * The rider-facing lifecycle of a ride, since the DB `status` column only
 * distinguishes upcoming/completed/cancelled and is rarely updated by hand:
 * - cancelled: explicit, always trusted as-is.
 * - completed: the organizer marked anyone's attendance (a deliberate "this
 *   happened" signal), OR the estimated duration has fully elapsed even if
 *   they never bothered (solo rides, forgetful organizers).
 * - ongoing: departure has passed but neither completion signal has fired yet.
 * - upcoming: departure hasn't happened yet.
 */
export function getRideLifecycleStatus(
  ride: RideLifecycleInput,
  anyAttendanceMarked: boolean,
  now = new Date(),
): RideLifecycleStatus {
  if (ride.status === "cancelled") {
    return "cancelled";
  }
  if (ride.status === "completed" || anyAttendanceMarked || hasRideEnded(ride, now)) {
    return "completed";
  }
  return hasRideStarted(ride, now) ? "ongoing" : "upcoming";
}

// A same-day ride is stored purely in hours (< 24h); a multi-day ride is
// stored as a whole number of days (`estimatedDurationDays` day-count × 24h) —
// see the day/hour split in ride-form.tsx and toDurationMinutes in
// ride-actions.ts. This reverses that back into a single human label.
export function formatRideDuration(totalMinutes: number | null | undefined): string | null {
  if (totalMinutes === null || totalMinutes === undefined) {
    return null;
  }

  if (totalMinutes < MINUTES_PER_DAY) {
    const hours = Math.round(totalMinutes / 60);
    return `${hours} hour${hours === 1 ? "" : "s"}`;
  }

  const days = Math.round(totalMinutes / MINUTES_PER_DAY);
  return `${days} day${days === 1 ? "" : "s"}`;
}
