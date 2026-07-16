const MINUTES_PER_DAY = 24 * 60;

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
